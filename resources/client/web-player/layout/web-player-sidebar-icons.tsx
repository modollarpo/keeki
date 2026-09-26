import {
  BadgeCheckIcon,
  Disc3Icon,
  DownloadIcon,
  HistoryIcon,
  HouseIcon,
  LibraryBigIcon,
  ListMusicIcon,
  MicVocalIcon,
  MusicIcon,
  SearchIcon,
  TagsIcon,
  TrendingUpIcon,
} from 'lucide-react';
import {ReactElement} from 'react';

export const webPlayerSidebarIcons: Record<string, ReactElement> = {
  '/': <HouseIcon />,
  '/discover': <HouseIcon />,
  '/search': <SearchIcon />,
  '/library': <LibraryBigIcon />,
  '/popular-albums': <Disc3Icon />,
  '/genres': <TagsIcon />,
  '/popular-tracks': <TrendingUpIcon />,
  '/new-releases': <BadgeCheckIcon />,
  '/library/songs': <MusicIcon />,
  '/library/albums': <Disc3Icon />,
  '/library/artists': <MicVocalIcon />,
  '/library/playlists': <ListMusicIcon />,
  '/library/history': <HistoryIcon />,
  '/library/downloads': <DownloadIcon />,
};
