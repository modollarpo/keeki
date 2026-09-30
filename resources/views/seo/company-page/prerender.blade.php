@extends('common::prerender.base')

@php
    use App\Support\CompanyPageSeo;

    $siteName = settings('branding.site_name') ?: 'Keekii';
    $path = $page['path'] ?? '/';
    $title = $page['title'] ?? $siteName;
    $description = $page['description'] ?? '';
    $canonical = url(ltrim($path, '/'));
    $otherLinks = collect(CompanyPageSeo::links())
        ->reject(fn($link) => $link['url'] === $canonical)
        ->values();
@endphp

@section('head')
    @include('seo.company-page.seo-tags')
@endsection

@section('body')
    <main>
        <h1>{{ $title }}</h1>

        @if ($description)
            <p>{{ $description }}</p>
        @endif

        <nav aria-label="More from Keekii">
            <h2>Explore Keekii</h2>
            <ul>
                @foreach ($otherLinks as $link)
                    <li>
                        <a href="{{ $link['url'] }}">{{ $link['label'] }}</a>
                    </li>
                @endforeach
            </ul>
        </nav>
    </main>
@endsection
