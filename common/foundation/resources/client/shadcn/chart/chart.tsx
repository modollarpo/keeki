import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import {Spinner} from '@shadcn/spinner/spinner';
import {Trans} from '@ui/i18n/trans';
import {cn} from '@ui/utils/cn';
import {DatabaseIcon} from 'lucide-react';
import {ReactNode, useId} from 'react';

const INITIAL_DIMENSION = {width: 320, height: 200} as const;

function ChartContainer({
  id,
  className,
  children,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<'div'> & {
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children'];
  initialDimension?: {
    width: number;
    height: number;
  };
}) {
  const uniqueId = useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  return (
    <div
      data-slot="chart"
      data-chart={chartId}
      className={cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className,
      )}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer
        initialDimension={initialDimension}
      >
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  payload,
  label,
  labelFormatter,
  itemName,
}: RechartsPrimitive.DefaultTooltipContentProps & {itemName?: ReactNode}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="rounded-card-sm bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 grid min-w-32 items-start gap-1 px-2.5 py-1.5 text-xs shadow-lg ring-1">
      <div className="font-medium">
        {labelFormatter ? labelFormatter(label, payload) : label}
      </div>
      {payload
        .filter(item => item.type !== 'none')
        .map(item => (
          <div
            key={item.name}
            className="[&>svg]:text-muted-foreground flex w-full flex-wrap items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
          >
            <div
              className="size-2.5 rounded-[2px]"
              style={{backgroundColor: item.color ?? item.payload?.fill}}
            />
            <div className="text-muted-foreground">{itemName ?? item.name}</div>
            <div className="text-foreground ml-auto font-mono font-medium tabular-nums">
              {item.value}
            </div>
          </div>
        ))}
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  payload,
  verticalAlign = 'bottom',
}: RechartsPrimitive.DefaultLegendContentProps & {className?: string}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload
        .filter(item => item.type !== 'none')
        .map((item, index) => (
          <div
            key={index}
            className={cn(
              '[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3',
            )}
          >
            <div
              className="size-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color ?? (item.payload as any)?.fill,
              }}
            />
            {item.value}
          </div>
        ))}
    </div>
  );
}

function ChartLoadingIndicator() {
  return (
    <div className="animate-in fade-in absolute inset-0 flex items-center justify-center text-sm">
      <div className="flex flex-col items-center gap-2.5">
        <Spinner />
        <Trans message="Loading data..." />
      </div>
    </div>
  );
}

function ChartNoDataIndicator() {
  return (
    <div className="animate-in fade-in absolute inset-0 flex items-center justify-center text-sm">
      <div className="flex flex-col items-center gap-2.5 p-4 text-center">
        <DatabaseIcon className="size-4" />
        <Trans message="No matching data for the selected filters" />
      </div>
    </div>
  );
}

const Chart = Object.assign(ChartContainer, {
  Container: ChartContainer,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  LoadingIndicator: ChartLoadingIndicator,
  NoDataIndicator: ChartNoDataIndicator,
});

export {Chart};
