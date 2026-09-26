import {TrackUploadStatusText} from '@app/admin/tracks-datatable-page/track-form/track-upload-status-text';
import {FileUpload} from '@common/uploads/uploader/file-upload-store';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {message} from '@ui/i18n/message';
import {MixedText} from '@ui/i18n/mixed-text';
import {ProgressBar} from '@ui/progress/progress-bar';
import {AnimatePresence, m} from 'framer-motion';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';
import {ComponentPropsWithoutRef, ReactElement} from 'react';

export type TrackUploadStatus = FileUpload['status'] | 'processing' | undefined;

interface UploadProgressProps {
  fileUpload: FileUpload;
  status: TrackUploadStatus;
  onAbort?: (uploadId: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}
export function TrackUploadProgress({
  fileUpload,
  status,
  onAbort,
  size = 'md',
  className,
}: UploadProgressProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-6">
        <TrackUploadStatusText fileUpload={fileUpload} status={status} />
        <UploadStatusButton
          fileUpload={fileUpload}
          status={status}
          onAbort={onAbort}
        />
      </div>
      <ProgressBar
        size={size === 'sm' ? 'xs' : 'sm'}
        radius="rounded-sm"
        value={fileUpload.percentage}
        isIndeterminate={status === 'processing' || status === 'pending'}
      />
    </div>
  );
}

function UploadStatusButton({
  fileUpload,
  status,
  onAbort,
}: UploadProgressProps) {
  const errorMessage = fileUpload.errorMessage;

  let statusButton: ReactElement;
  if (status === 'failed') {
    const errMessage =
      errorMessage || message('This file could not be uploaded');
    statusButton = (
      <AnimatedStatus>
        <Tooltip.Root>
          <Tooltip.Trigger
            render={<CircleAlertIcon className="size-5 text-destructive" />}
          />
          <Tooltip.Content>
            <MixedText value={errMessage} />
          </Tooltip.Content>
        </Tooltip.Root>
      </AnimatedStatus>
    );
  } else if (status === 'aborted') {
    statusButton = (
      <AnimatedStatus>
        <TriangleAlertIcon className="size-5 text-warning" />
      </AnimatedStatus>
    );
  } else if (status === 'completed' || status === 'processing') {
    statusButton = (
      <AnimatedStatus>
        <CheckCircleIcon className="size-5 text-primary" />
      </AnimatedStatus>
    );
  } else if (onAbort) {
    statusButton = (
      <AnimatedStatus>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          onClick={() => onAbort(fileUpload.file.id)}
        >
          <XIcon />
        </Button>
      </AnimatedStatus>
    );
  } else {
    // keep the spacing, even if status button is hidden
    statusButton = <div className="h-7.5 w-7.5" />;
  }

  return <AnimatePresence>{statusButton}</AnimatePresence>;
}

interface AnimatedStatusProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
> {
  children: ReactElement;
}
function AnimatedStatus({children, ...domProps}: AnimatedStatusProps) {
  return (
    <m.div
      className="flex h-7.5 w-7.5 items-center justify-center"
      {...domProps}
      initial={{scale: 0, opacity: 0}}
      animate={{scale: 1, opacity: 1}}
      exit={{scale: 0, opacity: 0}}
    >
      {children}
    </m.div>
  );
}
