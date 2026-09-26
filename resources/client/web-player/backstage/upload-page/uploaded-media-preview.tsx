import {ALBUM_MODEL, FullAlbum} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {ShareMediaButtons} from '@app/web-player/sharing/share-media-buttons';
import {Track} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {Badge} from '@shadcn/badge/badge';
import {Input} from '@shadcn/forms/input/input';
import {LinkStyle} from '@ui/buttons/external-link';
import {Trans} from '@ui/i18n/trans';
import clsx from 'clsx';
import {Link} from 'react-router';
import albumBorderImage from './album-border.png';

interface UploadedMediaPreviewProps {
  media: Track | FullAlbum;
}
export function UploadedMediaPreview({media}: UploadedMediaPreviewProps) {
  const isAlbum = media.model_type === ALBUM_MODEL;
  const absoluteLink = isAlbum
    ? getAlbumLink(media, {absolute: true})
    : getTrackLink(media, {absolute: true});

  return (
    <div className="rounded-card bg-card mx-auto my-5 flex w-195 max-w-full items-center gap-7 border p-5">
      <div className={clsx(isAlbum && 'relative isolate mx-4.5 my-3.5')}>
        {isAlbum ? (
          <AlbumImage
            album={media}
            className="relative z-20 shrink-0 rounded"
            size="w-33 h-33"
          />
        ) : (
          <TrackImage
            track={media}
            className="relative z-20 shrink-0 rounded"
            size="w-33 h-33"
          />
        )}
        {isAlbum && (
          <img
            className="absolute -top-3.5 -left-3.5 z-10 block h-40 w-40 max-w-40"
            src={albumBorderImage}
            alt=""
          />
        )}
      </div>
      <div className="flex-auto">
        <div className="text-base font-bold">{media.name}</div>
        <div className="text-muted-foreground mb-3.5 text-sm">
          <ArtistLinks artists={media.artists} />
        </div>
        {media.genres?.length ? (
          <div className="mb-3.5 flex flex-wrap items-center gap-2">
            {media.genres.map(genre => (
              <Badge key={genre.id} variant="secondary">
                {genre.display_name || genre.name}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="text-sm">
          <Trans
            message="Upload complete. <a>Go to your track</a>"
            values={{
              a: parts => (
                <Link
                  className={LinkStyle}
                  to={isAlbum ? getAlbumLink(media) : getTrackLink(media)}
                >
                  {parts}
                </Link>
              ),
            }}
          />
        </div>
      </div>
      <div className="ml-auto max-w-75 flex-auto">
        <div className="text-muted-foreground text-sm">
          <Trans message="Share your new track" />
          <ShareMediaButtons
            name={media.name}
            image={media.image}
            link={absoluteLink}
          />
          <Input
            bindToHookForm={false}
            value={absoluteLink}
            readOnly
            className="mt-6 w-full"
            onClick={e => {
              e.currentTarget.select();
            }}
          />
        </div>
      </div>
    </div>
  );
}
