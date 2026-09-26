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

export interface DenyBackstageRequestPayload {
  notes?: string;
  requestId: number;
}

export function useDenyBackstageRequest() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: DenyBackstageRequestPayload) => denyRequest(payload),
    onSuccess: () => {
      toast.success(<Trans message="Request denied" />);
      navigate('/admin/backstage-requests');
      queryClient.invalidateQueries({
        queryKey: appQueries.backstageRequests.invalidateKey,
      });
    },
    onError: err => showHttpErrorToast(err),
  });
}

function denyRequest({requestId, ...payload}: DenyBackstageRequestPayload) {
  return apiClient
    .post<Response>(`backstage-request/${requestId}/deny`, payload)
    .then(r => r.data);
}
