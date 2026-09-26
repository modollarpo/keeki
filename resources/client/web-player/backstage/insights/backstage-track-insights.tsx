import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {appQueries} from '@app/app-queries';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {BackstageInsightsLayout} from '@app/web-player/backstage/insights/backstage-insights-layout';
import {BackstageInsightsTitle} from '@app/web-player/backstage/insights/backstage-insights-title';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {TrackLink} from '@app/web-player/tracks/track-link';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {useQuery} from '@tanstack/react-query';

export function BackstageTrackInsights() {
  const {trackId} = useRequiredParams(['trackId']);
  const {data} = useQuery(appQueries.tracks.get(trackId!, 'track'));
  return (
    <BackstageInsightsLayout
      reportModel={`track=${trackId}`}
      title={
        data?.track && (
          <BackstageInsightsTitle
            image={<TrackImage size="w-9.5 h-9.5" track={data.track} />}
            name={<TrackLink track={data.track} />}
            description={<ArtistLinks artists={data.track.artists} />}
          />
        )
      }
    >
      <InsightsReportCharts />
    </BackstageInsightsLayout>
  );
}
