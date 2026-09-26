import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {cn} from '@ui/utils/cn';
import black from './equalizer-black.gif';
import white from './equalizer-white.gif';

interface EqualizerImageProps {
  className?: string;
  color?: 'black' | 'white';
}
export function EqualizerImage({className, color}: EqualizerImageProps) {
  const isDarkMode = useIsDarkMode();

  if (!color) {
    color = isDarkMode ? 'white' : 'black';
  }

  return (
    <div className={cn('flex size-5 items-center justify-center', className)}>
      <img
        src={color === 'white' ? white : black}
        alt=""
        className="size-3"
        aria-hidden
      />
    </div>
  );
}
