import {useCanOffline} from '@app/offline/use-can-offline';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {PageErrorMessage} from '@common/http/errors/page-error-message';
import {queryClient} from '@common/http/query-client';
import {NotFoundPage} from '@common/ui/not-found-page/not-found-page';
import {Button, LinkButton} from '@shadcn/button/button';
import {Empty} from '@shadcn/empty/empty';
import {Trans} from '@ui/i18n/trans';
import {isAxiosError} from 'axios';
import {WifiOffIcon} from 'lucide-react';
import {useState} from 'react';
import {useRouteError} from 'react-router';

export function PlayerPageErrorMessage() {
  const isOffline = useIsOffline();
  const error = useRouteError();
  console.warn(error);

  if (isAxiosError(error) && error.response?.status === 404) {
    return <NotFoundPage />;
  }

  return isOffline ? <OfflineMessage /> : <PageErrorMessage />;
}

function OfflineMessage() {
  const canOffline = useCanOffline();
  const [isRetrying, setIsRetrying] = useState(false);
  const handleRetry = async () => {
    setIsRetrying(true);
    await queryClient.resetQueries();
    setIsRetrying(false);
  };
  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <WifiOffIcon />
        </Empty.Media>
        <Empty.Title>
          <Trans message="Connect to the internet" />
        </Empty.Title>
        <Empty.Description>
          <Trans message="You're offline. Check your connection." />
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        {canOffline && (
          <LinkButton variant="default" color="primary" to="/library/downloads">
            <Trans message="Go to downloads" />
          </LinkButton>
        )}
        <Button
          variant="outline"
          onClick={() => {
            handleRetry();
          }}
          disabled={isRetrying}
        >
          <Trans message="Retry" />
        </Button>
      </Empty.Content>
    </Empty>
  );
}
