import {getBootstrapData} from '@ui/bootstrap-data/bootstrap-data-store';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  playbackAuthGateState,
  shouldGatePlayback,
  usePlaybackAuthGateStore,
} from './playback-auth-gate-store';

vi.mock('@ui/bootstrap-data/bootstrap-data-store', () => ({
  getBootstrapData: vi.fn(),
}));

const mockedBootstrapData = vi.mocked(getBootstrapData);

function bootstrap(requireAuth: boolean, loggedIn: boolean) {
  mockedBootstrapData.mockReturnValue({
    settings: {player: {require_auth: requireAuth}},
    user: loggedIn ? {id: 1} : null,
  } as never);
}

afterEach(() => {
  playbackAuthGateState.close();
  vi.clearAllMocks();
});

describe('shouldGatePlayback', () => {
  it('gates signed-out visitors when the setting is on', () => {
    bootstrap(true, false);
    expect(shouldGatePlayback()).toBe(true);
  });

  it('does not gate signed-in users', () => {
    bootstrap(true, true);
    expect(shouldGatePlayback()).toBe(false);
  });

  it('does not gate when the admin turned the setting off', () => {
    bootstrap(false, false);
    expect(shouldGatePlayback()).toBe(false);
  });

  it('does not gate when no player settings were bootstrapped', () => {
    mockedBootstrapData.mockReturnValue({} as never);
    expect(shouldGatePlayback()).toBe(false);
  });
});

describe('playback auth gate state', () => {
  it('defaults to a closed register prompt', () => {
    const state = usePlaybackAuthGateStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.mode).toBe('register');
    expect(state.trackName).toBeNull();
    expect(state.resume).toBeNull();
  });

  it('opens with the blocked track and resumes it on success', () => {
    const resume = vi.fn();
    playbackAuthGateState.open({trackName: 'Song', resume});

    let state = usePlaybackAuthGateStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.trackName).toBe('Song');

    playbackAuthGateState.completeAuth();
    state = usePlaybackAuthGateStore.getState();
    expect(resume).toHaveBeenCalledTimes(1);
    expect(state.isOpen).toBe(false);
    expect(state.resume).toBeNull();
    expect(state.trackName).toBeNull();
  });

  it('can switch between register and login', () => {
    playbackAuthGateState.open();
    playbackAuthGateState.setMode('login');
    expect(usePlaybackAuthGateStore.getState().mode).toBe('login');
  });

  it('does not resume when the visitor dismisses the dialog', () => {
    const resume = vi.fn();
    playbackAuthGateState.open({trackName: 'Song', resume});
    playbackAuthGateState.close();

    const state = usePlaybackAuthGateStore.getState();
    expect(resume).not.toHaveBeenCalled();
    expect(state.isOpen).toBe(false);
    expect(state.resume).toBeNull();
  });
});
