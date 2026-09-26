import {TopModelDatasetItem} from '@app/admin/reports/requests/use-insights-report';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {AlbumLink} from '@app/web-player/albums/album-link';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {ArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PlayArrowFilledIcon} from '@app/web-player/tracks/play-arrow-filled';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {UserProfileLink} from '@app/web-player/users/user-profile-link';
import {ReportMetric} from '@common/admin/analytics/report-metric';
import {UserAvatar} from '@common/auth/user-avatar';
import {Card} from '@shadcn/card/card';
import {Chart} from '@shadcn/chart/chart';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {Fragment, ReactElement, Ref} from 'react';
import {Link, useLocation} from 'react-router';

interface Props {
  data?: ReportMetric<TopModelDatasetItem>;
  title: ReactElement;
  colSpan?: string;
  isLoading?: boolean;
  contentRef?: Ref<HTMLDivElement | null>;
}
export function TopModelsChartLayout({
  data,
  isLoading,
  colSpan = 'col-span-6',
  title,
  contentRef,
}: Props) {
  const dataItems = data?.datasets?.[0]?.data || [];

  return (
    <Card
      size="sm"
      className={cn('row-span-11 overflow-x-hidden overflow-y-auto', colSpan)}
    >
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Content
        ref={contentRef}
        className="compact-scrollbar relative flex-1 overflow-auto overscroll-contain"
      >
        {dataItems.map(item => (
          <div
            key={item.model.id}
            className="mb-5 flex items-center justify-between gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <Image
                model={item.model}
                size="w-10.5 h-10.5"
                className="shrink-0 rounded"
              />
              <div>
                <div className="text-sm">
                  <Name model={item.model} />
                </div>
                <div className="text-muted-foreground text-xs">
                  <Description model={item.model} />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <PlayArrowFilledIcon
                className="text-muted-foreground"
                size="sm"
              />
              <Trans
                message=":count plays"
                values={{count: <FormattedNumber value={item.value} />}}
              />
            </div>
          </div>
        ))}
        {isLoading && <Chart.LoadingIndicator />}
        {!isLoading && !dataItems.length ? <Chart.NoDataIndicator /> : null}
      </Card.Content>
    </Card>
  );
}

interface ImageProps {
  model: TopModelDatasetItem['model'];
  size: string;
  className: string;
}
function Image({model, size, className}: ImageProps) {
  const {pathname} = useLocation();
  const inAdmin = pathname.includes('/admin');
  const link = inAdmin
    ? `/admin/${model.model_type}s/${model.id}/insights`
    : `/backstage/${model.model_type}s/${model.id}/insights`;

  switch (model.model_type) {
    case 'artist':
      return (
        <Link to={link}>
          <SmallArtistImage artist={model} size={size} className={className} />
        </Link>
      );
    case 'album':
      return (
        <Link to={link}>
          <AlbumImage album={model} size={size} className={className} />
        </Link>
      );
    case 'track':
      return (
        <Link to={link}>
          <TrackImage track={model} size={size} className={className} />
        </Link>
      );
    case 'user':
      // there's no separate insights page for user
      return <UserAvatar user={model} size={size} className={className} />;
  }
}

interface NameProps {
  model: TopModelDatasetItem['model'];
}
function Name({model}: NameProps) {
  switch (model.model_type) {
    case 'artist':
      return <ArtistLink artist={model} target="_blank" />;
    case 'album':
      return <AlbumLink album={model} target="_blank" />;
    case 'track':
      return <TrackLink track={model} target="_blank" />;
    case 'user':
      return model.id ? (
        <UserProfileLink user={model} target="_blank" />
      ) : (
        <Fragment>{model.name}</Fragment>
      );
  }
}

interface DescriptionProps {
  model: TopModelDatasetItem['model'];
}
function Description({model}: DescriptionProps) {
  switch (model.model_type) {
    case 'artist':
    case 'user':
      return null;
    case 'album':
    case 'track':
      return <ArtistLinks artists={model.artists} target="_blank" />;
  }
}
