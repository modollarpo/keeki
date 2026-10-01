/**
 * MobileNavbar
 * ────────────────────────────────────────────────────────────────────────────
 * Compact navigation header for the web player on mobile viewports.
 *
 * Layout (collapsed):
 *   ┌────────────────────────────────────────────────────────────┐
 *   │  [wordmark]   ( ⌕ Search… )                    [avatar]   │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Tapping the search pill opens the `MobileSearchOverlay` — a full-screen
 * portal-based takeover with its own input, voice session, and live results.
 * The navbar itself stays clean and uncluttered at all times.
 *
 * Design decisions
 * ────────────────
 * • The search affordance is a *pill*, not a bare glyph.  An icon alone left a
 *   large void between the brand and the avatar and read as a leftover gap
 *   rather than a control; a filled pill spanning the leftover space reads as
 *   a deliberate field, matches the muted input styling the overlay itself
 *   uses, and states what it does without needing a tooltip.
 * • Voice search deliberately has *no* navbar shortcut.  The overlay already
 *   exposes it twice — inline in the search field and as a labelled button in
 *   the empty state — so a third microphone glyph in the header was pure
 *   duplication and made the bar look like a toolbar of unrelated buttons.
 *   The overlay's mic sits next to the thing it dictates into, which is also
 *   where it belongs contextually.
 * • The brand uses the shared `Logo` component rather than a hand-rolled
 *   favicon <img>, so the mobile header honours the admin-configured branding
 *   artwork, picks the correct light/dark variant, and navigates through the
 *   router — same as the desktop navbar, instead of diverging from it.
 * • Press feedback is a background change only.  A scale transform on tap is
 *   playful; an enterprise surface changes surface colour and stops there.
 * • h-13 (52px) together with py-0.  The shared Navbar.Root ships h-16 + py-2,
 *   which pins the content box at 56px and left the bar with no vertical
 *   breathing room.  Overriding both makes the header honest about its height.
 */

import {MobileSearchOverlay} from '@app/web-player/search/mobile-search-overlay';
import {Navbar} from '@common/ui/navigation/navbar/navbar';
import {cn} from '@ui/utils/cn';
import {SearchIcon} from 'lucide-react';
import {useCallback, useState} from 'react';

export function MobileNavbar() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);
  const closeOverlay = useCallback(() => setOverlayOpen(false), []);

  return (
    <>
      {/* ── Full-screen search overlay (portal) ────────────────────────────────── */}
      <MobileSearchOverlay isOpen={overlayOpen} onClose={closeOverlay} />

      {/* ── Persistent header bar ────────────────────────────────────────────── */}
      <Navbar.Root className="h-13 shrink-0 gap-2.5 border-b bg-background px-3 py-0">
        {/* Brand ─ shared component so branding + dark mode stay centrally managed */}
        <Navbar.Logo className="max-h-6" logoType="auto" />

        {/* Search pill ─ the primary action, so it takes the leftover space */}
        <button
          type="button"
          onClick={openOverlay}
          aria-label="Search"
          className={cn(
            'flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-muted px-3.5',
            'text-sm font-medium text-muted-foreground',
            'transition-colors duration-150 hover:bg-muted/80 active:bg-muted/60',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-[var(--be-brand-ink,#e8611f)]',
          )}
        >
          <SearchIcon className="size-[18px] shrink-0" />
          <span className="truncate">Search</span>
        </button>

        {/* Auth avatar / login ─ consistent with desktop far-right placement */}
        <Navbar.Content className="ml-0 shrink-0 pl-0.5">
          <Navbar.AuthContent />
        </Navbar.Content>
      </Navbar.Root>
    </>
  );
}