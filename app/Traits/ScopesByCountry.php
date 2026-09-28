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

        $owner = $this->countryOwnerRelation();

        if ($owner === null) {
            // model owns its own profile (Artist)
            return $this->whereProfileIsIn($query, 'profile', $iso2);
        }

        return $this->whereProfileIsIn($query, $owner, $iso2, true);
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
    private function whereProfileIsIn(Builder $query, string $relation, string $iso2, bool $viaArtists = false): Builder
    {
        if (!method_exists($this, $relation)) {
            return $query;
        }

        $isCountry = fn (Builder $profile) => $profile->where('country', $iso2);

        if ($viaArtists) {
            return $query->whereHas(
                $relation,
                fn (Builder $related) => $related->whereHas('profile', $isCountry),
            );
        }

        return $query->whereHas($relation, $isCountry);
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
