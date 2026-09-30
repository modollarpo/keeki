@php
    $page = $data ?? [];
    $description = \Illuminate\Support\Str::limit(
        trim(preg_replace('/\s+/', ' ', strip_tags(str_replace(
            ['</p>', '</h1>', '</h2>', '</h3>', '</h4>', '</li>', '</div>', '<br>'],
            ' ',
            $page['body'] ?? '',
        )))),
        160,
    );
@endphp

<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary" />
<meta property="og:type" content="website" />
<title>{{ $page['title'] }} | {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="{{ $page['title'] }} | {{ settings('branding.site_name') }}"
/>
<meta name="twitter:title" content="{{ $page['title'] }} | {{ settings('branding.site_name') }}" />
<meta property="og:url" content="{{ urls()->customPage($page) }}" />
<link rel="canonical" href="{{ urls()->customPage($page) }}" />

@if ($description)
    <meta property="og:description" content="{{ $description }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="description" content="{{ $description }}" />
@endif
