<?php

namespace Common\Files\S3;

use Carbon\Carbon;
use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Files\Actions\FileUploadValidator;
use Common\Files\FileEntry;
use Common\Files\S3\InteractsWithS3Api;
use Common\Files\Uploads\Uploads;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

/**
 * @tags Files
 */
#[ExcludeRoutesFromPublicDocs]
class S3MultipartUploadController extends Controller
{
    use InteractsWithS3Api;

    /**
     * Create s3 multipart upload
     *
     * @operationId createS3MultipartUpload
     */
    public function create(Request $request)
    {
        Gate::authorize('store', [
            FileEntry::class,
            request('parentId'),
            request('uploadType'),
        ]);

        $data = $request->validate([
            'clientName' => 'required|string',
            'clientSize' => 'required|integer',
            'clientExtension' => 'required|string',
            'clientMime' => 'required|string',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
            'parentId' => 'nullable|integer',
            'relativePath' => 'nullable|string',
            'workspaceId' => 'nullable|integer',
            'ownerId' => 'nullable|integer',
        ]);

        $uploadType = Uploads::type($data['uploadType']);
        $errors = FileUploadValidator::validateForUploadType(
            uploadType: $uploadType,
            fileSize: $data['clientSize'],
            extension: $data['clientExtension'],
            mime: $data['clientMime'],
            userId: $data['ownerId'] ?? Auth::id(),
        );
        if ($errors) {
            abort(422, $errors->first());
        }

        $result = $this->getClient($data)->createMultipartUpload([
            'Key' => $this->buildFileKey($data),
            'Bucket' => $this->getBucket(),
            'ContentType' => $data['clientMime'],
            'ACL' => $uploadType->getS3ACL(),
        ]);

        return response()->json([
            'key' => $result['Key'],
            'uploadId' => $result['UploadId'],
            'acl' => $uploadType->getS3ACL(),
        ]);
    }

    /**
     * Get s3 uploaded parts
     *
     * @operationId getS3UploadedParts
     */
    public function getUploadedParts(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string',
            'uploadId' => 'required|string',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
        ]);

        $data = $this->getClient($data)->listParts([
            'Bucket' => $this->getBucket(),
            'Key' => $data['key'],
            'UploadId' => $data['uploadId'],
            'PartNumberMarker' => 0,
        ]);

        return response()->json([
            /** @var array<array{PartNumber: int, ETag: string, Size: int, LastModified: string}> */
            'parts' => $data['Parts'],
        ]);
    }

    /**
     * Batch sign s3 part urls
     *
     * @operationId batchSignS3PartUrls
     */
    public function batchSignPartUrls(Request $request)
    {
        $data = $request->validate([
            'partNumbers' => 'required|array|min:1',
            'partNumbers.*' => 'required|integer',
            'uploadId' => 'required|string',
            'key' => 'required|string',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
        ]);

        $urls = [];

        foreach ($data['partNumbers'] as $partNumber) {
            $url = $this->getPartUrl($partNumber, $data);
            $urls[] = ['url' => $url, 'partNumber' => $partNumber];
        }

        return response()->json([
            /** @var array<array{url: string, partNumber: integer}> */
            'urls' => $urls,
        ]);
    }

    /**
     * Complete s3 multipart upload
     *
     * @operationId completeS3MultipartUpload
     */
    public function complete(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string',
            'uploadId' => 'required|string',
            'parts' => 'required|array|min:1',
            'parts.*.ETag' => 'required|string',
            'parts.*.PartNumber' => 'required|integer',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
        ]);

        $data = $this->getClient($data)->completeMultipartUpload([
            'Bucket' => $this->getBucket(),
            'Key' => $data['key'],
            'UploadId' => $data['uploadId'],
            'MultipartUpload' => [
                'Parts' => $data['parts'],
            ],
        ]);

        return response()->json([
            'location' => $data['Location'],
        ]);
    }

    /**
     * Abort s3 multipart upload
     *
     * @operationId abortS3MultipartUpload
     */
    public function abort(Request $request)
    {
        $data = $request->validate([
            'key' => 'required|string',
            'uploadId' => 'required|string',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
        ]);

        $this->getClient($data)->abortMultipartUpload([
            'Bucket' => $this->getBucket(),
            'Key' => $data['key'],
            'UploadId' => $data['uploadId'],
        ]);

        return response()->noContent();
    }

    /**
     * Get s3 part url
     *
     * @operationId getS3PartUrl
     */
    protected function getPartUrl(string $partNumber, array $data): string
    {
        $command = $this->getClient($data)->getCommand('UploadPart', [
            'Bucket' => $this->getBucket(),
            'Key' => $data['key'],
            'UploadId' => $data['uploadId'],
            'PartNumber' => $partNumber,
        ]);
        $s3Request = $this->getClient($data)->createPresignedRequest(
            $command,
            Carbon::now()->addMinutes(30),
        );

        return (string) $s3Request->getUri();
    }
}
