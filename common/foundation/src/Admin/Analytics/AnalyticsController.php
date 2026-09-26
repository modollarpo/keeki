<?php namespace Common\Admin\Analytics;

use Carbon\CarbonImmutable;
use Common\Admin\Analytics\Actions\BuildDemoAnalyticsReport;
use Common\Admin\Analytics\Actions\BuildGoogleAnalyticsReport;
use Common\Admin\Analytics\Actions\BuildNullAnalyticsReport;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\API\ExcludeRoutesFromPublicDocs;
use Common\Database\Metrics\MetricDateRange;
use Exception;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

#[ExcludeRoutesFromPublicDocs]
class AnalyticsController extends Controller
{
    public function report()
    {
        if (
            !Auth::user()?->hasPermission('admin.access') &&
            !Auth::user()?->hasPermission('reports.view')
        ) {
            abort(403);
        }

        $types = explode(',', request('types', 'visitors,header'));
        $cacheKey = json_encode(
            request()->only(
                'startDate',
                'endDate',
                'compareStartDate',
                'compareEndDate',
                'timezone',
                'types',
            ),
        );

        $response = [];
        if (in_array('visitors', $types)) {
            try {
                $builder = config('app.demo')
                    ? BuildDemoAnalyticsReport::class
                    : BuildGoogleAnalyticsReport::class;
                $response['visitorsReport'] = Cache::remember(
                    "adminReport.main.$cacheKey",
                    CarbonImmutable::now()->addDay(),
                    fn() => (new $builder(request()->all()))->execute(),
                );
            } catch (Exception $e) {
                $response['visitorsReport'] = (new BuildNullAnalyticsReport(
                    request()->all(),
                ))->execute();
            }
        }
        if (in_array('header', $types)) {
            $response['headerReport'] = Cache::remember(
                "adminReport.header.$cacheKey",
                CarbonImmutable::now()->addDay(),
                function () {
                    $headerDataAction = app()->get(
                        GetAnalyticsHeaderDataAction::class,
                    );
                    return $headerDataAction->execute(request()->all());
                },
            );
        }

        return response()->json($response);
    }

    protected function getDateRange(): MetricDateRange
    {
        $startDate = request('startDate');
        $endDate = request('endDate');
        $timezone = request('timezone', config('app.timezone'));

        return new MetricDateRange(
            start: $startDate,
            end: $endDate,
            timezone: $timezone,
        );
    }
}
