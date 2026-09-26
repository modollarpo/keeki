<?php namespace App\Http\Controllers;

use Common\Core\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Arr;

class RadioBrowserController extends BaseController
{
    private const RADIO_API = 'https://de1.api.radio-browser.info/json';

    public function search(Request $request)
    {
        $query = $request->get('q') ?: $request->get('query');
        $tag = $request->get('tag');
        $country = $request->get('country');

        try {
            $params = [
                'limit' => 30,
                'hidebroken' => 'true',
            ];

            if ($query) {
                $params['name'] = $query;
            }
            if ($tag) {
                $params['tag'] = $tag;
            }
            if ($country) {
                $params['country'] = $country;
            }

            $endpoint = $query || $tag || $country 
                ? self::RADIO_API . '/stations/search' 
                : self::RADIO_API . '/stations/topclick/30';

            $response = Http::timeout(8)
                ->withHeaders(['User-Agent' => 'BeMusic/1.0'])
                ->get($endpoint, $params);

            if ($response->successful()) {
                $stations = $response->json();
                $results = [];
                foreach ($stations as $station) {
                    $id = Arr::get($station, 'stationuuid');
                    $name = Arr::get($station, 'name');
                    $url = Arr::get($station, 'url_resolved') ?? Arr::get($station, 'url');
                    $favicon = Arr::get($station, 'favicon');
                    $countryName = Arr::get($station, 'country');
                    if ($id && $url) {
                        $results[] = [
                            'id' => $id,
                            'title' => trim($name),
                            'artist' => $countryName ? "Live Radio ($countryName)" : 'Live Radio',
                            'image' => $favicon ?: null,
                            'url' => $url,
                            'provider' => 'htmlAudio',
                        ];
                    }
                }
                return $this->success(['data' => $results]);
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return $this->success(['data' => []]);
    }
}
