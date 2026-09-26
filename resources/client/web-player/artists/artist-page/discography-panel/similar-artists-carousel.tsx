import {appQueries} from '@app/app-queries';
import {PartialArtist} from '@app/web-player/artists/artist';
import {ArtistGridItem} from '@app/web-player/artists/artist-grid-item';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistPageSubtitle} from '@app/web-player/artists/artist-page/artist-page-subtitle';
import {
  ContentCarouselControls,
  useContentCarouselControls,
} from '@app/web-player/channels/channel-content-carousel';
import {ContentGrid} from '@app/web-player/playable-item/content-grid';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {getScrollParent} from '@react-aria/utils';
import {LinkButton} from '@shadcn/button/button';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Trans} from '@ui/i18n/trans';

type SimilarArtistsCarouselProps = {
  similarArtists: PartialArtist[];
};
export function SimilarArtistsCarousel({
  similarArtists,
}: SimilarArtistsCarouselProps) {
  const {artistId} = useRequiredParams(['artistId']);
  const artistQuery = useSuspenseQuery(
    appQueries.artists.show(artistId).artist('artistPage'),
  );
  const controls = useContentCarouselControls();

  return (
    <div className="mb-11">
      <div className="mb-2.5 flex items-center">
        <ArtistPageSubtitle margin="m-0">
          <Trans message="Fans also like" />
        </ArtistPageSubtitle>
        <ContentCarouselControls {...controls} className="ml-auto" />
        <LinkButton
          size="sm"
          className="ml-1"
          variant="outline"
          to={`${getArtistLink(artistQuery.data.artist, {absolute: true})}?tab=similar`}
          onClick={() => {
            if (controls.scrollContainerRef.current) {
              getScrollParent(controls.scrollContainerRef.current).scrollTo({
                top: 0,
              });
            }
          }}
        >
          <Trans message="View all" />
        </LinkButton>
      </div>

      <ContentGrid
        isCarousel
        contentModel="artist"
        containerRef={controls.containerRefCallback}
      >
        {similarArtists.map(item => (
          <ArtistGridItem key={item.id} artist={item} />
        ))}
      </ContentGrid>
    </div>
  );
}
