import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {BackendResponse} from '../../http/backend-response/backend-response';
import {showHttpErrorToast} from '../../http/errors/show-http-error-toast';
import {apiClient} from '../../http/query-client';

interface Response extends BackendResponse {
  //
}

interface Payload {
  commentIds: number[];
}

export function useRestoreComments() {
  return useMutation({
    mutationFn: (payload: Payload) => restoreComment(payload),
    onSuccess: (response, payload) => {
      toast.success(
        <Trans
          message="Restored [one 1 comment|other :count comments]"
          values={{count: payload.commentIds.length}}
        />,
      );
    },
    onError: err => showHttpErrorToast(err),
  });
}

function restoreComment({commentIds}: Payload): Promise<Response> {
  return apiClient.post('comment/restore', {commentIds}).then(r => r.data);
}
