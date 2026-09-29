@component('mail::layout')
{{-- Header --}}
@slot('header')
@component('mail::header', ['url' => config('app.url')])
    {{-- Deliberately the static logo, not the branding setting. The wordmark's
         twin-pulse "i"s are CSS inside the SVG, and mail clients either strip the
         style block or refuse the SVG outright, so the animated file is a coin
         flip between a still logo and no logo. A still logo always renders.
         Generated alongside logo-dark.svg by scripts/build-wordmark-logo.ps1. --}}
    <img width="200px" height="auto" src="{{ url('images/logo-dark-static.svg') }}">
@endcomponent
@endslot

{{-- Body --}}
{{ $slot }}

{{-- Subcopy --}}
@isset($subcopy)
@slot('subcopy')
@component('mail::subcopy')
{{ $subcopy }}
@endcomponent
@endslot
@endisset

{{-- Footer --}}
@slot('footer')
@component('mail::footer')
© {{ date('Y') }} {{ config('app.name') }}. @lang('All rights reserved.')
@endcomponent
@endslot
@endcomponent
