import {opacityAnimation} from '@ui/animation/opacity-animation';
import {Trans} from '@ui/i18n/trans';
import {AnimatePresence, m} from 'framer-motion';

interface DropTargetMaskProps {
  isVisible: boolean;
}
export function DropTargetMask({isVisible}: DropTargetMaskProps) {
  const mask = (
    <m.div
      key="dragTargetMask"
      {...opacityAnimation}
      transition={{duration: 0.3}}
      className="bg-primary/10 border-primary pointer-events-none absolute inset-0 min-h-full w-full border-2 border-dashed"
    >
      <m.div
        initial={{y: '100%', opacity: 0}}
        animate={{y: '-10px', opacity: 1}}
        exit={{y: '100%', opacity: 0}}
        className="bg-primary text-primary-foreground fixed right-0 bottom-0 left-0 mx-auto max-w-max rounded p-2.5"
      >
        <Trans message="Drop your files anywhere on the page to upload" />
      </m.div>
    </m.div>
  );
  return <AnimatePresence>{isVisible ? mask : null}</AnimatePresence>;
}
