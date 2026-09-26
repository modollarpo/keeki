import clsx from 'clsx';
import {useState} from 'react';

type Props = {
  image: string;
  height?: string;
  bgColor?: 'elevated' | 'bg';
  disableTransition?: boolean;
};
export function PlayerPageHeaderGradient({
  image,
  height = 'h-[25vh]',
  bgColor = 'elevated',
  disableTransition = false,
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <div className="pointer-events-none isolate hidden dark:block">
      <div
        className={clsx(
          'absolute top-0 right-0 left-0 z-10 blur-[80px]',
          height,
        )}
      >
        <img
          src={image}
          alt=""
          className={clsx(
            'h-full w-full object-cover object-center',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            !disableTransition && 'transition-opacity ease-linear',
          )}
          onLoad={() => {
            setImageLoaded(true);
          }}
        />
      </div>
      <div
        className={clsx(
          'absolute top-0 left-0 z-20 h-full w-full bg-linear-to-b',
          bgColor === 'elevated'
            ? 'from-bg/70 to-bg'
            : 'from-bg-muted/70 to-bg-muted',
        )}
      />
    </div>
  );
}
