<?php

namespace App\Http\Controllers;

use App\Models\CompanyPageSeoOverride;
use App\Support\CompanyPageSeo;
use Common\Pages\CustomPage;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Gate;

/**
 * Lets an admin edit the SEO title and description of the public pages.
 *
 * These pages are React routes, so their body is a component and cannot be
 * edited as a record. The title and description are a different matter: they are
 * rendered by Blade from `CompanyPageSeo`, which makes them ordinary data with
 * a perfectly good place to keep an admin's changes.
 *
 * The defaults stay in `CompanyPageSeo` and this only stores what was changed,
 * so deleting an override puts the page back to its shipped copy. Authorised
 * against `CustomPage` so the whole thing sits behind the same
 * `custom_pages.update` permission as the page list it appears in.
 */
class CompanyPageSeoController extends Controller
{
    /**
     * Every public page, with its code default alongside the effective copy.
     */
    public function index()
    {
        Gate::authorize('index', CustomPage::class);

        $overrides = CompanyPageSeo::overrides();

        $data = [];

        foreach (CompanyPageSeo::all() as $path => $page) {
            $override = $overrides[$path] ?? [];

            $data[] = [
                'path' => $path,
                'slug' => trim($path, '/'),
                'label' => $page['label'],
                'group' => $page['group'],
                'default_title' => $page['title'],
                'default_description' => $page['description'],
                'title' => $override['title'] ?? $page['title'],
                'description' => $override['description'] ?? $page['description'],
                'is_overridden' => $override !== [],
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Save the override for one page.
     *
     * Clearing both fields deletes the row rather than storing two nulls, so
     * "back to the shipped copy" is the same operation as clearing the form.
     */
    public function update(Request $request)
    {
        Gate::authorize('update', CustomPage::class);

        $validated = $request->validate([
            'path' => ['required', 'string', 'max:191'],
            'title' => ['present', 'nullable', 'string', 'max:255'],
            'description' => ['present', 'nullable', 'string', 'max:1000'],
        ]);

        $path = static::normalizePath($validated['path']);
        $pages = CompanyPageSeo::all();

        abort_if(!array_key_exists($path, $pages), 404);

        $title = static::clean($validated['title'] ?? null);
        $description = static::clean($validated['description'] ?? null);

        if ($title === null && $description === null) {
            CompanyPageSeoOverride::firstWhere('path', $path)?->delete();
        } else {
            CompanyPageSeoOverride::updateOrCreate(
                ['path' => $path],
                ['title' => $title, 'description' => $description],
            );
        }

        return response()->json([
            'data' => [
                'path' => $path,
                'title' => $title ?? $pages[$path]['title'],
                'description' => $description ?? $pages[$path]['description'],
                'is_overridden' => $title !== null || $description !== null,
            ],
        ]);
    }

    /**
     * Drop the override so the page falls back to its shipped copy.
     */
    public function destroy(Request $request)
    {
        Gate::authorize('update', CustomPage::class);

        $validated = $request->validate([
            'path' => ['required', 'string', 'max:191'],
        ]);

        $path = static::normalizePath($validated['path']);

        abort_if(!array_key_exists($path, CompanyPageSeo::all()), 404);

        CompanyPageSeoOverride::firstWhere('path', $path)?->delete();

        return response()->noContent();
    }

    private static function normalizePath(string $path): string
    {
        return '/'.trim($path, '/');
    }

    /**
     * Treat a whitespace-only value as "not set" so the form cannot save a
     * title that renders as an empty document title.
     */
    private static function clean(?string $value): ?string
    {
        $value = $value === null ? null : trim($value);

        return $value === '' ? null : $value;
    }
}