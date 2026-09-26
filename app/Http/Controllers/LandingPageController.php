<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Common\Billing\Models\Product;
use Common\Billing\Products\ProductResource;
use Common\Core\Rendering\RendersClientSideApp;
use Illuminate\Routing\Controller;

class LandingPageController extends Controller
{
    use RendersClientSideApp;

    public function __invoke()
    {
        return $this->clientSideOrPrerenderedResponse([
            'pageName' => 'landing-page',
            'loader' => 'landingPage',
            'data' => self::getData(),
        ]);
    }

    public static function getData()
    {
        $channels = collect(settings('landingPage.sections'))
            ->filter(fn($s) => isset($s['channelId']))
            ->map(function ($s) {
                $channel = Channel::query()->find($s['channelId']);
                if ($channel) {
                    $channel->loadContent(['perPage' => 10]);
                    return $channel->toApiResource();
                }
            })
            ->filter()
            ->values();

        $products = Product::query()
            ->with(['permissions', 'prices'])
            ->orderBy('position', 'asc')
            ->simplePaginate(15);

        return [
            'products' => ProductResource::collection($products)
                ->response(request())
                ->getData(true),
            'sections' => settings('landingPage.sections'),
            'channels' => $channels,
        ];
    }
}
