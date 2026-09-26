import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {getGenreLink} from '@app/web-player/genres/genre-link';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {TrackSeekbar} from '@app/web-player/player-controls/seekbar/track-seekbar';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {Track} from '@app/web-player/tracks/track';
import {TrackActionsBar} from '@app/web-player/tracks/track-actions-bar';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {trackIsLocallyUploaded} from '@app/web-player/tracks/utils/track-is-locally-uploaded';
import {
  CommentBarContext,
  CommentBarContextProvider,
} from '@app/web-player/tracks/waveform/comment-bar-context';
import {CommentBarNewCommentForm} from '@app/web-player/tracks/waveform/comment-bar-new-comment-form';
import {Waveform} from '@app/web-player/tracks/waveform/waveform';
import {PartialUserProfile} from '@app/web-player/users/user-profile';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {Badge} from '@shadcn/badge/badge';
import {FormattedRelativeTime} from '@ui/i18n/formatted-relative-time';
import {useSettings} from '@ui/settings/use-settings';
import clsx from 'clsx';
import {AnimatePresence} from 'framer-motion';
import {RepeatIcon} from 'lucide-react';
import {Fragment, memo, useContext} from 'react';
import {Link} from 'react-router';

interface TrackListItemProps {
  track: Track;
  queue?: Track[];
  reposter?: PartialUserProfile;
  className?: string;
  hideArtwork?: boolean;
  hideActions?: boolean;
  linksInNewTab?: boolean;
}
export const TrackListItem = memo(
  ({
    track,
    queue,
    reposter,
    className,
    hideArtwork = false,
    hideActions = false,
    linksInNewTab = false,
  }: TrackListItemProps) => {
    const {player} = useSettings();
    const {managesTrack} = useTrackPermissions([track]);

    const showWave =
      player?.seekbar_type === 'waveform' && trackIsLocallyUploaded(track);

    return (
      <div
        className={clsx(
          'overflow-hidden',
          !hideArtwork && 'md:flex md:gap-6',
          className,
        )}
      >
        {!hideArtwork && (
          <TrackImage
            track={track}
            className="shrink-0 rounded max-md:hidden"
            size="w-46 h-46"
          />
        )}
        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-3.5">
            <PlaybackToggleButton
              track={track}
              tracks={queue}
              buttonType="icon"
              equalizerColor="white"
            />
            <div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <ArtistLinks
                  artists={track.artists}
                  target={linksInNewTab ? '_blank' : undefined}
                />
                {reposter && (
                  <Fragment>
                    <RepeatIcon className="size-3" />
                    <UserProfileLink
                      user={reposter}
                      target={linksInNewTab ? '_blank' : undefined}
                    />
                  </Fragment>
                )}
              </div>
              <div>
                <TrackLink
                  track={track}
                  target={linksInNewTab ? '_blank' : undefined}
                />
              </div>
            </div>
            <div className="ml-auto text-sm">
              <FormattedRelativeTime date={track.created_at} />
              {track.genres?.length ? (
                <Badge
                  variant="secondary"
                  className="mt-1.5"
                  render={
                    <Link
                      to={getGenreLink(track.genres[0])}
                      target={linksInNewTab ? '_blank' : undefined}
                    />
                  }
                >
                  {track.genres[0].display_name || track.genres[0].name}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="mt-5">
            {showWave ? (
              <CommentBarContextProvider disableCommenting={hideActions}>
                <WaveformWithComments track={track} queue={queue} />
              </CommentBarContextProvider>
            ) : (
              <TrackSeekbar track={track} queue={queue} />
            )}
          </div>
          {!hideActions && (
            <TrackActionsBar
              item={track}
              managesItem={managesTrack}
              className="mt-5"
            />
          )}
        </div>
      </div>
    );
  },
);

interface WaveformWithCommentsProps {
  track: Track;
  queue?: Track[];
}
export function WaveformWithComments({
  track,
  queue,
}: WaveformWithCommentsProps) {
  const {markerIsVisible} = useContext(CommentBarContext);
  return (
    <Fragment>
      <Waveform track={track} queue={queue} />
      <AnimatePresence mode="wait">
        {markerIsVisible && (
          <CommentBarNewCommentForm className="mt-7 mb-2" commentable={track} />
        )}
      </AnimatePresence>
    </Fragment>
  );
}
