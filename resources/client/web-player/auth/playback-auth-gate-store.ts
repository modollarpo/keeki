import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export type PlaybackAuthGateMode = 'register' | 'login';

interface PlaybackAuthGateState {
  isOpen: boolean;
  mode: PlaybackAuthGateMode;
  // name of the track the visitor tried to play, shown in the dialog
  trackName: string | null;
  // replays the blocked track once auth succeeds
  resume: (() => void) | null;
  open: (payload?: {
    trackName?: string | null;
    resume?: (() => void) | null;
    mode?: PlaybackAuthGateMode;
  }) => void;
  setMode: (mode: PlaybackAuthGateMode) => void;
  close: () => void;
  completeAuth: () => void;
}

export const usePlaybackAuthGateStore = create<PlaybackAuthGateState>()(
  immer((set, get) => ({
    isOpen: false,
    mode: 'register',
    trackName: null,
    resume: null,
    open: payload => {
      set(state => {
        state.isOpen = true;
        state.mode = payload?.mode ?? 'register';
        state.trackName = payload?.trackName ?? null;
        state.resume = payload?.resume ?? null;
      });
    },
    setMode: mode => {
      set(state => {
        state.mode = mode;
      });
    },
    close: () => {
      set(state => {
        state.isOpen = false;
        state.resume = null;
        state.trackName = null;
      });
    },
    completeAuth: () => {
      const {resume} = get();
      set(state => {
        state.isOpen = false;
        state.resume = null;
        state.trackName = null;
      });
      resume?.();
    },
  })),
);

// module level handle so the player store (non-react) can open the dialog
export const playbackAuthGateState = usePlaybackAuthGateStore.getState();

// whether a signed-out visitor should be asked to sign in before playback
export function shouldGatePlayback(): boolean {
  const {settings, user} = getBootstrapData();
  return !!settings?.player?.require_auth && !user;
}
