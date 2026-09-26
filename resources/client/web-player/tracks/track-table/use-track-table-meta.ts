import {
  TrackTableContext,
  TrackTableMeta,
} from '@app/web-player/tracks/track-table/track-table-context';
import {useContext} from 'react';

const stableObj: TrackTableMeta = {};

export type {TrackTableMeta};

export function useTrackTableMeta() {
  const {meta} = useContext(TrackTableContext);
  return meta || stableObj;
}
