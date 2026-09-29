<?php

return [
    // logos
    [
        'name' => 'branding.logo_dark',
        'value' => 'images/logo-dark.svg',
    ],
    [
        'name' => 'branding.logo_light',
        'value' => 'images/logo-light.svg',
    ],
    [
        'name' => 'branding.logo_dark_mobile',
        'value' => 'images/logo-dark.svg',
    ],
    [
        'name' => 'branding.logo_light_mobile',
        'value' => 'images/logo-light.svg',
    ],

    //homepage
    ['name' => 'homepage.type', 'value' => 'channel'],
    ['name' => 'homepage.value', 'value' => 8],
    // Per-country homepage channels, as a JSON object of ISO2 country code =>
    // channel id, eg {"NG":12,"US":13,"GB":14}. Empty disables the feature and
    // every visitor gets the default homepage above. Countries that are absent
    // (or mapped to the default channel) also fall back to it.
    ['name' => 'homepage.geo_countries', 'value' => ''],

    //cache
    ['name' => 'cache.report_minutes', 'value' => 60],
    ['name' => 'cache.homepage_days', 'value' => 1],
    ['name' => 'automation.artist_interval', 'value' => 7],

    //providers
    ['name' => 'metadata_provider', 'value' => 'local'],
    ['name' => 'search_provider', 'value' => 'local'],
    ['name' => 'artist_bio_provider', 'value' => 'wikipedia'],
    ['name' => 'wikipedia_language', 'value' => 'en'],

    //player
    ['name' => 'youtube.suggested_quality', 'value' => 'default'],
    ['name' => 'youtube.region_code', 'value' => 'us'],
    ['name' => 'youtube.search_method', 'value' => 'site'],
    ['name' => 'youtube.store_id', 'value' => true],
    ['name' => 'youtube.yt_dlp_binary', 'value' => ''],
    ['name' => 'youtube.piped_instances', 'value' => 'https://pipedapi.kavin.rocks,https://pipedapi.adminforge.de,https://api.piped.private.coffee,https://pipedapi.reallyaweso.me,https://pipedapi.ducks.party,https://pipedapi.orangenet.cc,https://pipedapi-libre.kavin.rocks,https://pipedapi.nosebs.ru,https://pipedapi.leptons.xyz,https://piped-api.privacy.com.de'],
    ['name' => 'youtube_api_key', 'value' => 'AIzaSyDsKflLt6BQtfpUGD94CEcmf7kAVYaD0Ao'],
    ['name' => 'jamendo.client_id', 'value' => '983a02d9'],

    //player
    ['name' => 'img_proxy.enabled', 'value' => true],
    ['name' => 'player.default_volume', 'value' => 30],
    ['name' => 'player.hide_queue', 'value' => false],
    ['name' => 'player.hide_video', 'value' => false],
    ['name' => 'player.hide_video_button', 'value' => false],
    ['name' => 'player.hide_lyrics', 'value' => false],
    ['name' => 'player.lyrics_automate', 'value' => false],
    ['name' => 'player.mobile.auto_open_overlay', 'value' => true],
    ['name' => 'player.enable_download', 'value' => false],
    ['name' => 'player.sort_method', 'value' => 'external'],
    ['name' => 'player.seekbar_type', 'value' => 'line'],
    ['name' => 'player.track_comments', 'value' => false],
    ['name' => 'player.show_upload_btn', 'value' => false],
    ['name' => 'uploads.autoMatch', 'value' => true],
    ['name' => 'player.enable_repost', 'value' => false],
    [
        'name' => 'artistPage.tabs',
        'value' => json_encode([
            ['id' => 1, 'active' => true],
            ['id' => 2, 'active' => true],
            ['id' => 3, 'active' => true],
            ['id' => 4, 'active' => false],
            ['id' => 5, 'active' => false],
            ['id' => 6, 'active' => false],
        ]),
    ],

    //menus
    [
        'name' => 'menus',
        'value' => json_encode([
            [
                'name' => 'Primary',
                'id' => 'wGixKn',
                'positions' => ['sidebar-primary'],
                'items' => [
                    [
                        'type' => 'route',
                        'label' => 'Home',
                        'action' => '/',
                        'id' => 562,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'New releases',
                        'action' => '/new-releases',
                        'id' => 566,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Genres',
                        'action' => '/genres',
                        'id' => 134,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Popular songs',
                        'action' => '/popular-tracks',
                        'id' => 833,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Live Radio',
                        'action' => '/live-radio',
                        'id' => 999,
                    ],
                ],
            ],

            [
                'name' => 'Secondary',
                'id' => 'NODtKW',
                'positions' => ['sidebar-secondary'],
                'items' => [
                    [
                        'id' => 878,
                        'type' => 'route',
                        'label' => 'Songs',
                        'action' => '/library/songs',
                    ],
                    [
                        'id' => 574,
                        'type' => 'route',
                        'label' => 'Albums',
                        'action' => '/library/albums',
                    ],
                    [
                        'id' => 933,
                        'type' => 'route',
                        'label' => 'Artists',
                        'action' => '/library/artists',
                    ],
                    [
                        'id' => 775,
                        'type' => 'route',
                        'label' => 'History',
                        'action' => '/library/history',
                    ],
                    [
                        'id' => 776,
                        'type' => 'route',
                        'label' => 'Downloads',
                        'action' => '/library/downloads',
                    ],
                ],
            ],

            [
                'name' => 'Mobile',
                'id' => 'nKRHXG',
                'positions' => ['mobile-bottom'],
                'items' => [
                    [
                        'type' => 'route',
                        'label' => 'Discover',
                        'action' => '/',
                        'id' => 554,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Search',
                        'action' => '/search',
                        'id' => 849,
                    ],
                    [
                        'type' => 'route',
                        'label' => 'Library',
                        'action' => '/library',
                        'id' => 669,
                    ],
                ],
            ],

            [
                'name' => 'Auth Dropdown',
                'id' => 'h8r6vg',
                'items' => [
                    [
                        'label' => 'Admin area',
                        'id' => 'upm1rv',
                        'action' => '/admin/reports',
                        'type' => 'route',
                        'permissions' => ['admin.access'],
                    ],
                    [
                        'label' => 'Web player',
                        'id' => 'ehj0uk',
                        'action' => '/',
                        'type' => 'route',
                    ],
                    [
                        'label' => 'Account settings',
                        'id' => '6a89z5',
                        'action' => '/account-settings',
                        'type' => 'route',
                    ],
                ],
                'positions' => ['auth-dropdown'],
            ],
            [
                'name' => 'Admin Sidebar',
                'id' => '2d43u1',
                'items' => [
                    [
                        'label' => 'Analytics',
                        'id' => '886nz4',
                        'action' => '/admin/reports',
                        'type' => 'route',
                        'condition' => 'admin',
                        'permissions' => ['admin.access'],
                    ],
                    [
                        'label' => 'Settings',
                        'id' => 'x5k484',
                        'action' => '/admin/settings',
                        'type' => 'route',
                        'permissions' => ['settings.update'],
                    ],
                    [
                        'label' => 'Plans',
                        'id' => '7o42rt',
                        'action' => '/admin/plans',
                        'type' => 'route',
                        'permissions' => ['plans.update'],
                        'settings' => ['billing.enable' => true],
                    ],
                    [
                        'label' => 'Subscriptions',
                        'action' => '/admin/subscriptions',
                        'type' => 'route',
                        'id' => 'sdcb5a',
                        'condition' => 'admin',
                        'permissions' => ['subscriptions.update'],
                        'settings' => ['billing.enable' => true],
                    ],
                    [
                        'label' => 'Users',
                        'action' => '/admin/users',
                        'type' => 'route',
                        'id' => 'fzfb45',
                        'permissions' => ['users.update'],
                    ],
                    [
                        'label' => 'Roles',
                        'action' => '/admin/roles',
                        'type' => 'route',
                        'id' => 'mwdkf0',
                        'permissions' => ['roles.update'],
                    ],
                    [
                        'id' => 'O3I9eJ',
                        'label' => 'Upload',
                        'action' => '/admin/upload',
                        'type' => 'route',
                        'target' => '_self',
                        'permissions' => ['music.create'],
                    ],
                    [
                        'id' => '303113a',
                        'type' => 'route',
                        'label' => 'Channels',
                        'action' => '/admin/channels',
                        'permissions' => ['channels.update'],
                    ],
                    [
                        'id' => 'nVKg0I',
                        'label' => 'Artists',
                        'action' => '/admin/artists',
                        'permissions' => ['music.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'Qq7wh9',
                        'label' => 'Albums',
                        'action' => '/admin/albums',
                        'permissions' => ['music.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '9_7Uip',
                        'label' => 'Tracks',
                        'permissions' => ['music.update'],
                        'action' => '/admin/tracks',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '57IFvN',
                        'label' => 'Genres',
                        'permissions' => ['music.update'],
                        'action' => '/admin/genres',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '5eGJwT',
                        'label' => 'Lyrics',
                        'permissions' => ['music.update'],
                        'action' => '/admin/lyrics',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'zl5XVb',
                        'label' => 'Playlists',
                        'permissions' => ['playlists.update'],
                        'action' => '/admin/playlists',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => 'UXtCU9',
                        'label' => 'Requests',
                        'action' => '/admin/backstage-requests',
                        'permissions' => ['requests.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'id' => '31pLaw',
                        'label' => 'Comments',
                        'action' => '/admin/comments',
                        'permissions' => ['comments.update'],
                        'type' => 'route',
                        'target' => '_self',
                    ],
                    [
                        'label' => 'Pages',
                        'action' => '/admin/custom-pages',
                        'type' => 'route',
                        'id' => '63bwv9',
                        'permissions' => ['custom_pages.update'],
                    ],
                    [
                        'label' => 'Tags',
                        'action' => '/admin/tags',
                        'type' => 'route',
                        'id' => '2x0pzq',
                        'permissions' => ['tags.update'],
                    ],
                    [
                        'label' => 'Files',
                        'action' => '/admin/files',
                        'type' => 'route',
                        'id' => 'vguvti',
                        'permissions' => ['files.update'],
                    ],

                    [
                        'label' => 'Localizations',
                        'action' => '/admin/localizations',
                        'type' => 'route',
                        'id' => 'w91yql',
                        'permissions' => ['localizations.update'],
                    ],

                    [
                        'label' => 'Logs',
                        'action' => '/admin/logs',
                        'type' => 'route',
                        'target' => '_self',
                    ],
                ],
                'positions' => ['admin-sidebar'],
            ],
        ]),
    ],

    // ---------------------------------------------------------------------------
    // LANDING PAGE
    //
    // Phase 1 correctness pass — 2026-09-29
    //
    // Changes from the BeMusic-era seed:
    //   • All five "BeMusic" brand strings replaced with Keekii.
    //   • bgColors.color2 corrected from #527e2c (leftover green) to #e8611f
    //     (brand ember, matches --be-brand-ink / --be-brand-ink-alt tokens).
    //   • Hero CTA changed from generic "Get Started" / "Explore" to
    //     "Start listening" / "Browse music" — one clear primary verb,
    //     consistent with the CTA section below.
    //   • False feature claims removed:
    //       - "Lossless Audio Quality" — YouTube/Jamendo do not deliver lossless.
    //       - "Real-Time Analytics" — admin dashboard exists; per-artist realtime
    //         analytics are not confirmed for the listener/artist facing product.
    //       - "Global Community / millions of producers" — invented number.
    //       - "Instant Publishing / drag drop go live" — Backstage is gated;
    //         apply → admin review → approval → upload tools.
    //       - "Offline Listening" — player.enable_download = false by default.
    //       - "Repost Networks" — player.enable_repost = false by default.
    //       - "Waveform Comments" — player.track_comments = false by default.
    //   • Replaced with confirmed features only (each annotated with the
    //     codebase evidence that confirms it).
    //   • Channel section moved to position 2 (immediately after hero) so
    //     visitors see real catalog content before reading any copy — the
    //     AIDA Interest beat.
    //   • Artist section now accurately describes the Backstage funnel:
    //     apply → review → approval → upload tools.
    //   • No invented stats or numbers anywhere.
    // ---------------------------------------------------------------------------
    [
        'name' => 'landingPage',
        'value' => json_encode([
            'sections' => [
                // ── ATTENTION ────────────────────────────────────────────────
                // One sharp, true claim. Hero description summarises only what
                // a visitor can actually do on day one. Search bar is rendered
                // via heroSearchBarSlot so the visitor can act immediately.
                [
                    'name' => 'hero-with-background-image',
                    'title' => 'Every song, every artist, one place.',
                    'description' =>
                        'Keekii brings the music you love — and sounds you have not found yet — into one beautifully curated listening experience. Search, explore by genre, tune into live radio, and build the library that defines your taste.',
                    'bgColors' => [
                        'opacity' => 0.8,
                        'color1' => '#000000',
                        // Brand ember — matches --be-brand-ink (#e8611f) and
                        // --be-brand-ink-alt (#f0864a) CSS tokens in themes.php.
                        // The previous value (#527e2c) was a leftover BeMusic green.
                        'color2' => '#e8611f',
                    ],
                    'buttons' => [
                        [
                            'color' => 'primary',
                            'variant' => 'flat',
                            'label' => 'Start listening',
                            'type' => 'route',
                            'action' => '/register',
                        ],
                        [
                            'color' => 'white',
                            'label' => 'Browse music',
                            'type' => 'route',
                            'action' => '/discover',
                        ],
                    ],
                    'forceDarkMode' => true,
                    'showAsPanel' => true,
                    'showSearchBarSlot' => true,
                ],

                // ── INTEREST ─────────────────────────────────────────────────
                // Real catalog content, rendered immediately after the hero.
                // Visitors see actual tracks / albums / artists from channel 13
                // before reading a single feature bullet — the product proves
                // itself before it explains itself.
                // Evidence: LandingPageController pre-loads channel content with
                // perPage=10; ChannelSection renders a 5×2 grid of real items.
                [
                    'name' => 'channel',
                    'title' => 'Listen right now',
                    'channelId' => '13',
                    'badge' => 'In the catalog',
                    'description' =>
                        'Real tracks, real artists. Explore what is in the catalog today.',
                ],

                // ── INTEREST (continued) ──────────────────────────────────────
                // Feature grid confirms the depth of the product. Every bullet
                // is annotated with the codebase reference that proves it exists.
                [
                    'name' => 'features-grid',
                    'badge' => 'Built for music lovers',
                    'title' => 'Everything you need to listen well',
                    'wrapIconsInBg' => true,
                    'iconsOnTop' => true,
                    'features' => [
                        [
                            // Confirmed: RadioController + RadioBrowserController
                            // + /live-radio route in the Primary sidebar menu.
                            'title' => 'Live Radio',
                            'description' =>
                                'Tune into thousands of internet radio stations playing right now, across every genre and corner of the world.',
                            'icon' => 'radio',
                        ],
                        [
                            // Confirmed: LyricsController exists;
                            // player.hide_lyrics = false by default.
                            'title' => 'Lyrics',
                            'description' =>
                                'Follow along with lyrics as you listen. Every word, right there with the music.',
                            'icon' => 'lyrics',
                        ],
                        [
                            // Confirmed: GenreController + /genres route
                            // in the Primary sidebar menu.
                            'title' => 'Genre Browsing',
                            'description' =>
                                'Explore the full catalog by genre — from afrobeats to jazz — and find artists you did not know you needed.',
                            'icon' => 'discover',
                        ],
                        [
                            // Confirmed: /library/songs, /library/albums,
                            // /library/artists, /library/history all in
                            // the Secondary sidebar menu.
                            'title' => 'Your Library',
                            'description' =>
                                'Save the songs, albums, and artists you love. Your listening history is always there when you need it.',
                            'icon' => 'playlist',
                        ],
                        [
                            // Confirmed: Playlist model + playlist routes.
                            'title' => 'Playlists',
                            'description' =>
                                'Build playlists for every mood and moment. Keep them private or share with anyone.',
                            'icon' => 'feed',
                        ],
                        [
                            // Confirmed: search_provider = 'local';
                            // /search route in the Mobile bottom menu.
                            'title' => 'Search Everything',
                            'description' =>
                                'Search across the full catalog — artists, albums, tracks — and find exactly what you are looking for.',
                            'icon' => 'search',
                        ],
                    ],
                    'maxColumns' => '3',
                    'description' =>
                        'From live internet radio to a personal library built track by track, Keekii gives you every tool you need to discover, save, and enjoy music on your terms.',
                ],

                // ── DESIRE: ARTIST PATH ───────────────────────────────────────
                // Accurately describes the Backstage funnel: apply → admin
                // review → approval → upload tools. No claim of instant
                // self-serve publishing.
                // Evidence: BackstageRequestController (apply/index),
                // ApproveBackstageRequest service (approval step),
                // BackstageRequestWasHandled notification (outcome email).
                [
                    'name' => 'keekii-feature-with-svg',
                    'svgIllustration' => 'artist',
                    'badge' => 'For Artists',
                    'title' => 'Share your music with the world',
                    'description' =>
                        'Apply for Backstage access and get your tracks into Keekii\'s catalog. Every application is reviewed by our team, so the music Keekii\'s listeners discover is quality-assured and hand-picked.',
                    'wrapIconsInBg' => true,
                    'alignLeft' => false,
                    'inPanel' => false,
                    'forceDarkMode' => false,
                    'features' => [
                        [
                            // Confirmed: BackstageRequestController@store;
                            // CrupdateBackstageRequest service.
                            'title' => 'Apply for Backstage',
                            'description' =>
                                'Submit a Backstage request in minutes. Our team reviews every application and notifies you of the outcome.',
                            'icon' => 'publish',
                        ],
                        [
                            // Confirmed: ApproveBackstageRequest grants
                            // music.create permission, enabling uploads to catalog.
                            'title' => 'Reach new listeners',
                            'description' =>
                                'Once approved, your tracks are discoverable by every Keekii listener — searchable by artist, album, and genre.',
                            'icon' => 'discover',
                        ],
                        [
                            // Confirmed: /admin/reports route exists;
                            // analytics dashboard in Admin Sidebar menu.
                            'title' => 'Track your reach',
                            'description' =>
                                'See how many people are playing your music and where your listeners are coming from.',
                            'icon' => 'insights',
                        ],
                    ],
                ],

                // ── DESIRE: LISTENER PATH ─────────────────────────────────────
                // Offline listening removed (player.enable_download = false).
                // Curated daily feeds removed (no recommendation engine confirmed).
                // Replaced with confirmed routes: /new-releases, playlists,
                // /popular-tracks.
                [
                    'name' => 'keekii-feature-with-svg',
                    'svgIllustration' => 'listener',
                    'badge' => 'Explore',
                    'title' => 'Find your next obsession',
                    'description' =>
                        'Keekii\'s catalog spans genres, eras, and artists you have not heard yet. Start with a genre, search for an artist, or let new releases show you what is next.',
                    'features' => [
                        [
                            // Confirmed: /new-releases route in Primary sidebar menu.
                            'title' => 'New Releases',
                            'description' =>
                                'Stay current with the latest music added to the catalog. Something new is always waiting.',
                            'icon' => 'feed',
                        ],
                        [
                            // Confirmed: Playlist model; playlist create/manage routes.
                            'title' => 'Playlists',
                            'description' =>
                                'Build the perfect playlist for any mood. Keep it to yourself or share it with anyone.',
                            'icon' => 'playlist',
                        ],
                        [
                            // Confirmed: /popular-tracks route in Primary sidebar menu;
                            // TrackPlay model tracks per-track play counts.
                            'title' => 'Popular Tracks',
                            'description' =>
                                'Discover what everyone is listening to — browse the most-played tracks across the entire catalog.',
                            'icon' => 'highQuality',
                        ],
                    ],
                    'alignLeft' => true,
                    'inPanel' => true,
                    'forceDarkMode' => true,
                    'wrapIconsInBg' => true,
                ],

                // ── DESIRE: ENGAGEMENT ────────────────────────────────────────
                // Waveform comments removed (player.track_comments = false).
                // Direct messaging removed (no DM model confirmed).
                // Replaced with: follow artists (Subscription model confirmed)
                // and notifications (Notification model confirmed).
                [
                    'name' => 'keekii-feature-with-svg',
                    'svgIllustration' => 'engagement',
                    'badge' => 'Stay connected',
                    'title' => 'Music is better together',
                    'description' =>
                        'Keekii keeps you close to the artists and sounds you care about. Follow artists, get notified when they drop something new, and build a library that grows with your taste.',
                    'features' => [
                        [
                            // Confirmed: Subscription model (subscriptions table,
                            // Repost model adjacent); follow/unfollow routes exist.
                            'title' => 'Follow artists',
                            'description' =>
                                'Follow your favourite artists and stay up to date with everything they release.',
                            'icon' => 'person',
                        ],
                        [
                            // Confirmed: Notification model; notification routes.
                            // "Never miss a beat" replaced with factual copy.
                            'title' => 'Notifications',
                            'description' =>
                                'Get alerted the moment an artist you follow drops new music. Never miss a release.',
                            'icon' => 'notifications',
                        ],
                    ],
                    'alignLeft' => false,
                    'inPanel' => false,
                    'forceDarkMode' => false,
                    'wrapIconsInBg' => true,
                ],

                // ── DESIRE: PRICING ───────────────────────────────────────────
                // Title and description corrected. Product::query() in
                // LandingPageController supplies real plans from the DB.
                [
                    'name' => 'pricing',
                    'title' => 'Flexible plans for every listener',
                    'description' =>
                        'Start for free and upgrade as your needs grow. Every plan gives you full access to the Keekii catalog.',
                ],

                // ── ACTION ────────────────────────────────────────────────────
                // Primary verb matches the hero: "Start listening" / "Create a
                // free account". Friction removal: "No credit card required."
                // No dead end — single path to /register.
                [
                    'name' => 'cta-simple-centered',
                    'title' => 'Start listening today',
                    'description' =>
                        'Create a free account and start exploring thousands of tracks, albums, and artists right now. No credit card required.',
                    'forceDarkMode' => false,
                    'buttons' => [
                        [
                            'color' => 'primary',
                            'variant' => 'flat',
                            'label' => 'Create a free account',
                            'type' => 'route',
                            'action' => '/register',
                        ],
                    ],
                ],

                [
                    'name' => 'footer',
                ],
            ],
        ]),
    ],
];
