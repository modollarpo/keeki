import {SearchAutocomplete} from '@app/web-player/search/search-autocomplete';
import {useVoiceSearch} from '@app/web-player/search/use-voice-search';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {toast} from '@ui/toast/toast';
import {message} from '@ui/i18n/message';
import {useState, useCallback} from 'react';
import {LoaderCircleIcon, MicIcon, SearchIcon, XIcon} from 'lucide-react';

/**
 * Mobile navbar for the web player.
 *
 * Design rationale:
 * ─────────────────
 * Screen real estate on mobile is precious. Rather than squeezing the full
 * wordmark logo and a search field into one row, we show:
 *
 *   [favicon mark]  ···  [search icon tap → expands to full search bar]  [auth]
 *
 * Tapping the 🔍 icon slides the search field open (full width) with an
 * integrated microphone button for voice search. The favicon mark serves as the
 * compact brand anchor; it collapses back to the icon-row when the user
 * dismisses the field or submits.
 */
export function MobileNavbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = useIsDarkMode();

  // ── Voice search ────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');

  const handleTranscript = useCallback(
    (transcript: string) => {
      setQuery(transcript);
      setSearchOpen(true);
      navigate(`/search/${encodeURIComponent(transcript.trim())}`);
    },
    [navigate],
  );

  const handleVoiceError = useCallback((error: string) => {
    const msgs: Record<string, string> = {
      unsupported: 'Voice search is not supported in this browser.',
      'not-allowed': 'Microphone access was denied.',
      'service-not-allowed': 'Microphone access was denied.',
      'audio-capture': 'No microphone was found.',
      network: 'Voice search needs a network connection.',
    };
    toast.danger(message(msgs[error] ?? 'Voice search failed. Please try again.'));
  }, []);

  const voiceSearch = useVoiceSearch({
    onTranscript: handleTranscript,
    onError: handleVoiceError,
  });

  // ── Favicon mark (light/dark aware) ────────────────────────────────────────
  const faviconSrc = isDark ? '/favicon-dark.svg' : '/favicon.svg';

  if (searchOpen) {
    return (
      <div className="flex h-14 items-center border-b bg-background px-2 gap-2">
        {/* Collapse back */}
        <button
          type="button"
          aria-label="Close search"
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors"
          onClick={() => {
            setSearchOpen(false);
            setQuery('');
            voiceSearch.stop();
          }}
        >
          <XIcon className="size-5 text-muted-foreground" />
        </button>

        {/* Inline search form */}
        <form
          className="flex-1 flex items-center gap-1.5 h-9 rounded-full border border-input bg-muted/50 px-3"
          onSubmit={e => {
            e.preventDefault();
            voiceSearch.stop();
            const q = query.trim();
            if (q) {
              navigate(`/search/${encodeURIComponent(q)}`);
              setSearchOpen(false);
            }
          }}
        >
          <SearchIcon className="size-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search songs, artists…"
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {voiceSearch.isSupported && (
            <button
              type="button"
              aria-label={voiceSearch.isListening ? 'Stop voice search' : 'Search with voice'}
              onClick={voiceSearch.toggle}
              className="shrink-0"
            >
              {voiceSearch.isListening ? (
                <LoaderCircleIcon className="size-4 animate-spin text-destructive" />
              ) : (
                <MicIcon className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </button>
          )}
        </form>
      </div>
    );
  }

  // ── Default collapsed state ─────────────────────────────────────────────────
  return (
    <Navbar.Root className="h-14 border-b px-3 py-2 gap-3">
      {/* Favicon mark as compact brand anchor */}
      <a href="/" className="flex h-full items-center shrink-0" aria-label="Keekii home">
        <img
          src={faviconSrc}
          alt="Keekii"
          className="h-8 w-8 rounded-lg"
          onError={e => {
            (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
          }}
        />
      </a>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search icon tap target */}
      <button
        type="button"
        aria-label="Open search"
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors shrink-0"
        onClick={() => setSearchOpen(true)}
      >
        <SearchIcon className="size-5 text-foreground" />
      </button>

      {/* Voice search shortcut (if supported) */}
      {voiceSearch.isSupported && (
        <button
          type="button"
          aria-label={voiceSearch.isListening ? 'Stop voice search' : 'Voice search'}
          onClick={voiceSearch.toggle}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors shrink-0"
        >
          {voiceSearch.isListening ? (
            <LoaderCircleIcon className="size-5 animate-spin text-destructive" />
          ) : (
            <MicIcon className="size-5 text-foreground" />
          )}
        </button>
      )}

      {/* Auth content (avatar / login button) */}
      <Navbar.Content className="ml-0 shrink-0">
        <Navbar.AuthContent />
      </Navbar.Content>
    </Navbar.Root>
  );
}
