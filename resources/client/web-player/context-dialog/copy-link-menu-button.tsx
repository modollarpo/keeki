import {ContextMenuButton} from '@app/web-player/context-dialog/context-dialog-layout';
import {toast} from '@shadcn/toast/toast';
import {Trans} from '@ui/i18n/trans';
import useClipboard from '@ui/utils/hooks/use-clipboard';
import {LinkIcon} from 'lucide-react';
import {ReactNode} from 'react';

interface CopyLinkMenuButtonProps {
  link: string;
  children: ReactNode;
}
export function CopyLinkMenuButton({link, children}: CopyLinkMenuButtonProps) {
  const [, copyLink] = useClipboard(link);

  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={<LinkIcon />}
      onClick={() => {
        copyLink();
        toast.success(<Trans message="Copied link to clipboard" />);
      }}
    >
      {children}
    </ContextMenuButton>
  );
}
