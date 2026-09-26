import {useAdminSettings} from '@common/admin/settings/use-admin-settings';
import {Alert} from '@shadcn/alert/alert';
import {LinkButton} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {CircleAlertIcon} from 'lucide-react';
import {useMatch} from 'react-router';

export function OutoingEmailNotSetupWarning() {
  const match = useMatch('/admin/settings/email/:page');
  const {data} = useAdminSettings();
  const mailSetup = data?.server.mail_setup;
  if (mailSetup) return null;

  const isOutgoingPage = match?.params.page === 'outgoing';

  return (
    <Alert.Root variant="destructive" fillStyle="subtleFill">
      <CircleAlertIcon />
      <Alert.Title>
        <Trans message="Outgoing email is not configured" />
      </Alert.Title>
      <Alert.Description>
        <Trans message="Please configure outgoing email or app emails will not be sent out properly." />
      </Alert.Description>
      {!isOutgoingPage && (
        <Alert.Action>
          <LinkButton
            variant="default"
            size="sm"
            to="/admin/settings/email/outgoing#provider"
            className="border-white bg-white text-black hover:bg-white hover:text-black"
          >
            <Trans message="Fix now" />
          </LinkButton>
        </Alert.Action>
      )}
    </Alert.Root>
  );
}
