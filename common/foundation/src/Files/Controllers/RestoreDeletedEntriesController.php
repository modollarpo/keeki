<?php

namespace Common\Files\Controllers;

use Illuminate\Routing\Controller;
use Common\Files\Actions\Deletion\RestoreEntries;
use Common\Files\FileEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * @tags Files
 */
class RestoreDeletedEntriesController extends Controller
{
    /**
     * Restore deleted files.
     *
     * @operationId restoreDeletedEntries
     */
    public function restore(Request $request)
    {
        $data = $request->validate([
            'entryIds' => 'required|array|exists:file_entries,id',
            'entryIds.*' => 'required|integer',
        ]);

        Gate::authorize('destroy', [FileEntry::class, $data['entryIds']]);

        (new RestoreEntries())->execute($data['entryIds']);

        return response()->noContent();
    }
}
