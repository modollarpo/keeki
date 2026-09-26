import {useBootstrapDataStore} from '@ui/bootstrap-data/bootstrap-data-store';

export function useUserArtists() {
  return useBootstrapDataStore(state => state.data.userArtists);
}
