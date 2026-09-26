import {useUserArtists} from '@app/web-player/users/use-user-artists';
import {UserArtist} from '@app/web-player/users/user-profile';

export function usePrimaryArtistForCurrentUser(): UserArtist | undefined {
  const userArtists = useUserArtists();
  return userArtists?.find(a => a.role === 'artist');
}
