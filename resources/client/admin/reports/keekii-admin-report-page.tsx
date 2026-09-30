import {AdminReportCardRow} from '@common/admin/analytics/admin-report-card-row';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {useAdminReport} from '@common/admin/analytics/use-admin-report';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {DashboardLayout} from '@common/ui/dashboard/dashboard-layout';
import {LinkButton} from '@shadcn/button/button';
import {Toggle} from '@shadcn/toggle';
import {ToggleGroup} from '@shadcn/toggle-group/toggle-group';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {Fragment, useState} from 'react';
import {Outlet, useLocation} from 'react-router';

export interface AdminReportOutletContext {
  dateRange: DateRangeValue;
  setDateRange: (dateRange: DateRangeValue) => void;
}

export function Component() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });
  const {pathname} = useLocation();
  const channel = pathname.endsWith('visitors') ? 'visitors' : 'plays';

  const title =
    channel === 'visitors' ? (
      <Trans message="Visitors report" />
    ) : (
      <Trans message="Plays report" />
    );

  return (
    <DashboardLayout.MainSection>
      <StaticPageTitle>{title}</StaticPageTitle>

      <DashboardLayout.SectionHeader>
        <DashboardLayout.SidebarToggle />
        <DashboardLayout.SectionTitle>{title}</DashboardLayout.SectionTitle>
        <Fragment>
          <ToggleGroup
            value={[channel]}
            variant="segmented"
            buttonVariant="ghost"
            buttonColor="default"
          >
            <Toggle
              value="plays"
              nativeButton={false}
              render={<LinkButton to="plays" />}
            >
              <Trans message="Plays" />
            </Toggle>
            <Toggle
              value="visitors"
              nativeButton={false}
              render={<LinkButton to="visitors" />}
            >
              <Trans message="Visitors" />
            </Toggle>
          </ToggleGroup>
          <ReportDateSelector value={dateRange} onChange={setDateRange} />
        </Fragment>
      </DashboardLayout.SectionHeader>

      <div className="flex flex-auto flex-col gap-5 overflow-auto p-3 md:p-6">
        <Header dateRange={dateRange} />
        <Outlet context={{dateRange, setDateRange}} />
      </div>
    </DashboardLayout.MainSection>
  );
}

interface HeaderProps {
  dateRange: DateRangeValue;
}
function Header({dateRange}: HeaderProps) {
  const {data, isLoading} = useAdminReport({types: ['header'], dateRange});
  return (
    <div className="chart-grid">
      <AdminReportCardRow data={data?.headerReport} isLoading={isLoading} />
    </div>
  );
}
