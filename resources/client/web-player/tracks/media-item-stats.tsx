import {FullAlbum} from '@app/web-player/albums/album';
import {FullArtist} from '@app/web-player/artists/artist';
import {Track} from '@app/web-player/tracks/track';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {HeartIcon, PlayIcon, Repeat2Icon} from 'lucide-react';

interface Props {
  item: Track | FullAlbum | FullArtist;
  className?: string;
  showPlays?: boolean;
}
export function MediaItemStats({item, className, showPlays = true}: Props) {
  return (
    <div
      className={clsx(
        'text-muted-foreground flex items-center gap-5 text-sm',
        className,
      )}
    >
      {showPlays && <PlayCount item={item} />}
      <LikesCount item={item} />
      {item.model_type !== 'artist' && <RepostsCount item={item} />}
    </div>
  );
}

interface PlayCountProps {
  item: Track | FullAlbum | FullArtist;
}
function PlayCount({item}: PlayCountProps) {
  if (!item.plays) return null;

  const count = (
    <FormattedNumber
      compactDisplay="short"
      notation="compact"
      value={item.plays}
    />
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="flex items-center">
        <PlayIcon className="mr-1 size-3.5" />
        {count}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message=":count plays" values={{count}} />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

interface LikesCountProps {
  item: Track | FullAlbum | FullArtist;
}
function LikesCount({item}: LikesCountProps) {
  if (!item.likes_count) return null;

  const count = <FormattedNumber value={item.likes_count} />;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="flex items-center">
        <HeartIcon className="mr-1 size-3.5" />
        {count}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message=":count likes" values={{count}} />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

interface RepostsCountProps {
  item: Track | FullAlbum;
}
function RepostsCount({item}: RepostsCountProps) {
  if (!item.reposts_count) return null;

  const count = <FormattedNumber value={item.reposts_count} />;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="flex items-center">
        <Repeat2Icon className="mr-1 size-3.5" />
        {count}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <Trans message=":count reposts" values={{count}} />
      </Tooltip.Content>
    </Tooltip.Root>
  );
}
