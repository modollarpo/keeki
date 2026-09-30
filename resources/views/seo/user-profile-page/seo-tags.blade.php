<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary" />
<meta property="og:type" content="profile" />
<title>{{ $user['name'] }} | Listen on {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="{{ $user['name'] }} | Listen on {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="{{ $user['name'] }} | Listen on {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->user($user) }}" />
<link rel="canonical" href="{{ urls()->user($user) }}" />

@if ($user['image'])
    <meta property="og:image" content="{{ urls()->image($user['image']) }}" />
    <meta property="og:image:alt" content="{{ $user['name'] }}" />
    <meta name="twitter:image" content="{{ urls()->image($user['image']) }}" />
    <meta property="og:width" content="200" />
    <meta property="og:height" content="200" />
@endif

@if (isset($user['profile']['description']) && !empty($user['profile']['description']))
    <meta
        property="og:description"
        content="{{ $user['profile']['description'] }} - Discover their music and playlists on {{ settings('branding.site_name') }}."
    />
    <meta
        name="twitter:description"
        content="{{ $user['profile']['description'] }} - Discover their music and playlists on {{ settings('branding.site_name') }}."
    />
    <meta
        name="description"
        content="{{ $user['profile']['description'] }} - Discover their music and playlists on {{ settings('branding.site_name') }}."
    />
@else
    <meta
        property="og:description"
        content="Check out {{ $user['name'] }}'s profile, playlists, and music library on {{ settings('branding.site_name') }}."
    />
    <meta
        name="twitter:description"
        content="Check out {{ $user['name'] }}'s profile, playlists, and music library on {{ settings('branding.site_name') }}."
    />
    <meta
        name="description"
        content="Check out {{ $user['name'] }}'s profile, playlists, and music library on {{ settings('branding.site_name') }}."
    />
@endif
