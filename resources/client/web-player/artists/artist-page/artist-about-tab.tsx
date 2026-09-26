import {FullArtist} from '@app/web-player/artists/artist';
import {ProfileLinks} from '@app/web-player/users/user-profile/profile-links';
import {Dialog} from '@shadcn/dialog/dialog';
import {ImageZoomDialog} from '@ui/overlays/dialog/image-zoom-dialog';
import {useSettings} from '@ui/settings/use-settings';
import {useLinkifiedString} from '@ui/utils/hooks/use-linkified-string';
import {useMemo} from 'react';

interface ArtistAboutTabProps {
  artist: FullArtist;
}
export function ArtistAboutTab({artist}: ArtistAboutTabProps) {
  const {artistPage} = useSettings();
  const description = useLinkifiedString(artist.profile?.description);

  const images = useMemo(() => {
    return artist.profile_images?.map(img => img.url) || [];
  }, [artist.profile_images]);

  return (
    <div className="">
      <div className="grid grid-cols-3 gap-6 lg:grid-cols-4">
        {images.map((src, index) => (
          <ImageZoomDialog
            key={src}
            images={images}
            defaultActiveIndex={index}
          >
            <Dialog.Trigger className="cursor-zoom-in overflow-hidden rounded outline-hidden transition hover:scale-105 focus-visible:ring-3">
              <img
                className="aspect-video cursor-zoom-in rounded object-cover shadow-sm"
                src={src}
                alt=""
              />
            </Dialog.Trigger>
          </ImageZoomDialog>
        ))}
      </div>
      <div
        className="whitespace-pre-wrap py-6 text-sm"
        dangerouslySetInnerHTML={{__html: description || ''}}
      />
      {artist.links?.length && !artistPage?.showDescription ? (
        <ProfileLinks links={artist.links} />
      ) : null}
    </div>
  );
}
