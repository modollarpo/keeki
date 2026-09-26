import {useMutation} from '@tanstack/react-query';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import {UseFormReturn} from 'react-hook-form';
import {BackendResponse} from '../http/backend-response/backend-response';
import {onFormQueryError} from '../http/errors/on-form-query-error';
import {apiClient} from '../http/query-client';
import {useNavigate} from '../ui/navigation/use-navigate';

interface Response extends BackendResponse {}

export interface ContactPagePayload {
  name: string;
  email: string;
  message: string;
  captcha_token: string | null;
}

export function useSubmitContactForm(form: UseFormReturn<ContactPagePayload>) {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (props: ContactPagePayload) => submitContactForm(props),
    onSuccess: () => {
      toast.success(<Trans message="Your message has been submitted." />);
      navigate('/');
    },
    onError: err => onFormQueryError(err, form),
  });
}

function submitContactForm(payload: ContactPagePayload): Promise<Response> {
  return apiClient.post('contact-page', payload).then(r => r.data);
}
