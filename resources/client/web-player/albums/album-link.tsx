import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {slugifyString} from '@ui/utils/string/slugify-string';
import clsx from 'clsx';
import {useMemo} from 'react';
import {Link, LinkProps} from 'react-router';

type Album = {
  id: number;
  name: string;
  artists: Artist[];
};

type Artist = {
  id: number;
  name: string;
};

interface AlbumLinkProps extends Omit<LinkProps, 'to'> {
  album: Album;
  artist?: Artist;
  className?: string;
}
export function AlbumLink({
  album,
  artist,
  className,
  ...linkProps
}: AlbumLinkProps) {
  if (!artist && album.artists) {
    artist = album.artists[0];
  }
  const uri = useMemo(() => {
    return getAlbumLink(album, {artist});
  }, [artist, album]);

  return (
    <Link
      {...linkProps}
      className={clsx(
        'truncate outline-hidden hover:underline focus-visible:underline',
        className,
      )}
      to={uri}
    >
      {album.name}
    </Link>
  );
}

export function getAlbumLink(
  album: Album,
  options: {artist?: Artist; absolute?: boolean} = {},
) {
  const artist = options.artist || album.artists?.[0];
  const artistName = slugifyString(artist?.name || 'Various Artists');
  const albumName = slugifyString(album.name);
  let link = `/album/${album.id}/${artistName}/${albumName}`;
  if (options.absolute) {
    link = `${getBootstrapData().settings.base_url}${link}`;
  }
  return link;
}
