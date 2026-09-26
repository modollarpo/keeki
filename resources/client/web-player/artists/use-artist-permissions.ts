import {PartialArtist} from '@app/web-player/artists/artist';
import {useUserArtists} from '@app/web-player/users/use-user-artists';
import {useAuth} from '@common/auth/use-auth';
import {useMemo} from 'react';

export function useArtistPermissions(artist: PartialArtist) {
  const {user, hasPermission} = useAuth();
  const userArtists = useUserArtists();
  return useMemo(() => {
    const permissions = {
      canEdit: false,
      canDelete: false,
    };
    if (user?.id) {
      const managesArtist = !!userArtists?.find(a => a.id === artist.id);

      permissions.canEdit =
        hasPermission('artists.update') ||
        hasPermission('music.update') ||
        managesArtist;

      permissions.canDelete =
        hasPermission('artists.delete') ||
        hasPermission('music.delete') ||
        managesArtist;
    }
    return permissions;
  }, [user, artist, hasPermission, userArtists]);
}
