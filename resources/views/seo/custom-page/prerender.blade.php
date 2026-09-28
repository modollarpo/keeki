@extends('common::prerender.base')

@section('head')
    @include($seoTagsView ?? 'seo.custom-page.seo-tags')
@endsection

@section('body')
    @php($page = $data['data'] ?? [])

    <h1>{{ $page['title'] }}</h1>

    <main>
        {!! $page['body'] !!}
    </main>
@endsection
