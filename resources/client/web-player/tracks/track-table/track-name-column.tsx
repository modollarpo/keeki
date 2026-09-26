import {TrackOfflinedIndicator} from '@app/offline/entitiy-offline-indicator-icon';
import {useIsTrackCued} from '@app/web-player/tracks/hooks/use-is-track-cued';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useTrackTableMeta} from '@app/web-player/tracks/track-table/use-track-table-meta';
import {Skeleton} from '@ui/skeleton/skeleton';
import clsx from 'clsx';

interface TrackNameColumnProps {
  track: Track;
}
export function TrackNameColumn({track}: TrackNameColumnProps) {
  const {hideTrackImage, queueGroupId} = useTrackTableMeta();
  const isCued = useIsTrackCued(track.id, queueGroupId);

  return (
    <div className="flex items-center gap-3">
      {!hideTrackImage && (
        <TrackImage
          className="rounded-card-xs size-10 shrink-0 object-cover"
          track={track}
        />
      )}
      <div className="min-w-0 overflow-hidden">
        <div
          className={clsx(
            'overflow-hidden text-ellipsis',
            isCued && 'text-primary',
            'text-sm',
          )}
        >
          {track.name}
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <TrackOfflinedIndicator trackId={track.id} />
          {track.artists?.length ? (
            <div className="overflow-hidden text-sm text-ellipsis">
              {track.artists?.map(a => a.name).join(', ')}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TrackNameColumnPlaceholder() {
  const {hideTrackImage} = useTrackTableMeta();
  return (
    <div className="flex w-64 items-center gap-3">
      {!hideTrackImage && (
        <Skeleton className="rounded-card-xs size-10 shrink-0" variant="rect" />
      )}
      <div className="min-w-0 flex-1">
        <div className="leading-4">
          <Skeleton />
        </div>
        <div className="text-muted-foreground mt-1 w-full max-w-[60%] leading-4">
          <Skeleton />
        </div>
      </div>
    </div>
  );
}
