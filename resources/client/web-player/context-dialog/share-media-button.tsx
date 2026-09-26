import {
  ContextMenuButton,
  ContextMenuLayoutState,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {Trans} from '@ui/i18n/trans';
import {Share2Icon} from 'lucide-react';
import {use} from 'react';

export function ShareMediaButton() {
  const {setShareDialogOpen} = use(ContextMenuLayoutState);
  return (
    <ContextMenuButton
      enableWhileOffline
      startIcon={<Share2Icon />}
      onClick={() => {
        setShareDialogOpen(true);
      }}
    >
      <Trans message="Share" />
    </ContextMenuButton>
  );
}
