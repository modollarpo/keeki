@php
    $siteName = settings('branding.site_name') ?: 'Keekii';
    $path = $page['path'] ?? '/';
    $canonical = url(ltrim($path, '/'));
    $title = $page['title'] ?? $siteName;
    $description = $page['description'] ?? '';
@endphp

<meta property="og:site_name" content="{{ $siteName }}" />
<meta property="og:type" content="website" />
<meta property="twitter:card" content="summary_large_image" />

<title>{{ $title }} | {{ $siteName }}</title>
<meta property="og:title" content="{{ $title }} | {{ $siteName }}" />
<meta name="twitter:title" content="{{ $title }} | {{ $siteName }}" />

<meta property="og:url" content="{{ $canonical }}" />
<link rel="canonical" href="{{ $canonical }}" />

@if ($description)
    <meta property="og:description" content="{{ $description }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="description" content="{{ $description }}" />
@endif
