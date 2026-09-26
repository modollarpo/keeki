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
class S3SimpleUploadController extends Controller
{
    use InteractsWithS3Api;

    /**
     * Presign s3 post url
     *
     * @operationId presignS3PostUrl
     */
    public function presignPost(Request $request)
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

        $fileKey = $this->buildFileKey($data);

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

        $command = $this->getClient($data)->getCommand('PutObject', [
            'Bucket' => $this->getBucket(),
            'ContentType' => $data['clientMime'],
            'Key' => $fileKey,
            'ACL' => $uploadType->getS3ACL(),
        ]);

        $uri = $this->getClient($data)
            ->createPresignedRequest($command, Carbon::now()->addHour())
            ->getUri();

        return response()->json([
            'url' => $uri,
            'key' => $fileKey,
            'acl' => $uploadType->getS3ACL(),
        ]);
    }
}
