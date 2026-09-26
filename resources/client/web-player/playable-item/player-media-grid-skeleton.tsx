import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {opacityAnimation} from '@ui/animation/opacity-animation';
import {Skeleton} from '@ui/skeleton/skeleton';
import {cn} from '@ui/utils/cn';
import {m} from 'framer-motion';

interface Props {
  itemCount: number;
  showDescription?: boolean;
}
export function PlayableMediaGridSkeleton({
  itemCount,
  showDescription = true,
}: Props) {
  return (
    <m.div key="skeletons" {...opacityAnimation}>
      <ContentGrid>
        {[...new Array(Math.min(itemCount, 30)).keys()].map(key => {
          return (
            <div key={key} className="relative w-full">
              <div className="aspect-square w-full">
                <Skeleton variant="rect" />
              </div>
              <div className={cn('mt-3 text-xs', !showDescription && 'pt-0.5')}>
                <Skeleton variant="text" />
                {showDescription && (
                  <Skeleton variant="text" className="mt-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </ContentGrid>
    </m.div>
  );
}
