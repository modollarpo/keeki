import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistPageSubtitle} from '@app/web-player/artists/artist-page/artist-page-subtitle';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {
  ContentCarouselControls,
  useContentCarouselControls,
} from '@app/web-player/channels/channel-content-carousel';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {LinkButton} from '@shadcn/button/button';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';
import {useRef} from 'react';

type GroupedAlbums = NonNullable<GetArtistResponse['grouped_albums']>;

type DiscographyGroupedAlbumsProps = {
  groupedAlbums: GroupedAlbums;
};
export function DiscographyGroupedAlbums({
  groupedAlbums,
}: DiscographyGroupedAlbumsProps) {
  return (
    <div>
      {Object.entries(groupedAlbums).map(([albumType, albums]) => (
        <AlbumsCarousel
          key={albumType}
          albums={albums}
          albumType={albumType as keyof GroupedAlbums}
        />
      ))}
    </div>
  );
}

type AlbumsCarouselProps = {
  albums: {data: FullAlbum[]; hasMore: boolean};
  albumType: keyof GroupedAlbums;
};
function AlbumsCarousel({albums, albumType}: AlbumsCarouselProps) {
  const {artistId} = useRequiredParams(['artistId']);
  const artistQuery = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('artistPage'),
  );
  const controls = useContentCarouselControls();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-11" ref={containerRef}>
      <div className="mb-2.5 flex items-center">
        <ArtistPageSubtitle margin="m-0">
          <AlbumTypeDisplayName albumType={albumType} />
        </ArtistPageSubtitle>
        <ContentCarouselControls {...controls} className="ml-auto" />
        {albums.hasMore ? (
          <LinkButton
            size="sm"
            variant="outline"
            className="ml-2"
            to={`${getArtistLink(artistQuery.data.artist, {absolute: true})}/albums?recordType=${albumType}`}
          >
            <Trans message="View all" />
          </LinkButton>
        ) : null}
      </div>

      <ContentGrid
        isCarousel
        contentModel="album"
        containerRef={controls.containerRefCallback}
      >
        {albums.data.map(item => (
          <AlbumGridItem key={item.id} album={item} />
        ))}
      </ContentGrid>
    </div>
  );
}

type AlbumTypeDisplayNameProps = {
  albumType: keyof GroupedAlbums;
};
function AlbumTypeDisplayName({albumType}: AlbumTypeDisplayNameProps) {
  switch (albumType) {
    case 'album':
      return <Trans message="Albums" />;
    case 'single':
      return <Trans message="Singles" />;
    case 'ep':
      return <Trans message="EPs" />;
    case 'live':
      return <Trans message="Live albums" />;
    case 'compilation':
      return <Trans message="Compilations" />;
  }
}
