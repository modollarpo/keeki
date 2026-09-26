import {appQueries} from '@app/app-queries';
import {BackendResponse} from '@common/http/backend-response/backend-response';
import {showHttpErrorToast} from '@common/http/errors/show-http-error-toast';
import {apiClient, queryClient} from '@common/http/query-client';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {useMutation} from '@tanstack/react-query';
import {useNavigate} from 'react-router';

interface Response extends BackendResponse {
  //
}

interface Payload {
  requestId: number;
}

export function useDeleteBackstageRequest() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({requestId}: Payload) => deleteRequest(requestId),
    onSuccess: () => {
      toast.success(<Trans message="Request deleted" />);
      navigate('/admin/backstage-requests');
      queryClient.invalidateQueries({
        queryKey: appQueries.backstageRequests.invalidateKey,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function deleteRequest(requestId: number) {
  return apiClient
    .delete<Response>(`backstage-request/${requestId}`)
    .then(r => r.data);
}
