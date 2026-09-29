@php
    // RendersClientSideApp wraps the resource as ['data' => $resource->resolve()]
    // and then passes that array to the view, which spreads it into variables.
    // So the page lands on $data itself, not on $data['data'].
    $page = $data ?? [];
    // Strip tags, substituting a space so block elements do not run words together
    // ("<h1>Privacy</h1><p>We collect" would otherwise become "PrivacyWe collect").
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
<title>{{ $page['title'] }} - {{ settings('branding.site_name') }}</title>
<meta
    property="og:title"
    content="{{ $page['title'] }} - {{ settings('branding.site_name') }}"
/>
<meta property="og:url" content="{{ urls()->customPage($page) }}" />
<link rel="canonical" href="{{ urls()->customPage($page) }}" />

@if ($description)
    <meta property="og:description" content="{{ $description }}" />
    <meta name="description" content="{{ $description }}" />
@endif
