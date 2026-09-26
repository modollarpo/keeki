import {appQueries} from '@app/app-queries';
import {ContextMenuLayoutState} from '@app/web-player/context-dialog/context-dialog-layout';
import {useAddTracksToPlaylist} from '@app/web-player/playlists/requests/use-add-tracks-to-playlist';
import {useIsOffline} from '@app/web-player/use-is-offline';
import {useAuth} from '@common/auth/use-auth';
import {ContextMenu} from '@shadcn/context-menu/context-menu';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {useQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {toast} from '@shadcn/toast/toast';
import {PlusIcon} from 'lucide-react';
import {use, useMemo} from 'react';

export function AddToPlaylistButton() {
  const isOffline = useIsOffline();
  const {user} = useAuth();
  const {loadTracks, type, setPlaylistDialogOpen} = use(ContextMenuLayoutState);

  const {data} = useQuery(appQueries.playlists.compactAuthUserPlaylists());

  const addToPlaylist = useAddTracksToPlaylist();

  // only show playlists user created or ones that are collaborative
  const playlists = useMemo(() => {
    return data.filter(p => p.owner_id === user?.id || p.collaborative);
  }, [data, user]);

  const Item = type === 'dropdown' ? Dropdown : ContextMenu;

  return (
    <>
      <Item.Sub disabled={isOffline || !user}>
        <Item.SubTrigger>
          <PlusIcon />
          <Trans message="Add to playlist" />
        </Item.SubTrigger>
        <Item.SubContent>
          <Item.Item onClick={() => setPlaylistDialogOpen(true)}>
            <PlusIcon />
            <Trans message="New playlist" />
          </Item.Item>
          {playlists.map(playlist => (
            <Item.Item
              key={playlist.id}
              onClick={async () => {
                const tracks = await loadTracks();
                if (tracks?.length && !addToPlaylist.isPending) {
                  addToPlaylist.mutate({
                    playlistId: playlist.id,
                    tracks,
                  });
                } else {
                  toast.success(<Trans message="This item does not have tracks yet" />);
                }
              }}
            >
              {playlist.name}
            </Item.Item>
          ))}
        </Item.SubContent>
      </Item.Sub>
    </>
  );
}
