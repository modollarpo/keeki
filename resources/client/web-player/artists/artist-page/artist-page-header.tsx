import {FullArtist} from '@app/web-player/artists/artist';
import {ArtistContextDialog} from '@app/web-player/artists/artist-context-dialog';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getGenreLink} from '@app/web-player/genres/genre-link';
import {
  actionButtonClassName,
  MediaPageHeaderLayout,
} from '@app/web-player/layout/media-page-header-layout';
import {LikeButton} from '@app/web-player/library/like-button';
import {PlaybackToggleButton} from '@app/web-player/playable-item/playback-toggle-button';
import {queueGroupId} from '@app/web-player/queue-group-id';
import {MediaItemStats} from '@app/web-player/tracks/media-item-stats';
import {ProfileDescription} from '@app/web-player/users/user-profile/profile-description';
import {Badge} from '@shadcn/badge/badge';
import {Button} from '@shadcn/button/button';
import {Dropdown} from '@shadcn/dropdown/dropdown';
import {Trans} from '@ui/i18n/trans';
import {useSettings} from '@ui/settings/use-settings';
import {cn} from '@ui/utils/cn';
import {ChevronDownIcon} from 'lucide-react';
import {Link} from 'react-router';

interface ArtistPageHeaderProps {
  artist: FullArtist;
}
export function ArtistPageHeader({artist}: ArtistPageHeaderProps) {
  const {artistPage} = useSettings();
  return (
    <div>
      <MediaPageHeaderLayout
        centerItems
        image={
          <SmallArtistImage
            showVerifiedBadge
            artist={artist}
            className="rounded-full object-cover"
            wrapperClassName="mx-auto"
          />
        }
        title={artist.name}
        subtitle={
          artist.genres?.length ? <GenreList genres={artist.genres} /> : null
        }
        actionsBar={
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
            <ActionButtons artist={artist} />
            <MediaItemStats item={artist} />
          </div>
        }
        footer={
          artistPage.showDescription && (
            <ProfileDescription profile={artist.profile} links={artist.links} />
          )
        }
      />
    </div>
  );
}

interface GenreListProps {
  genres?: FullArtist['genres'];
  className?: string;
}
export function GenreList({genres, className}: GenreListProps) {
  if (!genres?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex max-w-155 items-center justify-start gap-2 overflow-hidden max-md:hidden',
        className,
      )}
    >
      {genres.slice(0, 5).map(genre => (
        <Badge
          key={genre.id}
          variant="secondary"
          render={<Link to={getGenreLink(genre)} />}
        >
          {genre.display_name || genre.name}
        </Badge>
      ))}
    </div>
  );
}

interface ActionButtonsProps {
  artist: FullArtist;
}
function ActionButtons({artist}: ActionButtonsProps) {
  return (
    <div className="flex items-center">
      <PlaybackToggleButton
        queueId={queueGroupId(artist)}
        buttonType="text"
        className={actionButtonClassName({isFirst: true})}
      />
      <LikeButton
        likeable={artist}
        className={cn(actionButtonClassName(), 'max-md:hidden')}
      />
      <Dropdown.Root>
        <Dropdown.Trigger
          render={
            <Button variant="outline" className={actionButtonClassName()} />
          }
        >
          <Trans message="More" />
          <ChevronDownIcon data-icon="inline-end" />
        </Dropdown.Trigger>
        <ArtistContextDialog artist={artist} type="dropdown" />
      </Dropdown.Root>
    </div>
  );
}
