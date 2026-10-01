<?php

namespace App\Services\Artists;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Infers an artist's country from the artist biography.
 *
 * The provider import already stores a Wikipedia extract on
 * `profile_details.description` (see MusicMetadataProvider::importArtist) and
 * nothing currently reads it. Wikipedia leads are extremely regular, so the
 * nationality is normally stated in the first sentence:
 *
 *   "Burna Boy ... is a Nigerian singer and songwriter."
 *   "Skepta ... is an English rapper."
 *   "Rosalia ... is a Spanish singer."
 *
 * The lead sentence is therefore trusted far more than the rest of the text,
 * where a country name usually describes a tour, a record label or a festival
 * ("after signing in the United States", "toured in Japan").
 */
class DetectArtistCountry
{
    /**
     * Music roles that identify the sentence as a nationality statement.
     */
    private const ROLE_WORDS = 'singer|singers|singer-songwriter|songwriter|rapper|rapper-songwriter|artist|artists|musician|musicians|band|bandleader|composer|producer|record producer|dj|disc jockey|performer|vocalist|guitarist|drummer|beatmaker|multi-instrumentalist|instrumentalist|recordings? artist|recording artist|emcee|mc';

    /**
     * Words that turn a country mention into "they went there" instead of
     * "they are from there".
     */
    private const VISIT_CONTEXT = 'toured?|touring|performed|performing|concert|concerts|festival|festivals|gig|gigs|recorded|records|record deal|signed|signing|chart|charted|played in|played the|appeared|appearance|tour stop|stopped at|visited|visit|headlined|headline|billed|market release|released in|release in|sold in|died in|buried in|settled in|moved to|emigrated to|relocated to';

    /**
     * ISO-2 => demonyms that identify that country.
     *
     * Wikipedia leads use the demonym far more often than the country name
     * ("a Nigerian singer", not "a singer from Nigeria"), so this list is what
     * makes reliable detection possible. "English", "Scottish" and "Welsh" all
     * mean GB, and "South Korean" must not be read as "Korean" (which is not
     * listed at all, since it is ambiguous with the historic country).
     *
     * @var array<string, string[]>
     */
    private const DEMONYMS = [
        // the 15 live country markets
        'NG' => ['Nigerian'],
        'US' => ['American'],
        'GB' => ['British', 'English', 'Scottish', 'Welsh', 'Northern Irish'],
        'IE' => ['Irish'],
        'CA' => ['Canadian'],
        'AU' => ['Australian'],
        'ZA' => ['South African'],
        'GH' => ['Ghanaian'],
        'IN' => ['Indian'],
        'BR' => ['Brazilian'],
        'DE' => ['German'],
        'FR' => ['French'],
        'ES' => ['Spanish'],
        'JP' => ['Japanese'],
        'KR' => ['South Korean'],

        // rest of Europe
        'BE' => ['Flemish', 'Belgian'],
        'AT' => ['Austrian'],
        'CH' => ['Swiss'],
        'NL' => ['Dutch'],
        'SE' => ['Swedish'],
        'NO' => ['Norwegian'],
        'DK' => ['Danish'],
        'FI' => ['Finnish'],
        'IS' => ['Icelandic'],
        'PL' => ['Polish'],
        'PT' => ['Portuguese'],
        'IT' => ['Italian'],
        'GR' => ['Greek'],
        'RO' => ['Romanian'],
        'BG' => ['Bulgarian'],
        'HR' => ['Croatian'],
        'RS' => ['Serbian'],
        'SI' => ['Slovenian'],
        'SK' => ['Slovak'],
        'CZ' => ['Czech'],
        'HU' => ['Hungarian'],
        'UA' => ['Ukrainian'],
        'RU' => ['Russian'],
        'TR' => ['Turkish'],
        'CY' => ['Cypriot'],
        'MT' => ['Maltese'],

        // Americas
        'MX' => ['Mexican'],
        'AR' => ['Argentine', 'Argentinian'],
        'CL' => ['Chilean'],
        'CO' => ['Colombian'],
        'PE' => ['Peruvian'],
        'VE' => ['Venezuelan'],
        'EC' => ['Ecuadorian'],
        'CU' => ['Cuban'],
        'DO' => ['Dominican'],
        'PR' => ['Puerto Rican'],
        'JM' => ['Jamaican'],
        'TT' => ['Trinidadian'],
        'HT' => ['Haitian'],
        'CR' => ['Costa Rican'],
        'PA' => ['Panamanian'],

        // Africa
        'KE' => ['Kenyan'],
        'SN' => ['Senegalese'],
        'CI' => ['Ivorian'],
        'CM' => ['Cameroonian'],
        'AO' => ['Angolan'],
        'MZ' => ['Mozambican'],
        'ZW' => ['Zimbabwean'],
        'ZM' => ['Zambian'],
        'TZ' => ['Tanzanian'],
        'UG' => ['Ugandan'],
        'ET' => ['Ethiopian'],
        'RW' => ['Rwandan'],
        'SO' => ['Somali'],
        'ML' => ['Malian'],
        'BF' => ['Burkinabe'],
        'CD' => ['Congolese'],
        'CG' => ['Congolese'],
        'GA' => ['Gabonese'],
        'BJ' => ['Beninese'],
        'TG' => ['Togolese'],
        'MR' => ['Mauritanian'],
        'SD' => ['Sudanese'],
        'EG' => ['Egyptian'],
        'MA' => ['Moroccan'],
        'DZ' => ['Algerian'],
        'TN' => ['Tunisian'],
        'LY' => ['Libyan'],
        'IL' => ['Israeli'],
        'LB' => ['Lebanese'],

        // Asia, Middle East, Oceania
        'CN' => ['Chinese'],
        'HK' => ['Hongkonger'],
        'TW' => ['Taiwanese'],
        'VN' => ['Vietnamese'],
        'TH' => ['Thai'],
        'PH' => ['Filipino'],
        'ID' => ['Indonesian'],
        'MY' => ['Malaysian'],
        'SG' => ['Singaporean'],
        'PK' => ['Pakistani'],
        'BD' => ['Bangladeshi'],
        'LK' => ['Sri Lankan'],
        'NP' => ['Nepalese'],
        'IR' => ['Iranian'],
        'IQ' => ['Iraqi'],
        'SA' => ['Saudi'],
        'AE' => ['Emirati'],
        'QA' => ['Qatari'],
        'NZ' => ['New Zealand'],
    ];

    /**
     * Country names that are also common English words or person names. A bare
     * mention of these is ignored unless the surrounding words are explicit.
     */
    private const AMBIGUOUS = [
        'chad', 'mali', 'turkey', 'georgia', 'jordan', 'guinea', 'niger',
        'benin', 'togo', 'ghana', 'jersey', 'oman', 'nauru', 'niue', 'palau',
        'qatar', 'samoa', 'senegal', 'union', 'sandwich', 'goose', 'chicken',
    ];

    /** @var array<int, array{name: string, code: string}>|null */
    private ?array $countryList = null;

    private ?string $countryNamePattern = null;

    /** @var array<string, string>|null */
    private ?array $demonymLookup = null;

    private ?string $demonymPattern = null;

    /**
     * @param  string|null  $bioText  Wikipedia extract, eg profile.description
     * @return array{code: ?string, name: ?string, confidence: float, method: string, phrase: ?string, all: array<int, array<string, mixed>>}
     */
    public function detect(?string $bioText, ?string $artistName = null): array
    {
        $empty = [
            'code' => null,
            'name' => null,
            'confidence' => 0.0,
            'method' => 'none',
            'phrase' => null,
            'all' => [],
        ];

        $text = trim((string) $bioText);

        if (mb_strlen($text) < 40) {
            return $empty;
        }

        // Only the lead is trustworthy. Everything after it is biography prose
        // where country names mostly refer to tours and record deals.
        $lead = mb_substr($text, 0, 400);

        $scores = [];

        $this->scoreDemonyms($lead, $scores);
        $this->scoreNationalityLead($lead, $scores);
        $this->scoreBornIn($lead, $scores);
        $this->scoreCountryNames($lead, $text, $scores);

        if (!$scores) {
            return $empty;
        }

        arsort($scores);

        $ranked = [];

        foreach ($scores as $code => $score) {
            $ranked[] = [
                'code' => $code,
                'name' => $this->nameForCode($code),
                'confidence' => round($score['confidence'], 3),
                'phrase' => $score['phrase'],
                'rule' => $score['rule'],
            ];
        }

        $top = $ranked[0];
        $runnerUp = $ranked[1]['confidence'] ?? 0.0;

        // A clear winner is required. Genuine ambiguity must not be silently
        // resolved into a single country.
        $ambiguous = ($top['confidence'] - $runnerUp) < 0.08;
        $confident = $top['confidence'] >= 0.5 && !$ambiguous;

        return [
            'code' => $confident ? $top['code'] : null,
            'name' => $confident ? $top['name'] : null,
            'confidence' => $top['confidence'],
            'method' => $ambiguous ? 'ambiguous' : 'bio',
            'phrase' => $top['phrase'],
            'all' => $ranked,
        ];
    }

    /**
     * @param  array<string, array{confidence: float, phrase: string, rule: string}>  $scores
     */
    private function addScore(array &$scores, string $code, float $confidence, string $phrase, string $rule): void
    {
        // keep only the strongest rule that matched this country
        if (isset($scores[$code]) && $scores[$code]['confidence'] >= $confidence) {
            return;
        }

        $scores[$code] = [
            'confidence' => $confidence,
            'phrase' => $phrase,
            'rule' => $rule,
        ];
    }

    /**
     * "a Nigerian singer", "an English rapper" - the canonical Wikipedia lead.
     *
     * @param  array<string, array{confidence: float, phrase: string, rule: string}>  $scores
     */
    private function scoreDemonyms(string $lead, array &$scores): void
    {
        // "British-American": Wikipedia lists the subject's primary nationality
        // first, so the leading demonym wins outright. The trailing demonym must
        // not also score on its own, or the pair looks ambiguous.
        $suppressed = [];

        $dualPattern = '/\b('.$this->demonymPattern().')\b\s*[-–]\s*('
            .$this->demonymPattern().')\b/iu';

        if (preg_match_all($dualPattern, $lead, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $primary = $this->codeForDemonym($match[1]);
                $trailing = $this->codeForDemonym($match[2]);

                if ($primary) {
                    $this->addScore($scores, $primary, 1.0, trim($match[1]), 'dual-nationality');
                }

                if ($trailing) {
                    $suppressed[$trailing] = true;
                }
            }
        }

        $isSuppressed = fn(string $demonym): bool => isset($suppressed[$this->codeForDemonym($demonym)]);

        // "a Nigerian singer", "an English rapper" - the canonical lead.
        $pattern = '/\b('.$this->demonymPattern().')\b\s+(?:'.self::ROLE_WORDS.')\b/iu';

        if (preg_match_all($pattern, $lead, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $code = $this->codeForDemonym($match[1]);

                if ($code && !$isSuppressed($match[1])) {
                    $this->addScore($scores, $code, 0.95, trim($match[1]), 'demonym+role');
                }
            }
        }

        // A bare demonym early in the lead is a weaker but still useful signal.
        if (preg_match_all('/\b('.$this->demonymPattern().')\b/iu', $lead, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $code = $this->codeForDemonym($match[1]);

                if ($code && !$isSuppressed($match[1])) {
                    $this->addScore($scores, $code, 0.62, trim($match[1]), 'demonym-in-lead');
                }
            }
        }
    }

    /**
     * "is a ... singer" where the nationality was missed by the demonym list.
     *
     * @param  array<string, array{confidence: float, phrase: string, rule: string}>  $scores
     */
    private function scoreNationalityLead(string $lead, array &$scores): void
    {
        $pattern = '/\b(?:is|was|are|were)\s+(?:a|an)\s+([A-Z][a-z]+(?:[- ][A-Z][a-z]+)?)\s+(?:'
            .self::ROLE_WORDS.')/u';

        if (preg_match_all($pattern, $lead, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $code = $this->codeForDemonym($match[1]);

                if ($code) {
                    $this->addScore($scores, $code, 0.9, trim($match[1]), 'is-a-nationality');
                }
            }
        }
    }

    /**
     * "born in Surulere, Lagos, Nigeria" - the birthplace is the strongest
     * signal available when it names a country.
     *
     * @param  array<string, array{confidence: float, phrase: string, rule: string}>  $scores
     */
    private function scoreBornIn(string $lead, array &$scores): void
    {
        $patterns = [
            '/\bborn\b[^.]{0,160}?,\s*('.$this->countryNamePattern().')\b/u',
            '/\bborn\s+in\s+('.$this->countryNamePattern().')\b/u',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $lead, $matches, PREG_SET_ORDER)) {
                foreach ($matches as $match) {
                    $code = $this->codeForCountryName($match[1]);

                    if ($code) {
                        $this->addScore($scores, $code, 0.85, trim($match[1]), 'born-in');
                    }
                }
            }
        }
    }

    /**
     * Country names in prose, weighted by position and context.
     *
     * @param  array<string, array{confidence: float, phrase: string, rule: string}>  $scores
     */
    private function scoreCountryNames(string $lead, string $text, array &$scores): void
    {
        $pattern = '/\b('.$this->countryNamePattern().')\b/u';

        foreach ([[$lead, 0.5], [$text, 0.2]] as [$haystack, $base]) {
            if (!preg_match_all($pattern, $haystack, $matches, PREG_OFFSET_CAPTURE)) {
                continue;
            }

            foreach ($matches[1] as $match) {
                $name = trim($match[0]);
                $offset = $match[1];

                $code = $this->codeForCountryName($name);

                if (!$code) {
                    continue;
                }

                // "toured in Japan", "signed in the United States"
                if ($this->isVisitContext(substr($haystack, max(0, $offset - 70), 90))) {
                    continue;
                }

                $before = substr($haystack, max(0, $offset - 24), 24);
                $confidence = $base;

                if (in_array(Str::lower($name), self::AMBIGUOUS, true)) {
                    // ambiguous names need an explicit "from/based in" to count
                    if (!preg_match('/(?:from|based in|originates? in|born in|hails? from)\s+$/i', $before)) {
                        continue;
                    }
                    $confidence = 0.55;
                }

                if (preg_match('/(?:from|based in|originat\w+ in|hails? from)\s+$/i', $before)) {
                    $confidence = max($confidence, 0.6);
                }

                // "Nigeria-born", "South-African-born"
                if (preg_match('/'.$this->countryNamePattern().'[-–]\w+/u', substr($haystack, $offset, 30))) {
                    $confidence = max($confidence, 0.65);
                }

                $this->addScore($scores, $code, $confidence, $name, 'country-name');
            }
        }
    }

    private function isVisitContext(string $window): bool
    {
        return (bool) preg_match('/\b(?:'.self::VISIT_CONTEXT.')\b/i', $window);
    }

    /**
     * demonym (lowercased) => ISO-2 code.
     *
     * @return array<string, string>
     */
    private function demonymLookup(): array
    {
        if ($this->demonymLookup !== null) {
            return $this->demonymLookup;
        }

        $lookup = [];

        foreach (self::DEMONYMS as $code => $demonyms) {
            foreach ($demonyms as $demonym) {
                $lookup[Str::lower($demonym)] = $code;
            }
        }

        return $this->demonymLookup = $lookup;
    }

    private function demonymPattern(): string
    {
        if ($this->demonymPattern !== null) {
            return $this->demonymPattern;
        }

        $names = array_keys($this->demonymLookup());

        // longest first, so "South African" is matched before "African"-style
        // shorter prefixes
        usort($names, fn($a, $b) => strlen($b) <=> strlen($a));

        return $this->demonymPattern = implode('|', array_map(
            fn($n) => preg_quote($n, '/'),
            $names,
        ));
    }

    private function countryNamePattern(): string
    {
        if ($this->countryNamePattern !== null) {
            return $this->countryNamePattern;
        }

        $names = array_map(fn($c) => $c['name'], $this->countries());

        // longest first so "South Africa" wins over shorter prefixes
        usort($names, fn($a, $b) => strlen($b) <=> strlen($a));

        return $this->countryNamePattern = implode('|', array_map(
            fn($n) => preg_quote($n, '/'),
            $names,
        ));
    }

    /**
     * @return array<int, array{name: string, code: string}>
     */
    private function countries(): array
    {
        if ($this->countryList !== null) {
            return $this->countryList;
        }

        $list = json_decode(
            File::get(app('path.common').'/resources/lists/countries.json'),
            true,
        );

        return $this->countryList = is_array($list) ? $list : [];
    }

    private function codeForCountryName(string $name): ?string
    {
        $needle = Str::lower(trim($name));

        foreach ($this->countries() as $country) {
            if (Str::lower($country['name']) === $needle) {
                return strtoupper($country['code']);
            }
        }

        return null;
    }

    private function codeForDemonym(string $demonym): ?string
    {
        return $this->demonymLookup()[Str::lower(trim($demonym))] ?? null;
    }

    private function nameForCode(string $code): ?string
    {
        foreach ($this->countries() as $country) {
            if (strtoupper($country['code']) === $code) {
                return $country['name'];
            }
        }

        return null;
    }
}