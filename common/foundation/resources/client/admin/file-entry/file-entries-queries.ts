import {
  bulkDeleteFileEntries,
  listFileEntries,
  retrieveFileEntryModel,
} from '@app/gen/files';
import {ListFileEntriesParams} from '@app/gen/schemas/list-file-entries-params';
import {queryClient} from '@common/http/query-client';
import {mutationOptions, queryOptions} from '@tanstack/react-query';
import {FirstParam} from '@ui/utils/ts/extract-params';

export const fileEntriesBaseKey = ['file-entries'];

export const listFileEntriesOptions = (params: ListFileEntriesParams) =>
  queryOptions({
    queryKey: [...fileEntriesBaseKey, params],
    queryFn: () => listFileEntries(params),
  });

export const retrieveFileEntryModelOptions = (entryId: number) =>
  queryOptions({
    queryKey: [...fileEntriesBaseKey, entryId, 'model'],
    queryFn: () => retrieveFileEntryModel(entryId),
  });

export const deleteFileEntriesOptions = mutationOptions({
  mutationFn: (params: FirstParam<typeof bulkDeleteFileEntries>) =>
    bulkDeleteFileEntries(params),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: fileEntriesBaseKey,
    });
  },
});
