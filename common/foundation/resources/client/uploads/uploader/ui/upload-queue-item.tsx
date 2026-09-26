import {FileTypeIcon} from '@common/uploads/components/file-type-icon/file-type-icon';
import {useFileUploadStore} from '@common/uploads/uploader/file-upload-provider';
import {Button} from '@shadcn/button/button';
import {Tooltip} from '@shadcn/tooltip/tooltip';
import {message} from '@ui/i18n/message';
import {MixedText} from '@ui/i18n/mixed-text';
import {Trans} from '@ui/i18n/trans';
import {ProgressCircle} from '@ui/progress/progress-circle';
import {cn} from '@ui/utils/cn';
import {prettyBytes} from '@ui/utils/files/pretty-bytes';
import {
  UploadedFile,
  UploadedFileFromEntry,
} from '@ui/utils/files/uploaded-file';
import {shallowEqual} from '@ui/utils/shallow-equal';
import clsx from 'clsx';
import {AnimatePresence} from 'framer-motion';
import {
  CheckCircleIcon,
  CircleAlertIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  CSSProperties,
  Fragment,
  memo,
  ReactElement,
  useMemo,
  useState,
} from 'react';
import {useShallow} from 'zustand/react/shallow';

interface Props {
  file: UploadedFile | UploadedFileFromEntry;
  className?: string;
  style?: CSSProperties;
}
export const UploadQueueItem = memo(({file, className, style}: Props) => {
  return (
    <div className={clsx('flex items-center gap-3.5', className)} style={style}>
      <div className="shrink-0 rounded-card-xs border p-2">
        <FileTypeIcon className="size-5.5" mime={file.mime} />
      </div>
      <div className="min-w-0 flex-auto pr-2.5">
        <div className="mb-0.5 flex min-w-0 items-center gap-2.5">
          <div className="min-w-0 flex-auto overflow-hidden font-medium text-ellipsis whitespace-nowrap">
            {file.name}
          </div>
        </div>
        <SizeInfo file={file} />
      </div>
      <FileStatus file={file} />
    </div>
  );
}, shallowEqual);

interface SizeInfoProps {
  file: UploadedFile | UploadedFileFromEntry;
}
function SizeInfo({file}: SizeInfoProps) {
  const fileUpload = useFileUploadStore(
    useShallow(s => s.fileUploads.get(file.id)),
  );
  const bytesUploaded = fileUpload?.bytesUploaded || 0;

  const totalBytes = useMemo(() => prettyBytes(file.size), [file]);
  const uploadedBytes = useMemo(
    () => prettyBytes(bytesUploaded),
    [bytesUploaded],
  );

  let statusMessage: ReactElement;
  if (fileUpload?.status === 'completed') {
    statusMessage = <Trans message="Upload complete" />;
  } else if (fileUpload?.status === 'aborted') {
    statusMessage = <Trans message="Upload cancelled" />;
  } else if (fileUpload?.status === 'failed') {
    statusMessage = <Trans message="Upload failed" />;
  } else if (fileUpload?.status === 'pending') {
    statusMessage = <Fragment>{totalBytes}</Fragment>;
  } else {
    statusMessage = (
      <Trans
        message=":bytesUploaded of :totalBytes"
        values={{
          bytesUploaded: uploadedBytes,
          totalBytes,
        }}
      />
    );
  }

  return <div className="text-xs text-muted-foreground">{statusMessage}</div>;
}

interface FileStatusProps {
  file: UploadedFile | UploadedFileFromEntry;
}
function FileStatus({file}: FileStatusProps) {
  const fileUpload = useFileUploadStore(
    useShallow(s => s.fileUploads.get(file.id)),
  );
  const abortUpload = useFileUploadStore(s => s.abortUpload);
  const percentage = fileUpload?.percentage || 0;
  let status = fileUpload?.status;
  const errorMessage = fileUpload?.errorMessage;

  const [isHovered, setIsHovered] = useState(false);

  const abortButton = (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={() => {
        abortUpload(file.id);
      }}
    >
      <XIcon className="size-4" />
    </Button>
  );

  const progressButton = (
    <ProgressCircle
      aria-label="Upload progress"
      size="size-6"
      value={percentage}
      isIndeterminate={percentage === 100}
      trackWidth={3}
    />
  );

  let statusButton: ReactElement;
  if (status === 'failed') {
    const errMessage =
      errorMessage || message('This file could not be uploaded');
    statusButton = (
      <AnimatedStatus
        onPointerEnter={e => {
          if (e.pointerType === 'mouse') {
            setIsHovered(true);
          }
        }}
        onPointerLeave={e => {
          if (e.pointerType === 'mouse') {
            setIsHovered(false);
          }
        }}
      >
        {isHovered ? (
          abortButton
        ) : (
          <Tooltip>
            <Tooltip.Trigger>
              <CircleAlertIcon className="size-5 text-destructive" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <MixedText value={errMessage} />
            </Tooltip.Content>
          </Tooltip>
        )}
      </AnimatedStatus>
    );
  } else if (status === 'aborted') {
    statusButton = (
      <AnimatedStatus>
        <TriangleAlertIcon className="size-5 text-warning" />
      </AnimatedStatus>
    );
  } else if (status === 'completed') {
    statusButton = (
      <AnimatedStatus>
        <CheckCircleIcon className="size-5 text-positive" />
      </AnimatedStatus>
    );
  } else if (status === 'pending') {
    statusButton = <AnimatedStatus>{abortButton}</AnimatedStatus>;
  } else {
    statusButton = (
      <AnimatedStatus
        onPointerEnter={e => {
          if (e.pointerType === 'mouse') {
            setIsHovered(true);
          }
        }}
        onPointerLeave={e => {
          if (e.pointerType === 'mouse') {
            setIsHovered(false);
          }
        }}
      >
        {isHovered ? abortButton : progressButton}
      </AnimatedStatus>
    );
  }

  return <AnimatePresence>{statusButton}</AnimatePresence>;
}

interface AnimatedStatusProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
> {
  children: ReactElement;
}
function AnimatedStatus({
  children,
  className,
  ...domProps
}: AnimatedStatusProps) {
  return (
    <div
      className={cn(
        'flex size-6 animate-in items-center justify-center duration-300 fade-in-0',
        className,
      )}
      {...domProps}
    >
      {children}
    </div>
  );
}
