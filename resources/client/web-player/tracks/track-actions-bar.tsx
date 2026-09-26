import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumContextDialog} from '@app/web-player/albums/album-context-dialog';
import {LikeButton} from '@app/web-player/library/like-button';
import {RepostButton} from '@app/web-player/reposts/repost-button';
import {ShareMediaDialog} from '@app/web-player/sharing/share-media-dialog';
import {TrackContextDialog} from '@app/web-player/tracks/context-dialog/track-context-dialog';
import {MediaItemStats} from '@app/web-player/tracks/media-item-stats';
import {Track} from '@app/web-player/tracks/track';
import {Button, type ButtonSize} from '@shadcn/button/button';
import {Dialog} from '@shadcn/dialog/dialog';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {MoreHorizontalIcon, Share2Icon} from 'lucide-react';
import {ReactNode} from 'react';

interface Props {
  item: Track | FullAlbum;
  managesItem: boolean;
  buttonClassName?: string;
  buttonGap?: string;
  buttonSize?: ButtonSize;
  children?: ReactNode;
  className?: string;
}
export function TrackActionsBar({
  item,
  managesItem,
  buttonClassName,
  buttonGap = 'mr-2',
  buttonSize = 'sm',
  children,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        '@container flex flex-col items-center justify-center gap-6 overflow-hidden md:flex-row md:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-y-6">
        {children}
        <LikeButton
          size={buttonSize}
          likeable={item}
          className={clsx(buttonGap, buttonClassName, 'max-md:hidden')}
          disabled={managesItem}
        />
        <RepostButton
          item={item}
          size={buttonSize}
          disabled={managesItem}
          className={clsx(
            buttonGap,
            buttonClassName,
            'hidden @[840px]:inline-flex',
          )}
        />
        <ShareMediaDialog item={item}>
          <Dialog.Trigger
            render={
              <Button
                size={buttonSize}
                variant="outline"
                className={clsx(
                  buttonGap,
                  buttonClassName,
                  'hidden @[660px]:inline-flex',
                )}
              />
            }
          >
            <Share2Icon data-icon="inline-start" />
            <Trans message="Share" />
          </Dialog.Trigger>
        </ShareMediaDialog>
        <Dropdown.Root>
          <Dropdown.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
                className={clsx(buttonGap, buttonClassName)}
              />
            }
          >
            <MoreHorizontalIcon data-icon="inline-start" />
            <Trans message="More" />
          </Dropdown.Trigger>
          <MoreDialog item={item} />
        </Dropdown.Root>
      </div>
      <MediaItemStats item={item} />
    </div>
  );
}

interface MoreDialogProps {
  item: Track | FullAlbum;
}
function MoreDialog({item}: MoreDialogProps) {
  if (item.model_type === 'track') {
    return <TrackContextDialog tracks={[item]} type="dropdown" />;
  }
  return <AlbumContextDialog album={item} type="dropdown" />;
}
