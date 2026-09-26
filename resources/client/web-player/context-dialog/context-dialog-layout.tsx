import {PartialAlbum} from '@app/web-player/albums/album';
import {PartialArtist} from '@app/web-player/artists/artist';
import {CreatePlaylistDialog} from '@app/web-player/playlists/crupdate-dialog/create-playlist-dialog';
import {PartialPlaylist} from '@app/web-player/playlists/playlist';
import {useAddTracksToPlaylist} from '@app/web-player/playlists/requests/use-add-tracks-to-playlist';
import {ShareMediaDialog} from '@app/web-player/sharing/share-media-dialog';
import {Track} from '@app/web-player/tracks/track';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {
  cloneElement,
  createContext,
  MouseEvent,
  ReactElement,
  ReactNode,
  use,
  useMemo,
  useState,
} from 'react';
import {Link, To} from 'react-router';

interface ContextMenuLayoutStateValue {
  playlistDialogOpen: boolean;
  setPlaylistDialogOpen: (value: boolean) => void;
  shareDialogOpen: boolean;
  setShareDialogOpen: (value: boolean) => void;
  loadTracks: () => Promise<Track[]>;
  type: ContextMenuLayoutProps['type'];
}
export const ContextMenuLayoutState =
  createContext<ContextMenuLayoutStateValue>(null!);

export interface ContextMenuLayoutProps {
  image?: ReactElement<{className: string}> | null;
  title?: ReactElement | null;
  type?: 'dropdown' | 'contextMenu';
  item: PartialArtist | PartialAlbum | Track | PartialPlaylist;
  description?: ReactElement;
  children: ReactNode;
  loadTracks: () => Promise<Track[]>;
}
export function ContextDialogLayout({
  image,
  title,
  item,
  description,
  children,
  loadTracks,
  type,
}: ContextMenuLayoutProps) {
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const contextValue: ContextMenuLayoutStateValue = useMemo(() => {
    return {
      playlistDialogOpen,
      setPlaylistDialogOpen,
      shareDialogOpen,
      setShareDialogOpen,
      loadTracks,
      type,
    };
  }, [playlistDialogOpen, shareDialogOpen, loadTracks, type]);

  const addToPlaylist = useAddTracksToPlaylist();

  const header =
    image || title ? (
      <div className="mb-2.5 flex items-center gap-3.5 border-b px-3 pt-2 pb-3 text-sm">
        {image && cloneElement(image, {className: 'size-10 rounded'})}
        <div className="truncate">
          {title}
          {description && (
            <div className="text-muted-foreground text-xs">{description}</div>
          )}
        </div>
      </div>
    ) : null;

  const Wrapper = type === 'dropdown' ? Dropdown.Content : ContextMenu.Content;

  if (!item) {
    return null;
  }

  return (
    <>
      <CreatePlaylistDialog
        open={playlistDialogOpen}
        onOpenChange={setPlaylistDialogOpen}
        onCreate={playlist => {
          loadTracks().then(tracks => {
            if (tracks.length) {
              addToPlaylist.mutate({
                playlistId: playlist.id,
                tracks,
              });
            }
          });
        }}
      />

      <ShareMediaDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        item={item}
      />

      <ContextMenuLayoutState.Provider value={contextValue}>
        <Wrapper className="w-70">
          {header}
          {children}
        </Wrapper>
      </ContextMenuLayoutState.Provider>
    </>
  );
}

type ContextMenuButtonProps = {
  children: ReactNode;
  endIcon?: ReactElement<{className?: string}>;
  startIcon?: ReactElement<{className?: string}>;
  className?: string;
  to?: To;
  disabled?: boolean;
  enableWhileOffline?: boolean;
  onClick?: () => void;
  onClickCapture?: (e: MouseEvent) => void;
};
export function ContextMenuButton({
  children,
  endIcon,
  startIcon,
  className,
  to,
  disabled,
  enableWhileOffline = false,
  onClick,
  onClickCapture,
}: ContextMenuButtonProps) {
  const isOffline = useIsOffline();
  const isDisabled = disabled || (isOffline && !enableWhileOffline);
  const {type: menuType} = use(ContextMenuLayoutState);

  const content = (
    <>
      {startIcon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {endIcon}
    </>
  );

  const itemProps = {
    onClick,
    onClickCapture,
    className,
  };

  if (menuType === 'dropdown') {
    if (to && !isDisabled) {
      return (
        <Dropdown.LinkItem render={<Link to={to} />} {...itemProps}>
          {content}
        </Dropdown.LinkItem>
      );
    } else {
      return (
        <Dropdown.Item disabled={isDisabled} {...itemProps}>
          {content}
        </Dropdown.Item>
      );
    }
  }

  if (menuType === 'contextMenu') {
    if (to && !isDisabled) {
      return (
        <ContextMenu.LinkItem render={<Link to={to} />} {...itemProps}>
          {content}
        </ContextMenu.LinkItem>
      );
    } else {
      return (
        <ContextMenu.Item disabled={isDisabled} {...itemProps}>
          {content}
        </ContextMenu.Item>
      );
    }
  }
}
