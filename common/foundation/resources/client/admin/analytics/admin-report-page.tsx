import {AdminReportCardRow} from '@common/admin/analytics/admin-report-card-row';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {VisitorsReportCharts} from '@common/admin/analytics/visitors-report-charts';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {useState} from 'react';
import {StaticPageTitle} from '../../seo/static-page-title';
import {useAdminReport} from './use-admin-report';

export function Component() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });
  const {isLoading, data} = useAdminReport({dateRange});
  const title = <Trans message="Visitors report" />;

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>{title}</StaticPageTitle>

      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>{title}</DashboardLayout.SectionTitle>
        <ReportDateSelector value={dateRange} onChange={setDateRange} />
      </DashboardLayout.SectionHeader>

      <div className="flex flex-auto flex-col gap-5 overflow-auto p-3 md:p-6">
        <div className="chart-grid">
          <AdminReportCardRow data={data?.headerReport} />
        </div>
        <VisitorsReportCharts
          report={data?.visitorsReport}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout.MainSection>
  );
}
