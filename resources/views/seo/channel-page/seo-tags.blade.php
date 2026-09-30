<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="website" />

@if (isset($channel['config']['seoTitle']))
    <title>{{ $channel['config']['seoTitle'] }} | {{ settings('branding.site_name') }}</title>
    <meta property="og:title" content="{{ $channel['config']['seoTitle'] }} | {{ settings('branding.site_name') }}" />
    <meta name="twitter:title" content="{{ $channel['config']['seoTitle'] }} | {{ settings('branding.site_name') }}" />
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
