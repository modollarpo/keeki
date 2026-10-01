import {loginOptions, LoginPayload} from '@common/auth/auth-queries';
import {RegisterPayload, useRegister} from '@common/auth/requests/use-register';
import {PolicyCheckboxes} from '@common/auth/ui/register-page';
import {SocialAuthSection} from '@common/auth/ui/social-auth-section';
import {CaptchaContainer} from '@common/captcha/captcha-container';
import {useCaptcha} from '@common/captcha/use-captcha';
import {onFormQueryError} from '@common/http/errors/on-form-query-error';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Checkbox} from '@shadcn/forms/checkbox/checkbox';
import {Field} from '@shadcn/forms/field';
import {HookForm} from '@shadcn/forms/form/hook-form';
import {Input} from '@shadcn/forms/input/input';
import {toast} from '@shadcn/toast/toast';
import {useMutation} from '@tanstack/react-query';
import {setBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {cn} from '@ui/utils/cn';
import {Link} from 'react-router';
import {useForm} from 'react-hook-form';
import {
  playbackAuthGateState,
  PlaybackAuthGateMode,
  usePlaybackAuthGateStore,
} from './playback-auth-gate-store';

interface GateLoginResponse {
  two_factor?: boolean;
  bootstrapData?: string;
}

export function PlaybackAuthGateDialog() {
  const isOpen = usePlaybackAuthGateStore(s => s.isOpen);
  const mode = usePlaybackAuthGateStore(s => s.mode);
  const trackName = usePlaybackAuthGateStore(s => s.trackName);
  const {branding, registration} = useSettings();
  const isDarkMode = useIsDarkMode();

  const registrationEnabled = !registration?.disable;

  // registration can be turned off by the admin, in which case the dialog
  // becomes a plain sign-in prompt
  const activeMode: PlaybackAuthGateMode =
    registrationEnabled && mode === 'register' ? 'register' : 'login';

  const logoSrc = isDarkMode ? branding?.logo_light : branding?.logo_dark;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={open => {
        if (!open) playbackAuthGateState.close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content className="sm:max-w-110">
          <Dialog.Header className="items-center text-center">
            {logoSrc && (
              <img
                src={logoSrc}
                alt=""
                className="mx-auto mb-1 block h-8 w-auto"
              />
            )}
            <Dialog.Title className="justify-center text-lg">
              {activeMode === 'register' ? (
                <Trans message="Create a free account" />
              ) : (
                <Trans message="Welcome back" />
              )}
            </Dialog.Title>
            <Dialog.Description>
              {/* Mode-aware: the description previously always said "Sign in"
                  even while the Sign up tab was selected. */}
              {trackName ? (
                activeMode === 'register' ? (
                  <Trans
                    message="Create a free account to keep listening to :track and millions of other songs."
                    values={{track: trackName}}
                  />
                ) : (
                  <Trans
                    message="Sign in to keep listening to :track and millions of other songs."
                    values={{track: trackName}}
                  />
                )
              ) : activeMode === 'register' ? (
                <Trans message="Create a free account to start listening to millions of songs, free." />
              ) : (
                <Trans message="Sign in to start listening to millions of songs, free." />
              )}
            </Dialog.Description>
          </Dialog.Header>

          <Dialog.Body>
            {registrationEnabled && (
              <div className="bg-muted mb-5 grid grid-cols-2 gap-1 rounded-full p-1 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => playbackAuthGateState.setMode('register')}
                  className={cn(
                    'rounded-full py-1.5 transition-colors',
                    activeMode === 'register'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Trans message="Sign up" />
                </button>
                <button
                  type="button"
                  onClick={() => playbackAuthGateState.setMode('login')}
                  className={cn(
                    'rounded-full py-1.5 transition-colors',
                    activeMode === 'login'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Trans message="Sign in" />
                </button>
              </div>
            )}

            {activeMode === 'register' ? (
              <RegisterForm />
            ) : (
              <LoginForm />
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RegisterForm() {
  const {social} = useSettings();
  const {captchaToken, captchaEnabled, resetCaptcha} = useCaptcha('register');
  const form = useForm<RegisterPayload>();
  const register = useRegister(form, {
    redirect: false,
    onSuccess: () => playbackAuthGateState.completeAuth(),
  });

  return (
    <HookForm.Root
      form={form}
      onSubmit={async payload => {
        if (captchaEnabled && !captchaToken) {
          toast.error(<Trans message="Please solve the captcha challenge." />);
          return;
        }
        register.mutate(
          {...payload, captcha_token: captchaToken},
          {onError: () => resetCaptcha()},
        );
      }}
    >
      <Field.Group>
        <HookForm.Field name="email">
          <Field.Label>
            <Trans message="Email" />
          </Field.Label>
          <Input type="email" required />
          <Field.Error />
        </HookForm.Field>

        <HookForm.Field name="password">
          <Field.Label>
            <Trans message="Password" />
          </Field.Label>
          <Input type="password" required />
          <Field.Error />
        </HookForm.Field>

        <HookForm.Field name="password_confirmation">
          <Field.Label>
            <Trans message="Confirm password" />
          </Field.Label>
          <Input type="password" required />
          <Field.Error />
        </HookForm.Field>

        {captchaEnabled && <CaptchaContainer />}
        <PolicyCheckboxes />
        <Button
          className="mt-2 w-full"
          type="submit"
          variant="default"
          color="primary"
          disabled={register.isPending}
        >
          <Trans message="Create account" />
        </Button>
      </Field.Group>

      <SocialAuthSection
        dividerMessage={
          social?.compact_buttons ? (
            <Trans message="Or sign up with" />
          ) : (
            <Trans message="OR" />
          )
        }
      />
    </HookForm.Root>
  );
}

function LoginForm() {
  const {social} = useSettings();
  const navigate = useNavigate();
  const form = useForm<LoginPayload>({defaultValues: {remember: true}});

  const login = useMutation({
    ...loginOptions(),
    onSuccess: response => {
      const res = response as GateLoginResponse;
      // two-factor cannot be completed inline, fall back to the login page
      if (res.two_factor || !res.bootstrapData) {
        playbackAuthGateState.close();
        navigate('/login');
        return;
      }
      setBootstrapData(res.bootstrapData);
      playbackAuthGateState.completeAuth();
    },
    onError: r => onFormQueryError(r, form),
  });

  return (
    <HookForm.Root form={form} onSubmit={payload => login.mutate(payload)}>
      <Field.Group>
        <HookForm.Field name="email">
          <Field.Label>
            <Trans message="Email" />
          </Field.Label>
          <Input type="email" required />
          <Field.Error />
        </HookForm.Field>

        <HookForm.Field name="password">
          <div className="flex items-center justify-between gap-4">
            <Field.Label>
              <Trans message="Password" />
            </Field.Label>
            <Link className="text-sm hover:underline" to="/forgot-password">
              <Trans message="Forgot your password?" />
            </Link>
          </div>
          <Input type="password" required />
          <Field.Error />
        </HookForm.Field>

        <HookForm.Field name="remember">
          <Field.Label>
            <Checkbox />
            <Trans message="Stay signed in for a month" />
          </Field.Label>
        </HookForm.Field>

        <Button
          className="mt-2 w-full"
          type="submit"
          variant="default"
          color="primary"
          disabled={login.isPending}
        >
          <Trans message="Continue" />
        </Button>
      </Field.Group>

      <SocialAuthSection
        dividerMessage={
          social?.compact_buttons ? (
            <Trans message="Or sign in with" />
          ) : (
            <Trans message="OR" />
          )
        }
      />
    </HookForm.Root>
  );
}
