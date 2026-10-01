/**
 * MobileSearchOverlay
 * ────────────────────────────────────────────────────────────────────────────
 * A full-screen takeover search experience for mobile devices.
 *
 * Architecture
 * ────────────
 * The overlay renders via a React portal so it escapes any ancestor
 * `overflow-hidden` or `z-index` stacking contexts. It owns its own query
 * state and voice-search session. Results are rendered in a scrollable list
 * below the input; selecting a result navigates and closes the overlay.
 *
 * Accessibility
 * ─────────────
 * - The overlay root has `role="dialog"` and `aria-label="Search"`.
 * - Pressing Escape closes the overlay and stops any active voice session.
 * - The input is auto-focused when the overlay opens.
 * - Body scroll is locked while the overlay is open.
 */

import {appQueries} from '@app/app-queries';
import {ALBUM_MODEL} from '@app/web-player/albums/album';
import {AlbumImage} from '@app/web-player/albums/album-image/album-image';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ARTIST_MODEL} from '@app/web-player/artists/artist';
import {SmallArtistImage} from '@app/web-player/artists/artist-image/small-artist-image';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {PLAYLIST_MODEL} from '@app/web-player/playlists/playlist';
import {PlaylistImage} from '@app/web-player/playlists/playlist-image';
import {getPlaylistLink} from '@app/web-player/playlists/playlist-link';
import {TRACK_MODEL} from '@app/web-player/tracks/track';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {getTrackLink} from '@app/web-player/tracks/track-link';
import {useVoiceSearch} from '@app/web-player/search/use-voice-search';
import {SearchResponse} from '@app/web-player/search/search-response';
import {UserImage} from '@app/web-player/users/user-image';
import {getUserProfileLink} from '@app/web-player/users/user-profile-link';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {message} from '@ui/i18n/message';
import {Trans} from '@ui/i18n/trans';
import {toast} from '@ui/toast/toast';
import {USER_MODEL} from '@ui/types/user';
import {cn} from '@ui/utils/cn';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {
  ArrowRightIcon,
  LoaderCircleIcon,
  MicIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {createPortal} from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchResultItem = NonNullable<
  SearchResponse['results'][keyof SearchResponse['results']]
>['data'][number];

type SearchResultGroup = {
  label: string;
  items: SearchResultItem[];
};

// ─── Voice error messages ─────────────────────────────────────────────────────

const VOICE_ERROR_MESSAGES: Record<string, string> = {
  unsupported: 'Voice search is not supported in this browser.',
  'not-allowed': 'Microphone access was denied.',
  'service-not-allowed': 'Microphone access was denied.',
  'audio-capture': 'No microphone was found.',
  network: 'Voice search needs a network connection.',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchOverlay({isOpen, onClose}: MobileSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // ── Lock body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ── Auto-focus input ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      // Small delay so the CSS transition has started before focus triggers
      // the virtual keyboard, which avoids a jarring layout jump.
      const id = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(id);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // ── Keyboard: Escape to close ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        voiceSearch.stop();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  // ── Voice search ────────────────────────────────────────────────────────────
  const handleTranscript = useCallback((transcript: string) => {
    setQuery(transcript);
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    toast.danger(
      message(VOICE_ERROR_MESSAGES[error] ?? 'Voice search failed. Please try again.'),
    );
  }, []);

  const voiceSearch = useVoiceSearch({
    onTranscript: handleTranscript,
    onError: handleVoiceError,
  });

  // ── Search query ────────────────────────────────────────────────────────────
  const {isFetching, data} = useQuery({
    ...appQueries.search.results('search', query),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
  });

  const groups = useMemo<SearchResultGroup[]>(() => {
    return Object.entries(data?.results ?? {}).flatMap(([label, results]) =>
      results?.data?.length ? [{label, items: results.data}] : [],
    );
  }, [data]);

  const hasResults = groups.length > 0;

  // ── Submission ──────────────────────────────────────────────────────────────
  const submit = useCallback(
    (value: string) => {
      const q = value.trim();
      if (!q) return;
      voiceSearch.stop();
      navigate(`/search/${encodeURIComponent(q)}`);
      onClose();
    },
    [navigate, onClose, voiceSearch],
  );

  const handleResultClick = useCallback(
    (result: SearchResultItem) => {
      voiceSearch.stop();
      onClose();
      switch (result.model_type) {
        case ARTIST_MODEL:
          navigate(getArtistLink(result));
          break;
        case ALBUM_MODEL:
          navigate(getAlbumLink(result));
          break;
        case TRACK_MODEL:
          navigate(getTrackLink(result));
          break;
        case USER_MODEL:
          navigate(getUserProfileLink(result));
          break;
        case PLAYLIST_MODEL:
          navigate(getPlaylistLink(result));
          break;
      }
    },
    [navigate, onClose, voiceSearch],
  );

  // ── Portal ─────────────────────────────────────────────────────────────────
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-label="Search"
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col bg-background transition-all duration-300 ease-out',
        isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none',
      )}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border shrink-0">
        {/* Search input */}
        <form
          className="flex flex-1 items-center gap-3 h-12 rounded-2xl bg-muted px-4 focus-within:ring-2 focus-within:ring-primary/50 transition-shadow"
          onSubmit={e => {
            e.preventDefault();
            submit(query);
          }}
        >
          <SearchIcon
            className={cn(
              'size-5 shrink-0 transition-colors',
              query ? 'text-primary' : 'text-muted-foreground',
            )}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums…"
            className="flex-1 min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          {/* Clear button */}
          {query.length > 0 && (
            <button
              type="button"
              aria-label="Clear search"
              className="shrink-0 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <XIcon className="size-4 text-muted-foreground" />
            </button>
          )}
          {/* Voice search */}
          {voiceSearch.isSupported && (
            <button
              type="button"
              aria-label={voiceSearch.isListening ? 'Stop voice search' : 'Search with voice'}
              aria-pressed={voiceSearch.isListening}
              className={cn(
                'shrink-0 rounded-full p-1 transition-all',
                voiceSearch.isListening
                  ? 'text-destructive bg-destructive/10 animate-pulse'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/10',
              )}
              onClick={voiceSearch.toggle}
            >
              {voiceSearch.isListening ? (
                <LoaderCircleIcon className="size-5 animate-spin" />
              ) : (
                <MicIcon className="size-5" />
              )}
            </button>
          )}
        </form>

        {/* Cancel */}
        <button
          type="button"
          aria-label="Cancel search"
          className="shrink-0 text-sm font-semibold text-primary hover:opacity-70 transition-opacity px-1 py-2"
          onClick={() => {
            voiceSearch.stop();
            onClose();
          }}
        >
          Cancel
        </button>
      </div>

      {/* ── Results / state ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Loading indicator */}
        {isFetching && (
          <div className="flex items-center justify-center py-10">
            <LoaderCircleIcon className="size-6 animate-spin text-primary" />
          </div>
        )}

        {/* No results */}
        {!isFetching && query.trim().length > 0 && !hasResults && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <SearchIcon className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-base font-medium text-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {/* Empty state (before typing) */}
        {!isFetching && query.trim().length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-primary"
            >
              <SearchIcon className="size-7 text-primary-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">Search Keekii</p>
            <p className="text-sm text-muted-foreground mt-1">
              Find songs, artists, albums and playlists
            </p>
            {voiceSearch.isSupported && (
              <button
                type="button"
                className="mt-6 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-95 bg-primary text-primary-foreground shadow-md"
                onClick={voiceSearch.toggle}
              >
                <MicIcon className="size-4" />
                Search with your voice
              </button>
            )}
          </div>
        )}

        {/* Result groups */}
        {!isFetching && hasResults &&
          groups.map(group => (
            <section key={group.label} className="py-2">
              <h3 className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Trans message={group.label} />
              </h3>
              <ul role="listbox">
                {group.items.map(result => (
                  <ResultRow
                    key={`${result.model_type}-${result.id}`}
                    result={result}
                    onSelect={handleResultClick}
                  />
                ))}
              </ul>
            </section>
          ))}

        {/* "See all results" footer */}
        {!isFetching && hasResults && query.trim().length > 0 && (
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold text-primary hover:bg-muted/50 transition-colors border-t border-border"
            onClick={() => submit(query)}
          >
            See all results for &ldquo;{query}&rdquo;
            <ArrowRightIcon className="size-4" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ─── Individual result row ────────────────────────────────────────────────────

interface ResultRowProps {
  result: SearchResultItem;
  onSelect: (result: SearchResultItem) => void;
}

function ResultRow({result, onSelect}: ResultRowProps) {
  const media = getResultMedia(result);
  const subtitle = getResultSubtitle(result);

  return (
    <li role="option" aria-selected="false">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors text-left"
        onClick={() => onSelect(result)}
      >
        {/* Media thumbnail */}
        <div
          className={cn(
            'w-11 h-11 shrink-0 overflow-hidden bg-muted',
            result.model_type === ARTIST_MODEL ? 'rounded-full' : 'rounded-lg',
          )}
        >
          {media}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Arrow */}
        <ArrowRightIcon className="size-4 text-muted-foreground/50 shrink-0" />
      </button>
    </li>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getResultMedia(result: SearchResultItem): React.ReactNode {
  switch (result.model_type) {
    case ARTIST_MODEL:
      return <SmallArtistImage artist={result} className="size-full object-cover" />;
    case ALBUM_MODEL:
      return <AlbumImage album={result} className="size-full object-cover" />;
    case TRACK_MODEL:
      return <TrackImage track={result} className="size-full object-cover" />;
    case PLAYLIST_MODEL:
      return <PlaylistImage playlist={result} className="size-full object-cover" />;
    case USER_MODEL:
      return <UserImage user={result} className="size-full object-cover" />;
    default:
      return null;
  }
}

function getResultSubtitle(result: SearchResultItem): React.ReactNode {
  switch (result.model_type) {
    case ARTIST_MODEL:
      return 'Artist';
    case ALBUM_MODEL:
      return (result as {artists?: {name: string}[]}).artists
        ?.map(a => a.name)
        .join(', ');
    case TRACK_MODEL:
      return (result as {artists?: {name: string}[]}).artists
        ?.map(a => a.name)
        .join(', ');
    case PLAYLIST_MODEL:
      return 'Playlist';
    case USER_MODEL:
      return 'User';
    default:
      return null;
  }
}
