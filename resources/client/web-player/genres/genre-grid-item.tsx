import {ContentGridItemLayout} from '@app/web-player/channels/content-grid-item-layout';
import {Genre} from '@app/web-player/genres/genre';
import {useGenreBgColor} from '@app/web-player/genres/genre-image';
import {getGenreLink} from '@app/web-player/genres/genre-link';
import clsx from 'clsx';
import {useState} from 'react';
import {Link} from 'react-router';

interface GenreGridItemProps {
  genre: Genre;
  layout?: ContentGridItemLayout;
}
export function GenreGridItem({genre, layout}: GenreGridItemProps) {
  const bgColor = useGenreBgColor(genre);
  const [shouldHideImage, setShouldHideImage] = useState(false);

  return (
    <Link
      to={getGenreLink(genre)}
      className={clsx(
        'rounded-card bg-secondary relative isolate flex h-30 items-center justify-center overflow-hidden p-3 text-xl font-semibold capitalize',
        layout === 'compact' ? 'my-2.5 h-22' : 'h-30',
      )}
    >
      {genre.image ? (
        <img
          src={genre.image!}
          alt=""
          className={clsx(
            'absolute inset-0 z-10 h-full w-full object-cover',
            shouldHideImage && 'hidden',
          )}
          onError={() => setShouldHideImage(true)}
        />
      ) : null}
      <div
        className="absolute inset-0 z-20 h-full w-full"
        style={{
          backgroundColor: bgColor,
          opacity: genre.image && !shouldHideImage ? 0.9 : 1,
        }}
      />
      <div className="relative z-30 text-center text-white">
        {genre.display_name || genre.name}
      </div>
    </Link>
  );
}
