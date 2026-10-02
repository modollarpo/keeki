import {appQueries} from '@app/app-queries';
import {FullAlbum} from '@app/web-player/albums/album';
import {AlbumGridItem} from '@app/web-player/albums/album-grid-item';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistPageSubtitle} from '@app/web-player/artists/artist-page/artist-page-subtitle';
import {GetArtistResponse} from '@app/web-player/artists/requests/get-artist-response';
import {
  ContentCarouselNav,
  useContentCarouselControls,
} from '@app/web-player/playable-item/content-carousel-nav';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {LinkButton} from '@shadcn/button/button';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

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

  return (
    <div className="mb-11">
      {/* Header line: section name left, "View all" right. */}
      <div className="mb-2.5 flex items-center">
        <ArtistPageSubtitle margin="m-0">
          <AlbumTypeDisplayName albumType={albumType} />
        </ArtistPageSubtitle>
        {albums.hasMore ? (
          <LinkButton
            size="sm"
            variant="outline"
            className="ml-auto"
            to={`${getArtistLink(artistQuery.data.artist, {absolute: true})}/albums?recordType=${albumType}`}
          >
            <Trans message="View all" />
          </LinkButton>
        ) : null}
      </div>

      {/* Arrows overlay the two ends of the rail, so the rail keeps the full
          section width it had before. */}
      <ContentCarouselNav controls={controls}>
        {/* The rail is its own container so the grid lays out against the
            width it actually occupies rather than the full page width. */}
        <div className="@container w-full min-w-0">
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
      </ContentCarouselNav>
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
