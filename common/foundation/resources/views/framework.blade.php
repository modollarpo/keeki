@php
    use Illuminate\Support\Js;
    use Sentry\Laravel\Integration;
@endphp

<!DOCTYPE html>
<html
    lang="{{ $bootstrapData->get('i18n.active') }}"
    dir="{{ $bootstrapData->get('i18n.direction') }}"
    @class ([
        'dark' => $bootstrapData->initialTheme->is_dark,
        'light' => !$bootstrapData->initialTheme->is_dark,
        'is-settings-preview' => $bootstrapData->get('is_settings_preview'),
        'radius-' . ($bootstrapData->initialTheme->radius ?? 'default')
    ])
>
<head>
    <base href="{{ $htmlBaseUri }}" />

    @foreach ($bootstrapData->cssThemes as $theme)
        <style>
            .{{
                $theme->is_dark
                    ? 'dark'
                    : 'light'
            }} {
                {!! $theme->getCssVariables() !!}
            }
        </style>
    @endforeach

    @if (isset($seoTags))
        {!! $seoTags !!}
    @else
        <title>
            {{
                settings(
                    'branding.site_name',
                )
            }}
        </title>
    @endif

    @if (config('app.service_worker_integrated'))
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('{{ url('sw.js') }}', {
                        scope: '/',
                    });
                });
            }
        </script>
    @endif

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
        data-keep="true"
    />
    <link
        rel="icon"
        type="image/x-icon"
        href="{{ url('favicon/icon-144x144.png') }}"
        data-keep="true"
    />
    <link
        rel="apple-touch-icon"
        href="{{ url('favicon/icon-192x192.png') }}"
        data-keep="true"
    />
    <link rel="manifest" href="{{ url('manifest.json') }}" data-keep="true" />

    <meta
        name="theme-color"
        content="{{ $bootstrapData->initialTheme->getHtmlThemeColor() }}"
        data-keep="true"
    />

    @if ($fontFamily = $bootstrapData->initialTheme->getFontFamily())
        @if ($bootstrapData->initialTheme->isGoogleFont())
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossorigin
            />
            <link
                href="https://fonts.googleapis.com/css2?family={{ $fontFamily }}:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
        @endif
    @endif

    <script>
        window.bootstrapData = {!!
            json_encode(
                $bootstrapData->get(),
            )
        !!};
    </script>

    @if (isset($devCssPath))
        <link rel="stylesheet" href="{{ $devCssPath }}" />
    @endif

    @viteReactRefresh
    @vite ('resources/client/main.tsx')

    @if (file_exists($customCssPath))
        @if ($content = file_get_contents($customCssPath))
            <style>
                {!! $content !!}
            </style>
        @endif
    @endif

    @if (file_exists($customHtmlPath))
        @if ($content = file_get_contents($customHtmlPath))
            {!! $content !!}
        @endif
    @endif

    @if ($code = settings('analytics.tracking_code') && $_COOKIE['analytics_consent'] === 'true')
        <!-- Google tag (gtag.js) -->
        <script
            async
            src="https://www.googletagmanager.com/gtag/js?id={{ settings('analytics.tracking_code') }}"
        ></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', '{{
                settings(
                    'analytics.tracking_code',
                )
            }}');
        </script>
    @endif
    {{-- TODO: add a consent banner that sets analytics_consent=true cookie --}}

    @yield ('head-end')
</head>

<body>
    <div id="root">
        {{-- keekii: branded pre-hydration loader. Keep this the only Keekii
             change in this vendor file -- see the partial for the full
             rationale, and re-apply after re-syncing common/foundation. --}}
        @include('loader.app-loader')
    </div>

    <noscript>
        You need to have javascript enabled in order to use
        <strong>{{
            config(
                'app.name',
            )
        }}</strong>
        .
    </noscript>

    @yield ('body-end')
</body>
</html>
