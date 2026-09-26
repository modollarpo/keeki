import {
  offlinedEntitiesStore,
  useOfflineEntitiesStore,
} from '@app/offline/offline-entities-store';
import {offlineQueue} from '@app/offline/offline-queue';
import {Button} from '@shadcn/button/button';
import {Trans} from '@ui/i18n/trans';
import {ProgressBar} from '@ui/progress/progress-bar';
import {XIcon} from 'lucide-react';
import {useEffect, useState} from 'react';

export function OfflineQueueToast() {
  const offlineQueueSize = useOfflineEntitiesStore(s => s.offlineQueue.size);
  const [downloadProgressTotal, setDownloadProgressTotal] = useState(() =>
    downloadProgressToTotal(offlineQueue.getDownloadProgress()),
  );

  useEffect(() => {
    let prevProgress = 0;
    return offlineQueue.listen('onActiveDownloadsChanged', progress => {
      const newProgress = downloadProgressToTotal(progress);
      if (newProgress !== prevProgress) {
        setDownloadProgressTotal(newProgress);
      }
      prevProgress = newProgress;
    });
  }, []);

  return (
    <div className="z-toast bg fixed top-3 right-3 left-3 mx-auto flex max-w-max min-w-80 items-center gap-2.5 overflow-hidden rounded-lg border p-3 shadow-sm">
      <div className="text-foreground mr-auto text-sm">
        <div className="mb-0.5">
          <Trans
            message="Downloading :count tracks..."
            values={{count: offlineQueueSize}}
          />
        </div>
        <div className="text-muted-foreground text-xs">
          <Trans message="Keep window open to continue" />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          offlinedEntitiesStore().setOfflineToastVisible(false);
        }}
      >
        <XIcon />
      </Button>
      <ProgressBar
        size="xs"
        value={downloadProgressTotal}
        isIndeterminate={
          downloadProgressTotal === 100 || downloadProgressTotal === 0
        }
        className="absolute right-0 bottom-0 left-0"
        trackHeight="h-0.5"
      />
    </div>
  );
}

function downloadProgressToTotal(progress: Map<number, number>): number {
  const array = Array.from(progress.values()).map(d => d);
  if (array.length === 0) {
    return 0;
  }
  return Math.trunc(
    array.reduce((acc, value) => acc + value, 0) / array.length,
  );
}
