import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {PlayableModel} from '@app/web-player/playable-item/playable-model';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {Track, TRACK_MODEL} from '@app/web-player/tracks/track';
import {usePlayerStore} from '@common/player/hooks/use-player-store';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Button, type ButtonSize} from '@shadcn/button/button';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {cn} from '@ui/utils/cn';
import clsx from 'clsx';
import {MoreHorizontalIcon} from 'lucide-react';
import {cloneElement, ReactElement, ReactNode, useState} from 'react';

interface PlayableGridProps {
  image: ReactElement<{size: string; className?: string}>;
  title: ReactNode;
  subtitle?: ReactNode;
  model: PlayableModel;
  newQueue?: Track[];
  link: string;
  likeButton?: ReactElement<{size?: ButtonSize; className?: string}>;
  contextDialog: ReactElement<{type?: 'dropdown' | 'contextMenu'}>;
  radius?: string;
  layout?: ContentGridItemLayout;
}
export function PlayableGridItem(props: PlayableGridProps) {
  if (props.layout === 'compact') {
    return <CompactGridItem {...props} />;
  }
  return <DefaultGridItem {...props} />;
}

function DefaultGridItem({
  image,
  title,
  subtitle,
  model,
  newQueue,
  link,
  likeButton,
  contextDialog,
  radius = 'rounded-card',
}: PlayableGridProps) {
  const navigate = useNavigate();
  return (
    <div className="snap-start snap-normal">
      <ContextMenu>
        <ContextMenu.Trigger className="group relative isolate w-full">
          <div
            className="this aspect-square w-full"
            onClick={() => navigate(link)}
          >
            {cloneElement(image, {
              size: 'w-full h-full',
              className: `${radius} shadow-md z-10`,
            })}
          </div>
          <div
            key="bg-overlay"
            className={`absolute top-0 left-0 h-full w-full bg-linear-to-b from-transparent to-black/75 ${radius} pointer-events-none z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          />
          <div
            className={clsx(
              'absolute bottom-0 left-0 z-30 flex w-full items-center gap-3.5 p-3',
              radius === 'rounded-full' &&
                'pointer-events-none top-0 right-0 justify-center',
            )}
          >
            <PlaybackToggleButton
              className={cn(
                'pointer-events-auto border-white bg-white text-black shadow-md hover:bg-white',
                radius === 'rounded-full' && 'invisible group-hover:visible',
              )}
              buttonType="icon"
              track={model.model_type === TRACK_MODEL ? model : undefined}
              tracks={newQueue}
              queueId={queueGroupId(model)}
            />

            {radius !== 'rounded-full' && (
              <Dropdown.Root>
                <Dropdown.Trigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible text-white hover:bg-white/20 md:group-hover:visible"
                      color="white"
                    />
                  }
                >
                  <MoreHorizontalIcon className="size-5" />
                </Dropdown.Trigger>
                {cloneElement(contextDialog, {
                  type: 'dropdown',
                })}
              </Dropdown.Root>
            )}
            {radius !== 'rounded-full' &&
              likeButton &&
              // 3 buttons won't fit if item is fully rounded
              cloneElement(likeButton, {
                className:
                  'invisible ml-auto text-white hover:bg-white/20 md:group-hover:visible',
                size: 'icon',
              })}
          </div>
        </ContextMenu.Trigger>
        {cloneElement(contextDialog, {
          type: 'contextMenu',
        })}
      </ContextMenu>
      <div
        className={cn(
          radius === 'rounded-full' && 'text-center',
          'mt-3 text-sm',
        )}
      >
        <div className="line-clamp-2 text-ellipsis">{title}</div>
        <div className="text-muted-foreground mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function CompactGridItem({
  image,
  title,
  subtitle,
  model,
  newQueue,
  contextDialog,
}: PlayableGridProps) {
  const queueId = queueGroupId(model);
  const [isHover, setIsHover] = useState(false);
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const itemIsQueued = usePlayerStore(
    s => !!(s.cuedMedia && s.cuedMedia.groupId === queueId),
  );
  const itemIsPlaying = isPlaying && itemIsQueued;

  return (
    <div className="flex snap-start snap-normal items-center gap-4 border-t py-2.5">
      <div
        className={`group relative h-10.5 w-10.5 shrink-0 cursor-pointer overflow-hidden rounded-md`}
        onPointerEnter={() => setIsHover(true)}
        onPointerLeave={() => setIsHover(false)}
      >
        {cloneElement(image, {
          size: 'w-full h-full',
          className: `shadow-md z-10`,
        })}
        <div
          className={clsx(
            'absolute top-0 right-0 bottom-0 left-0 bg-black/50',
            isHover || itemIsPlaying ? 'block' : 'hidden',
          )}
        >
          <PlaybackToggleButton
            buttonType="icon"
            track={model.model_type === TRACK_MODEL ? model : undefined}
            tracks={newQueue}
            queueId={queueId}
            className="size-full rounded-none border-none bg-black/7 text-white hover:bg-black/7"
            equalizerColor="white"
          />
        </div>
      </div>
      <div className="overflow-hidden text-sm text-ellipsis">
        <div className="whitespace-nowrap">{title}</div>
        <div className="text-muted-foreground whitespace-nowrap">
          {subtitle}
        </div>
      </div>
      <Dropdown.Root>
        <Dropdown.Trigger
          render={<Button variant="ghost" size="icon-sm" className="ml-auto" />}
        >
          <MoreHorizontalIcon className="size-4" />
        </Dropdown.Trigger>
        {cloneElement(contextDialog, {
          type: 'dropdown',
        })}
      </Dropdown.Root>
    </div>
  );
}
