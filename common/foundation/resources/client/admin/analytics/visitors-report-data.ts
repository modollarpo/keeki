type Granularity = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface VisitorsReportData {
  browsers: {
    data: {
      label: string;
      value: number;
      previousValue: number;
    }[];
  };
  platforms: {
    data: {
      label: string;
      value: number;
      previousValue: number;
    }[];
  };
  devices: {
    data: {
      label: string;
      value: number;
      previousValue?: number;
    }[];
  };
  locations: {
    data: {
      label: string;
      value: number;
      code: string;
      percentage: number;
      previousValue?: number;
    }[];
  };
  page_views: {
    granularity: Granularity;
    total: number;
    data: {
      date: string;
      value: number;
      previousValue?: number;
    }[];
  };
}
