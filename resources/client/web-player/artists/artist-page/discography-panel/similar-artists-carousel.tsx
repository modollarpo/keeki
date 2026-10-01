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
import {useSuspenseQuery} from '@tanstack/react-query';
import {ChevronRightIcon} from 'lucide-react';
import {Link} from 'react-router';
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
        <div className="ml-auto flex items-center gap-4">
          <Link
            className="text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:underline flex items-center"
            to={`${getArtistLink(artistQuery.data.artist, {absolute: true})}?tab=similar`}
            onClick={() => {
              if (controls.scrollContainerRef.current) {
                getScrollParent(controls.scrollContainerRef.current).scrollTo({
                  top: 0,
                });
              }
            }}
          >
            <Trans message="See all" />
            <ChevronRightIcon className="size-4 ml-0.5" />
          </Link>
          <ContentCarouselControls {...controls} />
        </div>
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
