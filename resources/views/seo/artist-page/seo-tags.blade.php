<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="music.musician" />
<title>Listen to {{ $artist['name'] }} | {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="Listen to {{ $artist['name'] }} | {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="Listen to {{ $artist['name'] }} | {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->artist($artist) }}" />
<link rel="canonical" href="{{ urls()->artist($artist) }}" />

@if ($artist['image_small'])
    <meta
        property="og:image"
        content="{{ urls()->image($artist['image_small']) }}"
    />
    <meta property="og:image:alt" content="{{ $artist['name'] }}" />
    <meta name="twitter:image" content="{{ urls()->image($artist['image_small']) }}" />
    <meta name="twitter:image:alt" content="{{ $artist['name'] }}" />
    <meta property="og:width" content="500" />
    <meta property="og:height" content="500" />
@endif

@if (isset($artist['profile']['description']))
    <meta
        property="og:description"
        content="Stream music by {{ $artist['name'] }} on {{ settings('branding.site_name') }}. {{ str($artist['profile']['description'])->limit(200) }}"
    />
    <meta
        name="twitter:description"
        content="Stream music by {{ $artist['name'] }} on {{ settings('branding.site_name') }}. {{ str($artist['profile']['description'])->limit(200) }}"
    />
    <meta
        name="description"
        content="Stream music by {{ $artist['name'] }} on {{ settings('branding.site_name') }}. {{ str($artist['profile']['description'])->limit(200) }}"
    />
@else
    <meta
        property="og:description"
        content="Stream music by {{ $artist['name'] }} and discover similar artists on {{ settings('branding.site_name') }}."
    />
    <meta
        name="twitter:description"
        content="Stream music by {{ $artist['name'] }} and discover similar artists on {{ settings('branding.site_name') }}."
    />
    <meta
        name="description"
        content="Stream music by {{ $artist['name'] }} and discover similar artists on {{ settings('branding.site_name') }}."
    />
@endif
<meta name="keywords" content="{{ $artist['name'] }}, listen, stream, free music, online, {{ settings('branding.site_name') }}" />

<script type="application/ld+json">
    {!!
        collect([
            '@@context' => 'http://schema.org',
            '@@type' => 'MusicGroup',
            '@@id' => urls()->artist($artist),
            'url' => urls()->artist($artist),
            'name' => $artist['name'],
            'image' => urls()->image($artist['image_small']),
            'description' => $artist['profile']['description'] ?? 'Stream music by ' . $artist['name'] . ' on ' . settings('branding.site_name') . '.',
        ])
            ->filter()
            ->toJson()
    !!}
</script>
