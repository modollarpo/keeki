import {createS3FileEntry, presignS3PostUrl} from '@app/gen/files';
import {parseApiError} from '@common/http/errors/parsed-api-error';
import {UploadedFile} from '@ui/utils/files/uploaded-file';
import axios, {AxiosProgressEvent} from 'axios';
import {
  UploadStrategy,
  UploadStrategyConfigWithBackend,
} from './upload-strategy';

type PresignedRequest = Awaited<ReturnType<typeof presignS3PostUrl>>;

export class S3Upload implements UploadStrategy {
  private abortController: AbortController;
  private presignedRequest?: PresignedRequest;

  constructor(
    private file: UploadedFile,
    private config: UploadStrategyConfigWithBackend,
  ) {
    this.abortController = new AbortController();
  }

  async start() {
    this.presignedRequest = (await this.presignPostUrl()) ?? undefined;
    if (!this.presignedRequest) return;

    const result = await this.uploadFileToS3();
    if (result !== 'uploaded') return;

    const response = await this.createFileEntry();
    if (response?.data) {
      this.config.onSuccess?.(response.data, this.file);
    } else if (!this.abortController.signal) {
      this.config.onError?.(null, this.file);
    }
  }

  abort() {
    this.abortController.abort();
    return Promise.resolve();
  }

  private presignPostUrl(): Promise<PresignedRequest | void> {
    return presignS3PostUrl(
      {
        clientName: this.file.name,
        clientMime: this.file.mime,
        clientSize: this.file.size,
        clientExtension: this.file.extension,
        uploadType: this.config.uploadType,
        backendId: this.config.backendId,
        ...this.config.metadata,
      },
      {signal: this.abortController.signal},
    ).catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        const parsedError = parseApiError(err);
        this.config.onError?.(parsedError.message, this.file);
      }
    });
  }

  private uploadFileToS3() {
    const {url, acl} = this.presignedRequest!;
    return axios
      .put(url, this.file.native, {
        adapter: 'xhr',
        signal: this.abortController.signal,
        withCredentials: false,
        headers: {
          'Content-Type': this.file.mime,
          'x-amz-acl': acl,
        },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.event.lengthComputable) {
            this.config.onProgress?.({
              bytesUploaded: e.loaded,
              bytesTotal: e.total || 0,
            });
          }
        },
      })
      .then(() => 'uploaded')
      .catch(err => {
        if (err.code !== 'ERR_CANCELED') {
          const parsedError = parseApiError(err);
          this.config.onError?.(parsedError.message, this.file);
        }
      });
  }

  private async createFileEntry() {
    return await createS3FileEntry({
      ...this.config.metadata,
      clientMime: this.file.mime,
      clientName: this.file.name,
      clientSize: this.file.size,
      clientExtension: this.file.extension,
      filename: this.presignedRequest!.key.split('/').pop()!,
      uploadType: this.config.uploadType,
      backendId: this.config.backendId,
    }).catch(err => {
      if (err.code !== 'ERR_CANCELED') {
        const parsedError = parseApiError(err);
        this.config.onError?.(parsedError.message, this.file);
      }
    });
  }

  static async create(
    file: UploadedFile,
    config: UploadStrategyConfigWithBackend,
  ): Promise<S3Upload> {
    return new S3Upload(file, config);
  }
}
