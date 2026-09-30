<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Filters any music content model by the artist's country.
 *
 * An artist's country lives on its profile (`profile_details.country`).
 * There are therefore two shapes:
 *
 *   Artist   - the model owns the profile directly:
 *              WHERE EXISTS (profile.country = ?)
 *
 *   Album / Track - the model reaches artists through a pivot:
 *              WHERE EXISTS (artists -> profile.country = ?)
 *
 * Models only override countryOwnerRelation() when the country is not held on
 * the model itself.
 */
trait ScopesByCountry
{
    public function scopeInCountry(Builder $query, ?string $iso2): Builder
    {
        $iso2 = static::normalizeCountryCode($iso2);

        if ($iso2 === null) {
            return $query;
        }

        // profile_details.country may store either the ISO-2 code or the
        // human-readable country name (eg "GB" or "United Kingdom"). Match both.
        $values = array_values(
            array_unique(array_merge([$iso2], static::countryNamesFor($iso2))),
        );

        $owner = $this->countryOwnerRelation();

        if ($owner === null) {
            // model owns its own profile (Artist)
            return $this->whereProfileIsIn($query, 'profile', $values);
        }

        return $this->whereProfileIsIn($query, $owner, $values, true);
    }

    /**
     * Where a model's country is inherited from artists rather than held on the
     * model itself. Null means the profile hangs off the model directly.
     */
    protected function countryOwnerRelation(): ?string
    {
        return null;
    }

    /**
     * Filters a relation down to the country. `viaArtists` nests one level
     * deeper, for models whose country comes from their artists rather than
     * from a profile of their own.
     */
    private function whereProfileIsIn(Builder $query, string $relation, array $values, bool $viaArtists = false): Builder
    {
        if (!method_exists($this, $relation)) {
            return $query;
        }

        $isCountry = fn (Builder $profile) => $profile->whereIn('country', $values);

        if ($viaArtists) {
            return $query->whereHas(
                $relation,
                fn (Builder $related) => $related->whereHas('profile', $isCountry),
            );
        }

        return $query->whereHas($relation, $isCountry);
    }

    /**
     * Full country names for an ISO code, from the app's country list
     * (eg code "GB" -> ["United Kingdom"]). Empty when the code is unknown.
     *
     * @return string[]
     */
    private static function countryNamesFor(string $iso2): array
    {
        $list = json_decode(
            \Illuminate\Support\Facades\File::get(
                app('path.common') . '/resources/lists/countries.json',
            ),
            true,
        );

        if (!is_array($list)) {
            return [];
        }

        $code = strtolower($iso2);

        $names = array_map(
            fn($country) => $country['name'],
            array_filter(
                $list,
                fn($country) => strtolower($country['code']) === $code,
            ),
        );

        return is_array($names) ? $names : [];
    }

    /**
     * ISO 3166-1 alpha-2, uppercased. Returns null when the value cannot be a
     * country code, so callers can safely skip the filter.
     */
    public static function normalizeCountryCode(?string $code): ?string
    {
        if (!is_string($code)) {
            return null;
        }

        $code = strtoupper(trim($code));

        return preg_match('/^[A-Z]{2}$/', $code) ? $code : null;
    }
}
