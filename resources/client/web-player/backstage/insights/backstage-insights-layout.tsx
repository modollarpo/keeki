import {InsightsReportChartsProps} from '@app/admin/reports/insights-report-charts';
import {ReportDateSelector} from '@common/admin/analytics/report-date-selector';
import {StaticPageTitle} from '@common/seo/static-page-title';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {DateRangePresets} from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import {Trans} from '@ui/i18n/trans';
import {Skeleton} from '@ui/skeleton/skeleton';
import {cloneElement, Fragment, ReactElement, useState} from 'react';

interface Props {
  children: ReactElement<InsightsReportChartsProps>;
  reportModel: string;
  title?: ReactElement;
}
export function BackstageInsightsLayout({
  children,
  reportModel,
  title,
}: Props) {
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
    // This week
    return DateRangePresets[2].getRangeValue();
  });
  return (
    <Fragment>
      <StaticPageTitle>
        <Trans message="Insights" />
      </StaticPageTitle>
      <div className="flex h-screen flex-col">
        <Navbar.Root className="border-b">
          <Navbar.Logo />
          <Navbar.Content className="ml-auto">
            <Navbar.AuthContent />
          </Navbar.Content>
        </Navbar.Root>
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 md:px-5">
          {title ? (
            title
          ) : (
            <div className="flex min-h-11 w-80 items-center gap-2.5">
              <Skeleton variant="avatar" className="size-11" />
              <div className="flex-auto">
                <Skeleton />
                <Skeleton />
              </div>
            </div>
          )}
          <ReportDateSelector value={dateRange} onChange={setDateRange} />
        </div>
        <div className="relative flex-auto overflow-y-auto bg-cover p-3 md:p-6">
          <div className="mx-auto min-h-full max-w-400">
            {cloneElement(children, {dateRange, model: reportModel})}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
