import {
  TrackContextDialog,
  TrackContextDialogProps,
} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {Track} from '@app/web-player/tracks/track';
import {TrackTableContext} from '@app/web-player/tracks/track-table/track-table-context';
import {useContext, useMemo} from 'react';

interface TableTrackContextDialogProps extends Omit<
  TrackContextDialogProps,
  'tracks'
> {}
export function TableTrackContextDialog({
  children,
  ...props
}: TableTrackContextDialogProps) {
  const {selectedRows, data} = useContext(TrackTableContext);
  const tracks = useMemo(() => {
    return selectedRows
      .map(trackId => data.find(track => track.id === trackId))
      .filter(t => !!t) as Track[];
  }, [selectedRows, data]);
  return (
    <TrackContextDialog {...props} tracks={tracks}>
      {children}
    </TrackContextDialog>
  );
}
