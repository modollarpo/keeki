/**
 * MobileNavbar
 * ────────────────────────────────────────────────────────────────────────────
 * Compact navigation header for the web player on mobile viewports.
 *
 * Layout (collapsed):
 *   ┌──────────────────────────────────────────────────────┐
 *   │  [favicon-mark]  ·········  [🔍] [🎤?]  [avatar]   │
 *   └──────────────────────────────────────────────────────┘
 *
 * Tapping 🔍 or 🎤 opens the `MobileSearchOverlay` — a full-screen
 * portal-based takeover with its own input, voice session, and live results.
 * The navbar itself stays clean and uncluttered at all times.
 *
 * Design decisions
 * ────────────────
 * • Favicon mark (not wordmark) used as the brand anchor.  On a narrow screen
 *   a wordmark wastes ~120 px; the 40 × 40 mark icon is instantly recognisable
 *   and leaves room for the action icons.
 * • Voice-search shortcut on the navbar means one tap starts dictating — no
 *   need to open the overlay first.  The overlay opens automatically when the
 *   transcript arrives.
 * • Auth content (avatar / login) stays on the far right, consistent with the
 *   desktop layout so muscle memory transfers.
 */

import {MobileSearchOverlay} from '@app/web-player/search/mobile-search-overlay';
import {useVoiceSearch} from '@app/web-player/search/use-voice-search';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {message} from '@ui/i18n/message';
import {toast} from '@ui/toast/toast';
import {LoaderCircleIcon, MicIcon, SearchIcon} from 'lucide-react';
import {useCallback, useState} from 'react';

export function MobileNavbar() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const isDark = useIsDarkMode();
  const navigate = useNavigate();

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  // ── Voice search: shortcut from the navbar icon ─────────────────────────────
  // When a transcript arrives we open the overlay so the user can see their
  // query and live results.  We do NOT navigate immediately from here — that
  // responsibility belongs to the overlay, which the user can confirm or edit.
  const handleTranscript = useCallback(
    (transcript: string) => {
      // Open the overlay pre-populated with the transcript.  The overlay will
      // navigate when the user submits or selects a result.
      openOverlay();
      // Small delay to let the overlay mount before we'd want to navigate.
      setTimeout(() => {
        navigate(`/search/${encodeURIComponent(transcript.trim())}`);
        closeOverlay();
      }, 300);
    },
    [navigate, openOverlay, closeOverlay],
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

  const faviconSrc = isDark ? '/favicon-dark.svg' : '/favicon.svg';

  return (
    <>
      {/* ── Full-screen search overlay (portal) ─────────────────────────────── */}
      <MobileSearchOverlay isOpen={overlayOpen} onClose={closeOverlay} />

      {/* ── Persistent header bar ────────────────────────────────────────────── */}
      <Navbar.Root className="h-14 shrink-0 border-b bg-background px-3 gap-2">

        {/* Brand mark ─ larger, heavier, high-contrast */}
        <a
          href="/"
          aria-label="Keekii — go to home"
          className="flex items-center justify-center shrink-0 rounded-xl overflow-hidden
                     transition-transform active:scale-95 focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-[var(--be-brand-ink,#e8611f)]"
          style={{width: 40, height: 40}}
        >
          <img
            src={faviconSrc}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            onError={e => {
              (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
            }}
          />
        </a>

        {/* Flexible gap */}
        <div className="flex-1" aria-hidden="true" />

        {/* Search icon ─ opens overlay */}
        <NavIconButton
          aria-label="Search"
          onClick={openOverlay}
        >
          <SearchIcon className="size-[22px]" />
        </NavIconButton>

        {/* Voice-search shortcut (only when browser supports it) */}
        {voiceSearch.isSupported && (
          <NavIconButton
            aria-label={voiceSearch.isListening ? 'Stop voice search' : 'Start voice search'}
            aria-pressed={voiceSearch.isListening}
            onClick={voiceSearch.isListening ? voiceSearch.stop : voiceSearch.toggle}
            active={voiceSearch.isListening}
          >
            {voiceSearch.isListening ? (
              <LoaderCircleIcon className="size-[22px] animate-spin text-destructive" />
            ) : (
              <MicIcon className="size-[22px]" />
            )}
          </NavIconButton>
        )}

        {/* Auth avatar / login ─ consistent with desktop far-right placement */}
        <Navbar.Content className="ml-0 shrink-0 pl-1">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>
    </>
  );
}

// ─── Shared icon-button primitive ────────────────────────────────────────────

interface NavIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function NavIconButton({children, active, className, ...props}: NavIconButtonProps) {
  return (
    <button
      type="button"
      className={[
        'flex items-center justify-center w-10 h-10 rounded-xl shrink-0',
        'transition-all duration-150 active:scale-90',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[var(--be-brand-ink,#e8611f)]',
        active
          ? 'bg-destructive/10 text-destructive'
          : 'text-foreground hover:bg-muted',
        className ?? '',
      ]
        .join(' ')
        .trim()}
      {...props}
    >
      {children}
    </button>
  );
}
