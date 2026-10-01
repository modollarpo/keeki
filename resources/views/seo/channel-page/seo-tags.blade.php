<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="website" />

{{-- A channel may already name the site in its own title (the country pages do,
     via a {{site_name}} placeholder), and some already end in the site name.
     Appending "| <site>" to those produced "Nigerian Music - Keekii Music |
     Keekii Music". Only add the suffix when it is not already there. --}}
@php
    $channelTitle = isset($channel['config']['seoTitle']) ? trim((string) $channel['config']['seoTitle']) : null;
    $siteName = trim((string) settings('branding.site_name'));
    $pageTitle = $channelTitle === null || $channelTitle === ''
        ? null
        : (stripos($channelTitle, $siteName) !== false ? $channelTitle : $channelTitle . ' | ' . $siteName);
@endphp

@if ($pageTitle)
    <title>{{ $pageTitle }}</title>
    <meta property="og:title" content="{{ $pageTitle }}" />
    <meta name="twitter:title" content="{{ $pageTitle }}" />
@else
    <title>Explore Music & Discover New Artists | {{ settings('branding.site_name') }}</title>
    <meta property="og:title" content="Explore Music & Discover New Artists | {{ settings('branding.site_name') }}" />
    <meta name="twitter:title" content="Explore Music & Discover New Artists | {{ settings('branding.site_name') }}" />
@endif

<meta property="og:url" content="{{ urls()->channel($channel) }}" />
<link rel="canonical" href="{{ urls()->channel($channel) }}" />

@if (isset($channel['config']['seoDescription']))
    <meta
        property="og:description"
        content="{{ $channel['config']['seoDescription'] }} Listen completely free on {{ settings('branding.site_name') }}."
    />
    <meta
        name="twitter:description"
        content="{{ $channel['config']['seoDescription'] }} Listen completely free on {{ settings('branding.site_name') }}."
    />
    <meta
        name="description"
        content="{{ $channel['config']['seoDescription'] }} Listen completely free on {{ settings('branding.site_name') }}."
    />
@else
    <meta
        property="og:description"
        content="Browse curated playlists, top charts, and new releases on {{ settings('branding.site_name') }}. Start streaming ad-free music today."
    />
    <meta
        name="twitter:description"
        content="Browse curated playlists, top charts, and new releases on {{ settings('branding.site_name') }}. Start streaming ad-free music today."
    />
    <meta
        name="description"
        content="Browse curated playlists, top charts, and new releases on {{ settings('branding.site_name') }}. Start streaming ad-free music today."
    />
@endif
