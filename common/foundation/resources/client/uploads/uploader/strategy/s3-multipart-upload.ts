import {
  abortS3MultipartUpload,
  batchSignS3PartUrls,
  completeS3MultipartUpload,
  createS3FileEntry,
  createS3MultipartUpload,
  getS3UploadedParts,
} from '@app/gen/files';
import {parseApiError} from '@common/http/errors/parsed-api-error';
import {UploadedFile} from '@ui/utils/files/uploaded-file';
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setInLocalStorage,
} from '@ui/utils/hooks/local-storage';
import axios, {AxiosInstance, AxiosProgressEvent} from 'axios';
import axiosRetry from 'axios-retry';
import {
  UploadStrategy,
  UploadStrategyConfigWithBackend,
} from './upload-strategy';

const oneMB = 1024 * 1024;
// chunk size that will be uploaded to s3 per request
const desiredChunkSize = 20 * oneMB;
// how many urls should be pre-signed per call to backend
const batchSize = 10;
// number of concurrent requests to s3 api
const concurrency = 5;

type ChunkState = {
  blob: Blob | File;
  done: boolean;
  etag?: string;
  partNumber: number;
  bytesUploaded: number;
};

type StoredUrl = {
  createdAt: string;
  uploadId: string;
  fileKey: string;
};

type UploadedPart = Awaited<
  ReturnType<typeof getS3UploadedParts>
>['parts'][number];

type SignedUrl = Awaited<
  ReturnType<typeof batchSignS3PartUrls>
>['urls'][number];

export class S3MultipartUpload implements UploadStrategy {
  private abortController: AbortController;
  private chunks: ChunkState[] = [];
  private uploadId?: string;
  private fileKey?: string;
  private readonly chunkAxios: AxiosInstance;
  private abortedByUser = false;
  private uploadedParts?: UploadedPart[];

  get storageKey(): string {
    return `s3-multipart::${this.file.fingerprint}`;
  }

  constructor(
    private file: UploadedFile,
    private config: UploadStrategyConfigWithBackend,
  ) {
    this.abortController = new AbortController();
    this.chunkAxios = axios.create();
    axiosRetry(this.chunkAxios, {retries: 3});
  }

  async start() {
    const storedUrl = getFromLocalStorage<StoredUrl>(this.storageKey);
    if (storedUrl) {
      await this.getUploadedParts(storedUrl);
    }

    if (!this.uploadedParts?.length) {
      await this.createMultipartUpload();
      if (!this.uploadId) return;
    }

    this.prepareChunks();

    const result = await this.uploadParts();
    if (result === 'done') {
      const isCompleted = await this.completeMultipartUpload();
      if (!isCompleted) return;

      // catch any errors so below "onError" handler gets executed
      try {
        const response = await this.createFileEntry();
        if (response?.data) {
          this.config.onSuccess?.(response.data, this.file);
          removeFromLocalStorage(this.storageKey);
          return;
        }
      } catch {
        //
      }
    }

    // upload failed
    if (!this.abortController.signal.aborted) {
      this.abortController.abort();
    }
    if (!this.abortedByUser) {
      this.config.onError?.(null, this.file);
    }
  }

  async abort() {
    this.abortedByUser = true;
    this.abortController.abort();
    await abortS3MultipartUpload({
      key: this.fileKey!,
      uploadId: this.uploadId!,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
    });
  }

  private async uploadParts(): Promise<any> {
    const pendingChunks = this.chunks.filter(c => !c.done);
    if (!pendingChunks.length) {
      return Promise.resolve('done');
    }

    const signedUrls = await this.batchSignUrls(
      pendingChunks.slice(0, batchSize),
    );
    if (!signedUrls) return;

    while (signedUrls.length) {
      const batch = signedUrls.splice(0, concurrency);
      const pendingUploads = batch.map(item => {
        return this.uploadPartToS3(item);
      });
      const result = await Promise.all(pendingUploads);
      // if not all uploads in batch completed, bail
      if (!result.every(r => r)) return;
    }

    return await this.uploadParts();
  }

  private async batchSignUrls(batch: ChunkState[]) {
    const response = await batchSignS3PartUrls({
      partNumbers: batch.map(i => i.partNumber),
      uploadId: this.uploadId!,
      key: this.fileKey!,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
    }).catch(() => {
      if (!this.abortController.signal.aborted) {
        this.abortController.abort();
      }
    });

    return response?.urls;
  }

  private async uploadPartToS3({
    url,
    partNumber,
  }: SignedUrl): Promise<boolean | void> {
    const chunk = this.chunks.find(c => c.partNumber === partNumber);
    if (!chunk) return;
    return this.chunkAxios
      .put(url, chunk.blob, {
        withCredentials: false,
        adapter: 'xhr',
        signal: this.abortController.signal,
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (!e.event.lengthComputable) return;

          chunk.bytesUploaded = e.loaded;
          const totalUploaded = this.chunks.reduce(
            (n, c) => n + c.bytesUploaded,
            0,
          );

          this.config.onProgress?.({
            bytesUploaded: totalUploaded,
            bytesTotal: this.file.size,
          });
        },
      })
      .then(r => {
        const etag = r.headers.etag;
        if (etag) {
          chunk.done = true;
          chunk.etag = etag;
          return true;
        }
      })
      .catch(err => {
        if (!this.abortController.signal.aborted && err !== undefined) {
          this.abortController.abort();
        }
      });
  }

  private async createMultipartUpload(): Promise<void> {
    const response = await createS3MultipartUpload({
      clientName: this.file.name,
      clientMime: this.file.mime,
      clientSize: this.file.size,
      clientExtension: this.file.extension,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
      ...this.config.metadata,
    }).catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        const parsedError = parseApiError(err);
        this.config.onError?.(parsedError.message, this.file);
      }
    });

    if (response) {
      this.uploadId = response.uploadId;
      this.fileKey = response.key;
      setInLocalStorage(this.storageKey, {
        createdAt: new Date().toISOString(),
        fileKey: this.fileKey,
        uploadId: this.uploadId,
      } as StoredUrl);
    }
  }

  private async getUploadedParts({fileKey, uploadId}: StoredUrl) {
    const response = await getS3UploadedParts({
      key: fileKey,
      uploadId,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
    }).catch(() => {
      removeFromLocalStorage(this.storageKey);
      return null;
    });
    if (response?.parts?.length) {
      this.uploadedParts = response.parts;
      this.uploadId = uploadId;
      this.fileKey = fileKey;
    }
  }

  private async completeMultipartUpload() {
    if (!this.fileKey || !this.uploadId) {
      return null;
    }

    return completeS3MultipartUpload({
      key: this.fileKey,
      uploadId: this.uploadId,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
      parts: this.chunks.map(c => ({
        ETag: c.etag!,
        PartNumber: c.partNumber!,
      })),
    })
      .catch(() => {
        this.config.onError?.(null, this.file);
        abortS3MultipartUpload({
          key: this.fileKey!,
          uploadId: this.uploadId!,
          uploadType: this.config.uploadType,
          backendId: this.config.backendId,
        });
      })
      .finally(() => {
        removeFromLocalStorage(this.storageKey);
      });
  }

  private async createFileEntry() {
    return await createS3FileEntry({
      ...this.config.metadata,
      clientMime: this.file.mime,
      clientName: this.file.name,
      clientSize: this.file.size,
      clientExtension: this.file.extension,
      filename: this.fileKey!.split('/').pop()!,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
    }).catch();
  }

  private prepareChunks() {
    this.chunks = [];
    // at least 5MB per request, at most 10k requests
    const minChunkSize = Math.max(5 * oneMB, Math.ceil(this.file.size / 10000));
    const chunkSize = Math.max(desiredChunkSize, minChunkSize);

    // Upload zero-sized files in one zero-sized chunk
    if (this.file.size === 0) {
      this.chunks.push({
        blob: this.file.native,
        done: false,
        partNumber: 1,
        bytesUploaded: 0,
      });
    } else {
      let partNumber = 1;
      for (let i = 0; i < this.file.size; i += chunkSize) {
        const end = Math.min(this.file.size, i + chunkSize);
        // check if this part was already uploaded previously
        const previouslyUploaded = this.uploadedParts?.find(
          p => p.PartNumber === partNumber,
        );
        this.chunks.push({
          blob: this.file.native.slice(i, end),
          done: !!previouslyUploaded,
          partNumber,
          etag: previouslyUploaded ? previouslyUploaded.ETag : undefined,
          bytesUploaded: previouslyUploaded?.Size
            ? previouslyUploaded?.Size
            : 0,
        });
        partNumber++;
      }
    }
  }

  static async create(
    file: UploadedFile,
    config: UploadStrategyConfigWithBackend,
  ): Promise<S3MultipartUpload> {
    return new S3MultipartUpload(file, config);
  }
}
