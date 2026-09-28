@extends('common::framework')

{{--
    Keekii typography pairing.

    Body/UI stays Inter (the vendor default, already wired via --font-sans)
    because the product is dense: track lists, tables, settings. Bricolage
    Grotesque is the display face, reserved for brand moments and applied via
    the `keekii-display` utility in resources/client/keekii-brand.css.

    Uses the framework's own @yield('head-end') hook rather than editing the
    vendor layout, and mirrors the preconnect + display=swap pattern the
    framework already uses for per-theme Google Fonts.

    Trade-off: a third-party stylesheet. `display=swap` plus the preconnects
    keep it off the critical path for text rendering; the alternative is a
    self-hosted @fontsource package (new npm dependency + build change).
    Revisit if font-related CLS regresses.
--}}
@section('head-end')
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap">
@endsection

@section('angular-styles')
    {{--angular styles begin--}}
		<link rel="stylesheet" href="client/styles.41f9cd8f18e85618bcff.css" media="print" onload="this.media=&apos;all&apos;">
		<link rel="stylesheet" href="client/styles.41f9cd8f18e85618bcff.css">
	{{--angular styles end--}}
@endsection

@section('angular-scripts')
    {{--angular scripts begin--}}
		<script>setTimeout(function() {
        var spinner = document.querySelector('.global-spinner');
        if (spinner) spinner.style.display = 'flex';
    }, 100);</script>
		<script src="client/runtime-es2015.4ec88a97768e8a190cb3.js" type="module"></script>
		<script src="client/runtime-es5.4ec88a97768e8a190cb3.js" nomodule defer></script>
		<script src="client/polyfills-es5.7dec1fefa52cfcc5108b.js" nomodule defer></script>
		<script src="client/polyfills-es2015.f93fa6be99734e20273f.js" type="module"></script>
		<script src="client/main-es2015.d89b74fa071930a4d73f.js" type="module"></script>
		<script src="client/main-es5.d89b74fa071930a4d73f.js" nomodule defer></script>
	{{--angular scripts end--}}
@endsection
