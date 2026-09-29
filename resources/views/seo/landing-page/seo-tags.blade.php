<meta property="og:site_name" content="{{ settings('branding.site_name') }}" />
<meta property="twitter:card" content="summary" />
<meta property="og:type" content="website" />
<title>
    {{ settings('branding.site_name') }} - Every song, every artist, one place.
</title>
<meta
    property="og:title"
    content="{{ settings('branding.site_name') }} - Every song, every artist, one place."
/>
<meta property="og:url" content="{{ urls()->home() }}" />
<link rel="canonical" href="{{ urls()->home() }}" />

<meta
    property="og:description"
    content="Keekii brings the music you love — and sounds you have not found yet — into one beautifully curated listening experience. Listen completely free."
/>
<meta
    name="description"
    content="Keekii brings the music you love — and sounds you have not found yet — into one beautifully curated listening experience. Listen completely free."
/>
<meta
    property="keywords"
    content="music, online, listen, streaming, play, digital, album, artist, playlist, radio"
/>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{ settings('branding.site_name') }}",
  "url": "{{ urls()->home() }}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "{{ urls()->home() }}search/{search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ settings('branding.site_name') }}",
  "url": "{{ urls()->home() }}",
  "logo": "{{ urls()->home() }}{{ settings('branding.logo_dark') }}"
}
</script>
