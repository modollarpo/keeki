<?php namespace App\Console\Commands;

use App\Services\Artists\DetectArtistCountry;
use Illuminate\Console\Command;

/**
 * Regression fixtures for DetectArtistCountry.
 *
 * Every bio below follows the shape of a real Wikipedia lead, because that is
 * exactly the text the provider import stores on
 * `profile_details.description`. Running this needs neither a database nor
 * network access, so the detection rules can be tuned safely:
 *
 *   php artisan music:test-country-detection
 */
class TestCountryDetection extends Command
{
    protected $signature = 'music:test-country-detection';

    protected $description = 'Check country detection against real-world Wikipedia lead fixtures';

    /**
     * artist name => [bio, expected ISO-2 or null]
     *
     * @var array<string, array{0: string, 1: ?string}>
     */
    private const FIXTURES = [
        'Burna Boy' => [
            'Damini Ebunoluwa Ogulu (born 2 July 1991), known professionally as Burna Boy, is a Nigerian singer and songwriter. He is recognized for hisAfro-fusion style.',
            'NG',
        ],
        'Skepta' => [
            'Joseph Junior Adenuga Jr. (born 26 June 1992), known professionally as Skepta, is an English rapper and songwriter.',
            'GB',
        ],
        'Rosalía' => [
            'Rosalía Vila Tobella (born 25 September 1996), known professionally as Rosalía, is a Spanish singer and songwriter.',
            'ES',
        ],
        'Taylor Swift' => [
            'Taylor Alison Swift (born December 13, 1989) is an American singer-songwriter known for narrative songs about her personal life.',
            'US',
        ],
        'Ed Sheeran' => [
            'Edward Christopher Sheeran (born 17 February 1991) is an English singer and songwriter.',
            'GB',
        ],
        'Fela Kuti' => [
            'Olufela Olusegun Oludotun Ransome-Kuti (15 October 1938 - 2 August 1997), known as Fela Kuti, was a Nigerian multi-instrumentalist and bandleader.',
            'NG',
        ],
        'Bad Bunny' => [
            'Benito Antonio Martinez Ocasio, known professionally as Bad Bunny, is a Puerto Rican rapper and singer.',
            'PR',
        ],
        'Tems' => [
            'Temilade Openiyi, known professionally as Tems, is a Nigerian singer and songwriter.',
            'NG',
        ],
        'Stonebwoy' => [
            'Livingstone Etse Satekla, known professionally as Stonebwoy, is a Ghanaian singer and rapper.',
            'GH',
        ],
        // touring country names must not beat nationality
        'Ajebutter22' => [
            'Adekunle Oluwatoyin Adefela, known professionally as Ajebutter22, is a Nigerian singer and songwriter. He has toured in the United States, Japan and France, and performed at several music festivals in Europe.',
            'NG',
        ],
        // nationality must win over a foreign birthplace
        'Yemi Alade' => [
            'Yemi Eberechi Alade (born 14 March 1989) is a Nigerian singer and songwriter. Born in Abidjan, Ivory Coast, she moved to Lagos as a child.',
            'NG',
        ],
        // leading demonym wins a dual nationality
        'dual-nationality' => [
            'Alex Example is a British-American rapper and songwriter based in London.',
            'GB',
        ],
        // South Korean must not be read as a different country
        'korean' => [
            'Kim Min-jong, known professionally as RM, is a South Korean rapper and songwriter.',
            'KR',
        ],
        'Japanese' => [
            'Takuya Kimura is a Japanese singer and actor. He was born in Tokyo.',
            'JP',
        ],
        // group leads put a qualifier between the demonym and the role
        'BTS' => [
            'Bang Si-hyuk, known professionally as Hitman Bang, is a South Korean lyricist, record producer and entrepreneur. BTS is a South Korean boy band formed in Seoul.',
            'KR',
        ],
        'BLACKPINK' => [
            'Blackpink is a South Korean girl group formed in Seoul, South Korea in 2016.',
            'KR',
        ],
        // Real Wikipedia leads that the first version of the patterns missed,
        // because a genre or descriptor sits between the demonym and the role.
        'A.R. Rahman' => [
            'Allah Rakha Rahman (; born A. S. Dileep Kumar; 6 January 1967), also known as ARR, is an Indian composer and music director.',
            'IN',
        ],
        'Scorpions' => [
            'The Scorpions are a German hard rock/heavy metal band formed in Hanover in 1965 by guitarist Rudolf Schenker.',
            'DE',
        ],
        'Daft Punk' => [
            'Daft Punk were a French electronic music duo formed in 1993 in Paris by Thomas Bangalter and Guy-Manuel de Homem-Christo.',
            'FR',
        ],
        'ZARD' => [
            'Zard (; Zdo) (stylized as ZARD) were a Japanese pop rock group, originally with five members.',
            'JP',
        ],
        'Seeed' => [
            'Seeed is a German hip hop, reggae and dancehall band based in Berlin. Founded in 1998.',
            'DE',
        ],
        'Sia' => [
            'Sia Kate Isobelle Furler ( SEE-; born 18 December 1975) is an Australian singer and songwriter.',
            'AU',
        ],
        'Shania Twain' => [
            'Eilleen Regina "Shania" Twain (nee Edwards; born August 28, 1965) is a Canadian singer-songwriter.',
            'CA',
        ],
        // The looser filler must not drift from one clause into the next and claim
        // the nationality mentioned in passing. The primary claim wins.
        'filler-must-not-drift' => [
            'Alex Smith is a British singer who later became an American rapper.',
            'GB',
        ],
        // no usable nationality -> must stay unresolved
        'no-signal' => [
            'John Example is a musician and record producer active since the 1990s. He has released records in Germany, France and Japan.',
            null,
        ],
        'too-short' => ['Musician.', null],
    ];

    public function handle(DetectArtistCountry $detector): int
    {
        $rows = [];
        $failed = 0;

        foreach (self::FIXTURES as $name => [$bio, $expected]) {
            $result = $detector->detect($bio, $name);

            $passed = $result['code'] === $expected;

            if (!$passed) {
                $failed++;
            }

            $rows[] = [
                $passed ? '<fg=green>PASS</>' : '<fg=red>FAIL</>',
                $name,
                $result['code'] ?? '--',
                $expected ?? '--',
                (string) $result['confidence'],
                $result['all'][0]['rule'] ?? '-',
                $result['phrase'] ?? '-',
            ];
        }

        $this->table(
            ['', 'artist', 'got', 'want', 'conf', 'rule', 'phrase'],
            $rows,
        );

        $total = count(self::FIXTURES);

        if ($failed) {
            $this->line("<error>$failed of $total fixtures failed</error>");

            return self::FAILURE;
        }

        $this->line("<info>all $total fixtures passed</info>");

        return self::SUCCESS;
    }
}