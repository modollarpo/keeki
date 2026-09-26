import {offlinedMediaItems} from '@app/offline/offline-media-items';
import {offlinedTracks} from '@app/offline/offlined-tracks';
import {clearPlaybackData} from '@app/offline/playback-data-storage';
import {AlertDialog} from '@shadcn/alert-dialog/alert-dialog';
import {Button} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Spinner} from '@shadcn/spinner/spinner';
import {Trans} from '@ui/i18n/trans';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {useCallback, useEffect, useState} from 'react';

type BrowserUsageDetails = {
  caches: number;
  indexeddb: number;
  serviceWorkerRegistrations: number;
};

type UsageDetails = {
  used: number;
  available: number;
  usedPretty: string;
  availablePretty: string;
};

const FIVE_MB = 5_000_000;
const ONE_MB = 1_000_000;

async function getUsage(): Promise<UsageDetails> {
  const estimate = await navigator.storage.estimate();

  let used = estimate.usage ?? 0;
  let available = estimate.quota ?? 0;

  if (used) {
    const usageDetails = (estimate as any)
      .usageDetails as BrowserUsageDetails | null;
    if (usageDetails) {
      used =
        used - (usageDetails.caches + usageDetails.serviceWorkerRegistrations);
    } else {
      // js, shell and other assets cached by service worker takes around this much space
      used = used - FIVE_MB;
    }
  }

  return {
    used,
    available,
    usedPretty: prettyBytes(used),
    availablePretty: prettyBytes(available),
  };
}

type DownloadsSettingsDialogProps = {
  children?: Dialog.TriggerElement;
};

export function DownloadsSettingsDialog({
  children,
}: DownloadsSettingsDialogProps) {
  return (
    <Dialog.Root>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <DownloadsSettingsDialogContent />
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DownloadsSettingsDialogContent() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usage, setUsage] = useState<UsageDetails | null>(null);
  const anySpaceUsed = usage?.used && usage.used > ONE_MB;

  const refreshUsage = useCallback(
    () => getUsage().then(data => setUsage(data)),
    [],
  );

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  const handleClearAll = async () => {
    setConfirmOpen(false);
    setIsDeleting(true);
    await Promise.allSettled([
      offlinedMediaItems.clear(),
      offlinedTracks.clear(),
      clearPlaybackData(),
    ]);
    await refreshUsage();
    setIsDeleting(false);
  };

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>
          <Trans message="Space usage" />
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        {usage == null ? (
          <div className="flex min-h-10 items-center">
            <Spinner />
          </div>
        ) : (
          <Dialog.Description>
            <UsageMessage usage={usage} />
          </Dialog.Description>
        )}
      </Dialog.Body>
      <Dialog.Footer className={anySpaceUsed ? 'sm:justify-between' : undefined}>
        {anySpaceUsed ? (
          <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialog.Trigger
              disabled={isDeleting}
              render={<Button variant="outline" />}
            >
              {isDeleting ? <Spinner /> : null}
              <Trans message="Delete downloaded content" />
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Backdrop />
              <AlertDialog.Content size="sm">
                <AlertDialog.Header>
                  <AlertDialog.Title>
                    <Trans message="Delete downloaded content" />
                  </AlertDialog.Title>
                  <AlertDialog.Description>
                    <Trans message="Are you sure you want to delete all downloaded content?" />
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>
                    <Trans message="Cancel" />
                  </AlertDialog.Cancel>
                  <AlertDialog.Action color="danger" onClick={handleClearAll}>
                    <Trans message="Delete" />
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        ) : null}
        <Dialog.CloseButton render={<Button />}>
          <Trans message="Done" />
        </Dialog.CloseButton>
      </Dialog.Footer>
    </Dialog.Content>
  );
}

type UsageMessageProps = {
  usage: UsageDetails;
};
function UsageMessage({usage}: UsageMessageProps) {
  if (!usage || usage.used < ONE_MB)
    return (
      <Trans message="Music downloaded for offline playback is currently using less then 1mb of space." />
    );
  return (
    <Trans
      message="Music downloaded for offline playback is currently using approximately :used of :available availble space."
      values={{
        used: usage.usedPretty,
        available: usage.availablePretty,
      }}
    />
  );
}
