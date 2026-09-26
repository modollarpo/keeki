import {
  FetchInsightsReportResponse,
  InsightsReportMetric,
  useInsightsReport,
} from '@app/admin/reports/requests/use-insights-report';
import {TopModelsChartLayout} from '@app/admin/reports/top-models-chart-layout';
import {GeoChart} from '@common/admin/analytics/geo-chart/geo-chart';
import {ReportMetric} from '@common/admin/analytics/report-metric';
import {Card} from '@shadcn/card/card';
import {Chart} from '@shadcn/chart/chart';
import {
  generateTimeChartLabel,
  generateTimeChartTooltip,
  useChartDataWithColors,
} from '@shadcn/chart/chart-utils';
import {DateRangeValue} from '@ui/forms/input-field/date/date-range-picker/date-range-value';
import {FormattedNumber} from '@ui/i18n/formatted-number';
import {useSelectedLocale} from '@ui/i18n/selected-locale';
import {Trans} from '@ui/i18n/trans';
import {useTrans} from '@ui/i18n/use-trans';
import {
  Fragment,
  ReactNode,
  Ref,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  PieSectorShapeProps,
  Sector,
  XAxis,
  YAxis,
} from 'recharts';

export interface InsightsReportChartsProps {
  showTracks?: boolean;
  showArtistsAndAlbums?: boolean;
  dateRange?: DateRangeValue;
  model?: string;
}
export function InsightsReportCharts(props: InsightsReportChartsProps) {
  // will be set via "cloneElement"
  const model = props.model as string;
  const dateRange = props.dateRange as DateRangeValue;
  const {trans} = useTrans();

  return (
    <div className="chart-grid">
      <AsyncChart metric="plays" model={model} dateRange={dateRange}>
        {({data, isLoading, contentRef}) => (
          <PlaysChart
            report={data}
            isLoading={isLoading}
            contentRef={contentRef}
          />
        )}
      </AsyncChart>
      <AsyncChart metric="devices" model={model} dateRange={dateRange}>
        {({data, isLoading, contentRef}) => (
          <TopDevicesChart
            report={data}
            isLoading={isLoading}
            contentRef={contentRef}
          />
        )}
      </AsyncChart>
      {props.showTracks && (
        <AsyncChart metric="tracks" model={model} dateRange={dateRange}>
          {({data, isLoading, contentRef}) => (
            <TopModelsChartLayout
              title={<Trans message="Most played tracks" />}
              data={data}
              isLoading={isLoading}
              contentRef={contentRef}
            />
          )}
        </AsyncChart>
      )}
      <AsyncChart metric="users" model={model} dateRange={dateRange}>
        {({data, isLoading, contentRef}) => (
          <TopModelsChartLayout
            title={<Trans message="Top listeners" />}
            colSpan={props.showTracks ? 'col-span-6' : 'col-span-12'}
            data={data}
            isLoading={isLoading}
            contentRef={contentRef}
          />
        )}
      </AsyncChart>
      {props.showArtistsAndAlbums && (
        <Fragment>
          <AsyncChart metric="artists" model={model} dateRange={dateRange}>
            {({data, isLoading, contentRef}) => (
              <TopModelsChartLayout
                title={<Trans message="Most played artists" />}
                data={data}
                isLoading={isLoading}
                contentRef={contentRef}
              />
            )}
          </AsyncChart>
          <AsyncChart metric="albums" model={model} dateRange={dateRange}>
            {({data, isLoading, contentRef}) => (
              <TopModelsChartLayout
                title={<Trans message="Most played albums" />}
                data={data}
                isLoading={isLoading}
                contentRef={contentRef}
              />
            )}
          </AsyncChart>
        </Fragment>
      )}
      <AsyncChart metric="locations" model={model} dateRange={dateRange}>
        {({data, isLoading, contentRef}) => (
          <GeoChart
            className="col-span-7"
            isLoading={isLoading}
            data={metricData(data)}
            datasetLabel={trans({message: 'Plays'})}
            contentRef={contentRef}
          />
        )}
      </AsyncChart>
      <AsyncChart metric="platforms" model={model} dateRange={dateRange}>
        {({data, isLoading, contentRef}) => (
          <TopPlatformsChart
            report={data}
            isLoading={isLoading}
            contentRef={contentRef}
          />
        )}
      </AsyncChart>
    </div>
  );
}

function metricData<T>(report?: ReportMetric<T>): T[] | undefined {
  return report?.datasets?.[0]?.data;
}

function PlaysChart({
  report,
  isLoading,
  contentRef,
}: {
  report?: ReportMetric;
  isLoading: boolean;
  contentRef: Ref<HTMLDivElement | null>;
}) {
  const {localeCode} = useSelectedLocale();
  const data = metricData(report) as
    | {date: string; value: number; endDate?: string}[]
    | undefined;

  return (
    <Card size="sm" className="col-span-8 row-span-11">
      <Card.Header>
        <Card.Title>
          <Trans message="Plays" />
        </Card.Title>
        <Card.Description>
          <Trans
            message=":count total plays"
            values={{
              count: <FormattedNumber value={report?.total || 0} />,
            }}
          />
        </Card.Description>
      </Card.Header>
      <Card.Content ref={contentRef} className="relative flex-1">
        <Chart.Container className="h-full w-full">
          <AreaChart data={data} margin={{left: 0}}>
            <linearGradient id="fillPlays" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop
                offset="95%"
                stopColor="var(--chart-1)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              interval="preserveStartEnd"
              tickFormatter={(value, index) => {
                const dataItem = data?.[index];
                if (!dataItem) return value;
                return generateTimeChartLabel({
                  locale: localeCode,
                  granularity: report?.granularity,
                  dataItem,
                });
              }}
            />
            <YAxis
              dataKey="value"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 'dataMax']}
              hide
            />
            <Chart.Tooltip
              content={
                <Chart.TooltipContent
                  itemName={<Trans message="Plays" />}
                  labelFormatter={(_, payload) =>
                    generateTimeChartTooltip({
                      locale: localeCode,
                      granularity: report?.granularity,
                      dataItem: payload?.[0]?.payload,
                    })
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#fillPlays)"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </Chart.Container>
        {isLoading && <Chart.LoadingIndicator />}
        {!isLoading && !data?.length && <Chart.NoDataIndicator />}
      </Card.Content>
    </Card>
  );
}

function TopDevicesChart({
  report,
  isLoading,
  contentRef,
}: {
  report?: ReportMetric;
  isLoading: boolean;
  contentRef: Ref<HTMLDivElement | null>;
}) {
  const dataWithColors = useChartDataWithColors(metricData(report));
  const biggestSectorIndex = useMemo(
    () =>
      dataWithColors.reduce(
        (biggestIndex: number, item: any, index, items: any[]) => {
          if (biggestIndex === -1) return index;
          return item.value > items[biggestIndex].value ? index : biggestIndex;
        },
        -1,
      ),
    [dataWithColors],
  );

  return (
    <Card size="sm" className="col-span-4 row-span-11">
      <Card.Header>
        <Card.Title>
          <Trans message="Top devices" />
        </Card.Title>
      </Card.Header>
      <Card.Content ref={contentRef} className="relative flex-1">
        <Chart.Container className="h-full w-full">
          <PieChart>
            <Chart.Tooltip cursor={false} content={<Chart.TooltipContent />} />
            <Pie
              data={dataWithColors}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              shape={({
                index,
                outerRadius = 0,
                ...props
              }: PieSectorShapeProps) =>
                index === biggestSectorIndex ? (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                ) : (
                  <Sector {...props} outerRadius={outerRadius} />
                )
              }
            >
              <LabelList
                dataKey="label"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </Chart.Container>
        {isLoading && <Chart.LoadingIndicator />}
        {!isLoading && !dataWithColors.length && <Chart.NoDataIndicator />}
      </Card.Content>
    </Card>
  );
}

function TopPlatformsChart({
  report,
  isLoading,
  contentRef,
}: {
  report?: ReportMetric;
  isLoading: boolean;
  contentRef: Ref<HTMLDivElement | null>;
}) {
  const dataWithColors = useChartDataWithColors(metricData(report));

  return (
    <Card size="sm" className="col-span-5 row-span-11">
      <Card.Header>
        <Card.Title>
          <Trans message="Top platforms" />
        </Card.Title>
      </Card.Header>
      <Card.Content ref={contentRef} className="relative flex-1">
        <Chart.Container className="h-full w-full">
          <BarChart accessibilityLayer layout="vertical" data={dataWithColors}>
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="value" type="number" hide />
            <Chart.Tooltip
              content={
                <Chart.TooltipContent itemName={<Trans message="Plays" />} />
              }
            />
            <Bar dataKey="value" radius={5} />
          </BarChart>
        </Chart.Container>
        {isLoading && <Chart.LoadingIndicator />}
        {!isLoading && !dataWithColors.length && <Chart.NoDataIndicator />}
      </Card.Content>
    </Card>
  );
}

interface AsyncChartProps<M extends InsightsReportMetric> {
  children: (props: {
    data: FetchInsightsReportResponse['report'][M] | undefined;
    isLoading: boolean;
    contentRef: Ref<HTMLDivElement | null>;
  }) => ReactNode;
  metric: M;
  model: string;
  dateRange: DateRangeValue;
}
function AsyncChart<M extends InsightsReportMetric>({
  children,
  metric,
  model,
  dateRange,
}: AsyncChartProps<M>) {
  const [isEnabled, setIsEnabled] = useState(false);
  const query = useInsightsReport(
    {metrics: [metric], model, dateRange},
    {isEnabled},
  );
  const observerRef = useRef<IntersectionObserver>(null);

  const contentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      const observer = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            setIsEnabled(true);
            observerRef.current?.disconnect();
            observerRef.current = null;
          }
        },
        {threshold: 0.1}, // if only header is visible, don't load
      );
      observerRef.current = observer;
      observer.observe(el);
    } else if (observerRef.current) {
      observerRef.current?.disconnect();
    }
  }, []);

  return children({
    data: query.data?.report?.[metric],
    isLoading: query.isLoading,
    contentRef,
  });
}
