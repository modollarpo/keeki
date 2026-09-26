<?php

namespace Common\Files\S3;

use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Files\Actions\CreateFileEntry;
use Common\Files\Events\FileUploaded;
use Common\Files\FileEntry;
use Common\Files\FileEntryPayload;
use Common\Files\Resources\FileEntryResource;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

/**
 * @tags Files
 */
#[ExcludeRoutesFromPublicDocs]
class S3FileEntryController extends Controller
{
    /**
     * Create a new file entry
     *
     * @operationId createS3FileEntry
     */
    public function store(Request $request)
    {
        Gate::authorize('store', [FileEntry::class, request('parentId')]);

        $validatedData = $request->validate([
            'clientExtension' => 'required|string',
            'clientMime' => 'nullable|string|max:255',
            'clientName' => 'required|string',
            'clientSize' => 'required|int',
            'filename' => 'required|string',
            'parentId' => 'nullable|exists:file_entries,id',
            'relativePath' => 'nullable|string',
            'workspaceId' => 'nullable|int',
            'uploadType' => 'required|string',
            'backendId' => 'required|string',
            'ownerId' => 'nullable|int',
        ]);

        $payload = new FileEntryPayload($validatedData);

        $fileEntry = (new CreateFileEntry())->execute($payload);

        $fileEntry = $payload->uploadType->runHandler(
            $fileEntry,
            $validatedData,
        );

        event(new FileUploaded($fileEntry));

        return new FileEntryResource($fileEntry);
    }
}
