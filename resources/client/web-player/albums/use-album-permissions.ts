import {PartialAlbum} from '@app/web-player/albums/album';
import {useUserArtists} from '@app/web-player/users/use-user-artists';
import {useAuth} from '@common/auth/use-auth';
import {useMemo} from 'react';

export function useAlbumPermissions(album?: PartialAlbum) {
  const {user, hasPermission} = useAuth();
  const userArtists = useUserArtists();
  return useMemo(() => {
    const permissions = {
      canEdit: false,
      canDelete: false,
      managesAlbum: false,
    };
    if (user?.id && album) {
      const albumArtistIds = album.artists?.map(a => a.id);
      const managesAlbum =
        album.owner_id === user.id ||
        !!userArtists?.find(a => albumArtistIds?.includes(a.id as number));

      permissions.canEdit =
        hasPermission('albums.update') ||
        hasPermission('music.update') ||
        managesAlbum;

      permissions.canDelete =
        hasPermission('albums.delete') ||
        hasPermission('music.delete') ||
        managesAlbum;

      permissions.managesAlbum = managesAlbum;
    }
    return permissions;
  }, [user, album, hasPermission, userArtists]);
}
