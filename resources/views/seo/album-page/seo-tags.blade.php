<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="music.album" />
<meta property="music.release_date" content="{{ $album['release_date'] }}" />
<title>
    Listen to {{ $album['name'] }} by {{ $album['artists'][0]['name'] }} | {{ settings('branding.site_name') }}
</title>
<meta
    property="og:title"
    content="Listen to {{ $album['name'] }} by {{ $album['artists'][0]['name'] }} | {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="Listen to {{ $album['name'] }} by {{ $album['artists'][0]['name'] }} | {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->album($album) }}" />
<link rel="canonical" href="{{ urls()->album($album) }}" />

@if ($album['image'])
    <meta property="og:image" content="{{ urls()->image($album['image']) }}" />
    <meta property="og:image:alt" content="{{ $album['name'] }} Album Cover" />
    <meta name="twitter:image" content="{{ urls()->image($album['image']) }}" />
    <meta name="twitter:image:alt" content="{{ $album['name'] }} Album Cover" />
    <meta property="og:width" content="500" />
    <meta property="og:height" content="500" />
@endif

<meta
    property="og:description"
    content="Stream, share, and discover {{ $album['name'] }}, the critically acclaimed album by {{ $album['artists'][0]['name'] }}. Experience high-quality audio on {{ settings('branding.site_name') }}."
/>
<meta
    name="twitter:description"
    content="Stream, share, and discover {{ $album['name'] }}, the critically acclaimed album by {{ $album['artists'][0]['name'] }}. Experience high-quality audio on {{ settings('branding.site_name') }}."
/>
<meta
    name="description"
    content="Stream, share, and discover {{ $album['name'] }}, the critically acclaimed album by {{ $album['artists'][0]['name'] }}. Experience high-quality audio on {{ settings('branding.site_name') }}."
/>
<meta name="keywords" content="{{ $album['name'] }}, {{ $album['artists'][0]['name'] }}, listen, stream, album, free music, online, playlist, {{ settings('branding.site_name') }}" />

<script type="application/ld+json">
    {!!
        collect([
            '@@context' => 'http://schema.org',
            '@@type' => 'MusicAlbum',
            '@@id' => urls()->album($album),
            'url' => urls()->album($album),
            'datePublished' => $album['release_date'],
            'name' => $album['name'],
            'image' => $album['image'] ? urls()->image($album['image']) : null,
            'description' => 'Stream, share, and discover ' . $album['name'] . ' album by ' . $album['artists'][0]['name'] . '.',
            'byArtist' => [
                '@@type' => 'MusicGroup',
                'name' => $album['artists'][0]['name'],
                'url' => urls()->artist($album['artists'][0])
            ]
        ])
            ->filter()
            ->toJson()
    !!}
</script>
