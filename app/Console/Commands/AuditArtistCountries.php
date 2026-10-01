<?php namespace App\Console\Commands;

use App\Models\Album;
use App\Models\Artist;
use App\Models\ProfileDetails;
use App\Models\Track;
use App\Services\Artists\DetectArtistCountry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Read-only audit of the artist catalogue and of how much real data the
 * country hubs could be fed with.
 *
 * This deliberately writes nothing. It exists to answer, on the live database:
 *
 *   1. Is there any real (provider-backed) catalogue at all?
 *   2. Do artists have Wikipedia bios stored on profile_details.description?
 *   3. Would those bios yield a country, and with what confidence?
 *   4. Which providers are actually reachable from this server?
 */
class AuditArtistCountries extends Command
{
    protected $signature = 'music:audit-countries {--sample=20 : Max inferred artists to print}';

    protected $description = 'Audit real vs demo artists, Wikipedia bios, country inference and provider reachability (read-only)';

    public function handle(DetectArtistCountry $detector): int
    {
        $this->line('<info>== Catalogue ==</info>');

        $artists = Artist::query()->count();
        $albums = Album::query()->count();
        $tracks = Track::query()->count();

        $this->line("artists: $artists");
        $this->line("albums:  $albums");
        $this->line("tracks:  $tracks");

        if ($artists === 0) {
            $this->line('<comment>No artists at all - nothing to map.</comment>');

            return self::SUCCESS;
        }

        $this->newLine();
        $this->probeProviders();

        $this->newLine();
        $this->line('<info>== Artist provenance ==</info>');

        $withSpotify = Artist::query()->whereNotNull('spotify_id')->count();
        $withDeezer = Artist::query()->whereNotNull('deezer_id')->count();
        $withNeither = Artist::query()
            ->whereNull('spotify_id')
            ->whereNull('deezer_id')
            ->count();

        $demo = $this->demoArtistCount();

        $this->line("spotify_id set:  $withSpotify");
        $this->line("deezer_id set:   $withDeezer");
        $this->line("no provider id:  $withNeither");
        $this->line("[Demo] named:     $demo");

        $real = Artist::query()
            ->where(fn ($q) => $q->whereNotNull('spotify_id')->orWhereNotNull('deezer_id'))
            ->count();

        $this->line('<comment>provider-backed (real): '.$real.'</comment>');

        $this->newLine();
        $this->line('<info>== Wikipedia bios ==</info>');

        $withBio = ProfileDetails::query()
            ->whereNotNull('description')
            ->where('description', '!=', '')
            ->count();

        $this->line("profile_details rows with description: $withBio");

        if ($withBio === 0) {
            $this->line('<comment>No stored bios, so nothing can be inferred yet. Bios arrive via MusicMetadataProvider::importArtist.</comment>');
        }

        $this->newLine();
        $this->line('<info>== Current country mapping ==</info>');

        $this->auditCurrentMapping();

        $this->newLine();
        $this->line('<info>== Country inference (dry run) ==</info>');

        $this->auditInference($detector);

        return self::SUCCESS;
    }

    /**
     * @return int
     */
    private function demoArtistCount(): int
    {
        return Artist::query()
            ->where('name', 'like', '%[Demo]%')
            ->count();
    }

    private function probeProviders(): void
    {
        $this->line('<info>== Provider reachability ==</info>');

        // Spotify credentials present?
        $spotifyId = config('services.spotify.id');
        $spotifySecret = config('services.spotify.secret');

        $this->line('spotify id set:    '.(filled($spotifyId) ? 'yes' : 'NO'));
        $this->line('spotify secret set:'.(filled($spotifySecret) ? ' yes' : ' NO'));

        // Spotify token probe
        if (filled($spotifyId) && filled($spotifySecret)) {
            try {
                $res = Http::asForm()
                    ->withBasicAuth($spotifyId, $spotifySecret)
                    ->timeout(8)
                    ->post('https://accounts.spotify.com/api/token', [
                        'grant_type' => 'client_credentials',
                    ]);

                $this->line('spotify token:    '.($res->successful() ? 'OK' : 'FAILED ('.$res->status().')'));
            } catch (\Throwable $e) {
                $this->line('spotify token:    ERROR '.$e->getMessage());
            }
        }

        // Deezer probe - public API, no credentials
        try {
            $res = Http::timeout(8)
                ->withHeaders(['User-Agent' => 'Mozilla/5.0'])
                ->get('https://api.deezer.com/search/artist', ['q' => 'Burna Boy', 'limit' => 3]);

            $total = $res->successful() ? ($res->json('total') ?? 0) : 0;

            $this->line('deezer search:    '.($res->successful() ? "OK ($total results)" : 'FAILED ('.$res->status().')'));
        } catch (\Throwable $e) {
            $this->line('deezer search:    ERROR '.$e->getMessage());
        }

        // Wikipedia probe, using the same title scheme as FetchesExternalArtistBio
        try {
            $res = Http::timeout(8)
                ->withUserAgent('Mozilla/5.0')
                ->get('https://en.wikipedia.org/w/api.php', [
                    'format' => 'json',
                    'action' => 'query',
                    'prop' => 'extracts',
                    'exintro' => 1,
                    'explaintext' => 1,
                    'titles' => 'Burna Boy|Burna_Boy_(rapper)|Burna_Boy_(band)|Burna_Boy_(singer)',
                    'redirects' => 1,
                ]);

            $extract = '';

            foreach ($res->json('query.pages') ?? [] as $page) {
                if (!empty($page['extract'])) {
                    $extract = $page['extract'];
                    break;
                }
            }

            $this->line('wikipedia:        '.($extract !== ''
                ? 'OK ('.Str::limit(trim(preg_replace('/\s+/', ' ', $extract)), 90).')'
                : 'NO EXTRACT ('.$res->status().')'));
        } catch (\Throwable $e) {
            $this->line('wikipedia:        ERROR '.$e->getMessage());
        }
    }

    private function auditCurrentMapping(): void
    {
        $codes = $this->marketCodes();

        $rows = [];

        foreach ($codes as $code) {
            $countryArtists = Artist::query()->inCountry($code)->count();

            $real = Artist::query()
                ->inCountry($code)
                ->where(fn ($q) => $q->whereNotNull('spotify_id')->orWhereNotNull('deezer_id'))
                ->count();

            $rows[] = sprintf(
                '  %s  artists=%-4d real=%-4d demo=%-4d',
                $code,
                $countryArtists,
                $real,
                $countryArtists - $real,
            );
        }

        $this->line(implode(PHP_EOL, $rows));

        $untagged = Artist::query()
            ->where(fn ($q) => $q
                ->whereNull('spotify_id')
                ->whereNull('deezer_id')
            )
            ->whereDoesntHave('profile', fn ($q) => $q->whereNotNull('country')->where('country', '!=', ''))
            ->count();

        $this->line("artists with no country and no provider id: $untagged");
    }

    private function auditInference(DetectArtistCountry $detector): void
    {
        $candidates = Artist::query()
            ->with('profile')
            ->where('name', 'not like', '%[Demo]%')
            ->whereHas('profile', fn ($q) => $q->whereNotNull('description')->where('description', '!=', ''))
            ->limit(500)
            ->get();

        if ($candidates->isEmpty()) {
            $this->line('<comment>No non-demo artists with a stored bio - inference cannot be demonstrated yet.</comment>');

            return;
        }

        $this->line('non-demo artists with bio: '.$candidates->count());

        $decided = 0;
        $ambiguous = 0;
        $rows = [];
        $sample = (int) $this->option('sample');

        foreach ($candidates as $artist) {
            $bio = $artist->profile?->description;

            $result = $detector->detect($bio, $artist->name);

            if ($result['method'] === 'ambiguous') {
                $ambiguous++;
            }

            if ($result['code']) {
                $decided++;
            }

            if ($sample > 0 && count($rows) < $sample) {
                $rows[] = sprintf(
                    '  %-28s -> %-4s %-16s conf=%-5s rule=%-18s phrase=%s',
                    Str::limit($artist->name, 28),
                    $result['code'] ?? '--',
                    Str::limit((string) $result['name'], 16),
                    (string) $result['confidence'],
                    $result['all'][0]['rule'] ?? '-',
                    $result['phrase'] ?? '-',
                );
            }
        }

        $this->line($rows ? implode(PHP_EOL, $rows) : '  (no sample rows)');
        $this->line("would resolve to a country: $decided / ".$candidates->count());
        $this->line("ambiguous (would need review): $ambiguous");
    }

    /**
     * @return array<int, string>
     */
    private function marketCodes(): array
    {
        $path = base_path('resources/defaults/channels/country-channels.json');

        if (!file_exists($path)) {
            return [];
        }

        $data = json_decode(file_get_contents($path), true) ?: [];

        $codes = [];

        foreach ($data as $entry) {
            $country = $entry['config']['contentCountry'] ?? null;

            if (is_string($country) && $country !== '') {
                $codes[] = strtoupper($country);
            }
        }

        return array_values(array_unique($codes));
    }
}