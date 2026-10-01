import {apiClient} from '@common/http/query-client';
import {useMutation} from '@tanstack/react-query';
import {setBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {UseFormReturn} from 'react-hook-form';
import {useParams} from 'react-router';
import {onFormQueryError} from '../../http/errors/on-form-query-error';
import {useNavigate} from '../../ui/navigation/use-navigate';
import {useAuth} from '../use-auth';

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirmation: string;
  invite_id?: string;
  invite_type?: string;
  captcha_token: string | null;
  registration_data?: any;
}

export interface RegisterResponse {
  bootstrapData: string;
  message?: string;
  status: 'success' | 'needs_email_verification';
}

interface UseRegisterOptions {
  // skip the automatic redirect after registering, so the mutation can be used
  // from a modal that resumes the action the visitor was trying to do
  redirect?: boolean;
  onSuccess?: (response: RegisterResponse) => void;
}

export function useRegister(
  form: UseFormReturn<RegisterPayload>,
  options?: UseRegisterOptions,
) {
  const navigate = useNavigate();
  const {getRedirectUri} = useAuth();
  const {inviteId} = useParams();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiClient
        .post<RegisterResponse>('/auth/register', {
          ...payload,
          invite_id: inviteId,
        })
        .then(response => response.data),
    onSuccess: response => {
      setBootstrapData(response.bootstrapData!);
      if (options?.redirect !== false) {
        if (response.status === 'needs_email_verification') {
          navigate('/');
        } else {
          navigate(getRedirectUri(), {replace: true});
        }
      }
      options?.onSuccess?.(response);
    },
    onError: r => onFormQueryError(r, form),
  });
}
