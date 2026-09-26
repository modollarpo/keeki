import {appQueries} from '@app/app-queries';
import {Genre, GENRE_MODEL} from '@app/web-player/genres/genre';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useMutation} from '@tanstack/react-query';

interface Payload {
  genre: Genre;
}

export function useImportGenreContent() {
  return useMutation({
    mutationFn: (props: Payload) =>
      apiClient
        .post('import-media/single-item', {
          modelType: GENRE_MODEL,
          genreId: props.genre.id,
        })
        .then(r => r.data),
    onSuccess: () => {
      toast.success(<Trans message="Content imported" />);
      queryClient.invalidateQueries({
        queryKey: appQueries.genres.invalidateKey,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}
