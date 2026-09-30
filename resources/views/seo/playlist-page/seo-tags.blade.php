<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="og:type" content="music.playlist" />

<title>
    {{ $playlist['name'] }} - Playlist by {{ $playlist['editors'][0]['name'] }} | {{ settings('branding.site_name') }}
</title>
<meta
    property="og:title"
    content="{{ $playlist['name'] }} - Playlist by {{ $playlist['editors'][0]['name'] }} | {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="{{ $playlist['name'] }} - Playlist by {{ $playlist['editors'][0]['name'] }} | {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->playlist($playlist) }}" />
<link rel="canonical" href="{{ urls()->playlist($playlist) }}" />

@if (isset($playlist['image']))
    <meta property="og:image" content="{{urls()->image($playlist['image'])}}" />
    <meta property="og:image:alt" content="{{ $playlist['name'] }} Playlist Cover" />
    <meta name="twitter:image" content="{{urls()->image($playlist['image'])}}" />
    <meta name="twitter:image:alt" content="{{ $playlist['name'] }} Playlist Cover" />
    <meta property="og:width" content="500" />
    <meta property="og:height" content="500" />
@endif

@if(isset($playlist['description']) && !empty($playlist['description']))
    <meta property="og:description" content="{{ $playlist['description'] }} - Listen to this playlist on {{ settings('branding.site_name') }}." />
    <meta name="twitter:description" content="{{ $playlist['description'] }} - Listen to this playlist on {{ settings('branding.site_name') }}." />
    <meta name="description" content="{{ $playlist['description'] }} - Listen to this playlist on {{ settings('branding.site_name') }}." />
@else
    <meta property="og:description" content="Listen to the {{ $playlist['name'] }} playlist by {{ $playlist['editors'][0]['name'] }} on {{ settings('branding.site_name') }}. Enjoy a curated selection of songs perfectly suited for your mood." />
    <meta name="twitter:description" content="Listen to the {{ $playlist['name'] }} playlist by {{ $playlist['editors'][0]['name'] }} on {{ settings('branding.site_name') }}. Enjoy a curated selection of songs perfectly suited for your mood." />
    <meta name="description" content="Listen to the {{ $playlist['name'] }} playlist by {{ $playlist['editors'][0]['name'] }} on {{ settings('branding.site_name') }}. Enjoy a curated selection of songs perfectly suited for your mood." />
@endif
<meta name="keywords" content="{{ $playlist['name'] }}, playlist, listen, stream, free music, online, curated, {{ settings('branding.site_name') }}" />

<script type="application/ld+json">
    {!! collect([
        '@@context' => 'http://schema.org',
        '@@type' => 'MusicPlaylist',
        '@@id' => urls()->playlist($playlist),
        'url' => urls()->playlist($playlist),
        'name' => $playlist['name'],
        'numTracks' => $playlist['tracks_count'],
        'image' => urls()->image($playlist['image']),
        'description' => $playlist['description'] ?? 'Listen to the ' . $playlist['name'] . ' playlist by ' . $playlist['editors'][0]['name'] . ' on ' . settings('branding.site_name') . '.',
        'track' => collect($tracks['data'])->take(10)->map(function($track) {
            return collect([
                '@@type' => 'MusicRecording',
                '@@id' => urls()->track($track),
                'url' => urls()->track($track),
                'name' => $track['name'],
                'datePublished' => $track['album']['release_date'] ?? null,
                'byArtist' => [
                    '@@type' => 'MusicGroup',
                    'name' => $track['artists'][0]['name'],
                ]
            ])->filter();
        }),
    ])->filter()->toJson() !!}
</script>
