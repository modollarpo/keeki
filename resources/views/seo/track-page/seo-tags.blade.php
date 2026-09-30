<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="music.song" />
<meta property="music.duration" content="{{ $track['duration'] }}" />
@if (isset($track['album']))
    <meta property="music.album.track" content="{{ $track['number'] }}" />
    <meta
        property="music.release_date"
        content="{{ $track['album']['release_date'] }}"
    />
@endif

<title>
    Listen to {{ $track['name'] }} by {{ $track['artists'][0]['name'] }} | {{ settings('branding.site_name') }}
</title>
<meta
    property="og:title"
    content="Listen to {{ $track['name'] }} by {{ $track['artists'][0]['name'] }} | {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="Listen to {{ $track['name'] }} by {{ $track['artists'][0]['name'] }} | {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->track($track) }}" />
<link rel="canonical" href="{{ urls()->track($track) }}" />

@if ($track['image'])
    <meta property="og:image" content="{{ urls()->image($track['image']) }}" />
    <meta property="og:image:alt" content="{{ $track['name'] }} by {{ $track['artists'][0]['name'] }}" />
    <meta name="twitter:image" content="{{ urls()->image($track['image']) }}" />
    <meta name="twitter:image:alt" content="{{ $track['name'] }} by {{ $track['artists'][0]['name'] }}" />
    <meta property="og:width" content="500" />
    <meta property="og:height" content="500" />
@endif

<meta
    property="og:description"
    content="Stream {{ $track['name'] }}, a song by {{ $track['artists'][0]['name'] }}. Discover new music, build playlists, and listen ad-free on {{ settings('branding.site_name') }}."
/>
<meta
    name="twitter:description"
    content="Stream {{ $track['name'] }}, a song by {{ $track['artists'][0]['name'] }}. Discover new music, build playlists, and listen ad-free on {{ settings('branding.site_name') }}."
/>
<meta
    name="description"
    content="Stream {{ $track['name'] }}, a song by {{ $track['artists'][0]['name'] }}. Discover new music, build playlists, and listen ad-free on {{ settings('branding.site_name') }}."
/>
<meta name="keywords" content="{{ $track['name'] }}, {{ $track['artists'][0]['name'] }}, song, track, listen, stream, free music, online, playlist, {{ settings('branding.site_name') }}" />

<script type="application/ld+json">
    {!!
        collect([
            '@@context' => 'http://schema.org',
            '@@type' => 'MusicRecording',
            '@@id' => urls()->track($track),
            'url' => urls()->track($track),
            'name' => $track['name'],
            'description' => 'Stream ' . $track['name'] . ', a song by ' . $track['artists'][0]['name'] . ' on ' . settings('branding.site_name') . '.',
            'datePublished' => $track['album']['release_date'] ?? null,
            'duration' => 'PT' . round($track['duration'] / 1000) . 'S',
            'byArtist' => [
                '@@type' => 'MusicGroup',
                'name' => $track['artists'][0]['name'],
                'url' => urls()->artist($track['artists'][0])
            ],
            'inAlbum' => isset($track['album']) ? [
                '@@type' => 'MusicAlbum',
                'name' => $track['album']['name'],
                'url' => urls()->album($track['album'])
            ] : null
        ])
            ->filter()
            ->toJson()
    !!}
</script>
