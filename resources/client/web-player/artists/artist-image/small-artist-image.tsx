import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {CheckIcon} from '@ui/icons/material/Check';
import {MicIcon} from '@ui/icons/material/Mic';
import clsx from 'clsx';

interface SmallArtistImageProps {
  artist: {
    image_small?: string | null;
    image?: string | null;
    name: string;
    verified?: boolean | null;
  };
  className?: string;
  wrapperClassName?: string;
  size?: string;
  showVerifiedBadge?: boolean;
}
export function SmallArtistImage({
  artist,
  className,
  wrapperClassName,
  size,
  showVerifiedBadge = false,
}: SmallArtistImageProps) {
  const {trans} = useTrans();
  const src = artist.image_small ?? artist.image;
  const imgClassName = clsx(
    size,
    className,
    'bg-foreground/5 object-cover',
    !src ? 'flex items-center justify-center' : 'block',
  );

  const image = src ? (
    <img
      className={imgClassName}
      draggable={false}
      loading="lazy"
      src={src}
      alt={trans(message('Image for :name', {values: {name: artist.name}}))}
    />
  ) : (
    <span className={clsx(imgClassName, 'overflow-hidden')}>
      <MicIcon className="text-border max-w-[60%]" size="text-9xl" />
    </span>
  );

  return (
    <div className={clsx('relative isolate shrink-0', size, wrapperClassName)}>
      {image}
      {showVerifiedBadge && artist.verified && (
        <div
          className="absolute right-0 bottom-6 left-0 mx-auto flex w-max max-w-full items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-sm text-white"
          color="positive"
        >
          <div className="bg-primary rounded-full p-px">
            <CheckIcon className="text-white" size="sm" />
          </div>
          <Trans message="Verified artist" />
        </div>
      )}
    </div>
  );
}
