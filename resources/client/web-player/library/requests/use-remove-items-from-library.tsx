import {Likeable} from '@app/web-player/library/likeable';
import {userLibrary} from '@app/web-player/library/state/likes-store';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';

interface Response extends BackendResponse {}

interface Payload {
  likeables: Likeable[];
}

export function useRemoveItemsFromLibrary() {
  return useMutation({
    mutationFn: (payload: Payload) => addToLibrary(payload),
    onSuccess: (response, payload) => {
      toast.success(getMessage(payload.likeables[0]));
      userLibrary().remove(payload.likeables);
      // tracks/albums/artists
      queryClient.invalidateQueries({
        queryKey: [`${payload.likeables[0].model_type}s`, 'library'],
      });
    },
    onError: r => showHttpErrorToast(r),
  });
}

function addToLibrary(payload: Payload): Promise<Response> {
  const likeables = payload.likeables
    .filter(likeable => {
      return userLibrary().has(likeable);
    })
    .map(likeable => {
      return {
        likeable_id: likeable.id,
        likeable_type: likeable.model_type,
      };
    });
  return apiClient
    .post('users/me/remove-from-library', {likeables})
    .then(r => r.data);
}

function getMessage(likeable: Likeable) {
  switch (likeable.model_type) {
    case 'artist':
      return <Trans message="Removed from your artists" />;
    case 'album':
      return <Trans message="Removed from your albums" />;
    case 'track':
      return <Trans message="Removed from your liked songs" />;
  }
}
