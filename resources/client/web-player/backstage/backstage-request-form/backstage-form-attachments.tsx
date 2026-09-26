import {UploadType} from '@app/site-config';
import {CreateBackstageRequestPayload} from '@app/web-player/backstage/requests/use-create-backstage-request';
import {retrieveUserOptions} from '@common/admin/users/users-queries';
import {useSocialLogin} from '@common/auth/requests/use-social-login';
import {useAuth} from '@common/auth/use-auth';
import {queryClient} from '@common/http/query-client';
import {restrictionsFromConfig} from '@common/uploads/uploader/create-file-upload';
import {useActiveUpload} from '@common/uploads/uploader/use-active-upload';
import {Button} from '@shadcn/button/button';
import {toast} from '@shadcn/toast/toast';
import {SiFacebook, SiX} from '@icons-pack/react-simple-icons';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {FileScanIcon, XIcon} from 'lucide-react';
import {ReactNode} from 'react';
import {useFormContext} from 'react-hook-form';

export function BackstageFormAttachments() {
  const {social} = useSettings();
  const {watch, setValue} = useFormContext<CreateBackstageRequestPayload>();
  const {connectSocial} = useSocialLogin();
  const passportScan = watch('passportScan');

  return (
    <div className="py-5">
      <div className="mb-3.5 text-sm">
        <Trans message="Speed up the process by connecting artist social media accounts or uploading your passport scan." />
      </div>
      {social?.twitter?.enable && (
        <Button
          type="button"
          variant="outline"
          className="mr-2.5 mb-2.5 md:mb-0"
          onClick={async () => {
            const e = await connectSocial('twitter');
            if (e?.status === 'SUCCESS') {
              queryClient.invalidateQueries({queryKey: ['users']});
              toast.success(<Trans message="Connected twitter account" />);
            }
          }}
        >
          <SiX data-icon="inline-start" className="text-twitter" />
          <Trans message="Connect to twitter" />
        </Button>
      )}
      {social?.facebook?.enable && (
        <Button
          type="button"
          variant="outline"
          className="mr-2.5 mb-2.5 md:mb-0"
          onClick={async () => {
            const e = await connectSocial('facebook');
            if (e?.status === 'SUCCESS') {
              queryClient.invalidateQueries({queryKey: ['users']});
              toast.success(<Trans message="Connected facebook account" />);
            }
          }}
        >
          <SiFacebook data-icon="inline-start" className="text-facebook" />
          <Trans message="Connect to facebook" />
        </Button>
      )}
      <PassportScanButton />
      <div className="mt-5">
        {passportScan && (
          <AttachmentLayout
            icon={<FileScanIcon className="size-6" />}
            title={<Trans message="Passport scan" />}
            description={`${passportScan.name} (${prettyBytes(
              passportScan.file_size,
            )})`}
            onRemove={() => {
              setValue('passportScan', undefined);
            }}
          />
        )}
        <SocialServiceAttachment service="twitter" />
        <SocialServiceAttachment service="facebook" />
      </div>
    </div>
  );
}

interface SocialServiceAttachmentProps {
  service: 'twitter' | 'facebook';
}
function SocialServiceAttachment({service}: SocialServiceAttachmentProps) {
  const {user} = useAuth();
  const {disconnectSocial} = useSocialLogin();
  const {data} = useQuery(
    retrieveUserOptions(user!.id, {
      include: 'social_profiles',
    }),
  );
  const account = data?.data.social_profiles?.find(
    s => s.service_name === service,
  );
  if (!account) return null;

  return (
    <AttachmentLayout
      icon={
        service === 'twitter' ? (
          <SiX className="size-6 text-twitter" />
        ) : (
          <SiFacebook className="size-6 text-facebook" />
        )
      }
      title={
        <span className="capitalize">
          <Trans message=":service account" values={{service}} />
        </span>
      }
      description={account.username}
      isDisabled={disconnectSocial.isPending}
      onRemove={() => {
        disconnectSocial.mutate(
          {service},
          {
            onSuccess: () => {
              queryClient.invalidateQueries({queryKey: ['users']});
            },
          },
        );
      }}
    />
  );
}

interface AttachmentLayoutProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  onRemove: () => void;
  isDisabled?: boolean;
}
function AttachmentLayout({
  icon,
  title,
  description,
  onRemove,
  isDisabled,
}: AttachmentLayoutProps) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded border px-3.5 py-2">
      <div className="shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-sm">{description}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-auto shrink-0"
        onClick={() => onRemove()}
        disabled={isDisabled}
      >
        <XIcon />
      </Button>
    </div>
  );
}

function PassportScanButton() {
  const {setValue} = useFormContext<CreateBackstageRequestPayload>();
  const {selectAndUploadFile} = useActiveUpload();

  const restrictions = restrictionsFromConfig({
    uploadType: UploadType.backstageAttachments,
  });
  const handleUpload = () => {
    selectAndUploadFile({
      showToastOnRestrictionFail: true,
      uploadType: UploadType.backstageAttachments,
      restrictions,
      onSuccess: entry => {
        setValue('passportScan', entry);
      },
    });
  };

  return (
    <Button type="button" variant="outline" onClick={() => handleUpload()}>
      <FileScanIcon data-icon="inline-start" className="text-primary" />
      <Trans message="Upload passport scan" />
    </Button>
  );
}
