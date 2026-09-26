import {useControlledState} from '@react-stately/utils';
import {Dialog} from '@shadcn/dialog/dialog';
import {Trans} from '@ui/i18n/trans';
import {ComponentProps, ReactElement} from 'react';
import {
  FilePreviewContainer,
  FilePreviewContainerProps,
} from './file-preview-container';

type Props = Omit<FilePreviewContainerProps, 'onClose'> & {
  children?: ReactElement<ComponentProps<typeof Dialog.Trigger>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function FilePreviewDialog({
  children,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  ...props
}: Props) {
  const [open, setOpen] = useControlledState(openProp, false, onOpenChangeProp);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Content
          showCloseButton={false}
          className="h-full gap-0 overflow-hidden rounded-none bg-muted p-0 shadow-none ring-0 sm:max-w-none"
          viewportClassName="p-0 [@media(min-height:600px)]:py-0"
        >
          <Dialog.Title className="sr-only">
            <Trans message="File preview" />
          </Dialog.Title>
          <FilePreviewContainer onClose={() => setOpen(false)} {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
