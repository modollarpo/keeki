<?php

namespace App\Http\Controllers;

use App\Support\CompanyPageSeo;
use Common\Core\Rendering\RendersClientSideApp;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

/**
 * Serves Keekii's public marketing, plan and legal pages.
 *
 * The page body is rendered by React, but the SEO tags are rendered by Blade
 * and handed to the client through the `companyPage` bootstrap loader, so the
 * title and description are correct on the server-rendered response as well as
 * after hydration. Crawlers additionally get the `seo.company-page.prerender`
 * view, which contains the page copy and links to the rest of the public pages.
 *
 * Only paths in `CompanyPageSeo` are accepted; anything else 404s rather than
 * silently rendering an empty React route.
 */
class CompanyPageController extends Controller
{
    use RendersClientSideApp;

    public function __invoke(Request $request, string $slug)
    {
        $page = CompanyPageSeo::get($slug);

        abort_if($page === null, 404);

        return $this->clientSideOrPrerenderedResponse([
            'pageName' => 'company-page',
            'loader' => 'companyPage',
            'data' => ['page' => $page],
        ]);
    }
}
