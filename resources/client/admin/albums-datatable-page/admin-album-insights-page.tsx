import {InsightsReportCharts} from '@app/admin/reports/insights-report-charts';
import {appQueries} from '@app/app-queries';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {useRequiredParams} from '@common/ui/navigation/use-required-params';
import {Breadcrumb} from '@shadcn/breadcrumb/breadcrumb';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useState} from 'react';

export function Component() {
  const {albumId} = useRequiredParams(['albumId']);
  const {data} = useSuspenseQuery(
    appQueries.albums.get(albumId, 'album'),
  );
  const album = data.album;
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>
        <Trans message="Insights" />
      </StaticPageTitle>
      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <Breadcrumb.Root className="text-xl">
          <Breadcrumb.Item>
            <Breadcrumb.Link to="/admin/albums">
              <Trans message="Albums" />
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link to={`/admin/albums/${albumId}/edit`}>
              {album.name}
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>
              <Trans message="Insights" />
            </Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.Root>
        <div className="ml-auto">
          <ReportDateSelector value={dateRange} onChange={setDateRange} />
        </div>
      </DashboardLayout.SectionHeader>
      <DashboardLayout.SectionContent>
        <InsightsReportCharts
          showTracks
          dateRange={dateRange}
          model={`album=${albumId}`}
        />
      </DashboardLayout.SectionContent>
    </DashboardLayout.MainSection>
  );
}
