import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {useVoiceSearch} from '@app/web-player/search/use-voice-search';

/**
 * The Web Speech API does not exist in jsdom, so every test here drives a fake.
 * What is worth testing is the state machine around the engine, because that
 * is where the bugs live: whether the mic can be re-armed after a session
 * ends, whether `no-speech` is treated as a normal outcome rather than a
 * failure, and whether a transcript survives a re-render mid-utterance.
 */
type FakeResult = {isFinal: boolean; 0: {transcript: string}};

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  static startThrows = false;

  lang = '';
  continuous = true;
  interimResults = false;
  maxAlternatives = 0;
  onresult: ((e: never) => void) | null = null;
  onerror: ((e: never) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  stopped = false;
  aborted = false;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    if (FakeRecognition.startThrows) {
      throw new Error('InvalidStateError');
    }
    this.started = true;
  }
  stop() {
    this.stopped = true;
  }
  abort() {
    this.aborted = true;
  }

  /* Test helpers, not part of the real API. */
  emitResult(results: FakeResult[], resultIndex = 0) {
    this.onresult?.({
      resultIndex,
      results,
    } as never);
  }
  emitError(error: string) {
    this.onerror?.({error} as never);
  }
  emitEnd() {
    this.onend?.();
  }
}

function installFake() {
  FakeRecognition.instances = [];
  FakeRecognition.startThrows = false;
  vi.stubGlobal('webkitSpeechRecognition', FakeRecognition);
}

describe('useVoiceSearch', () => {
  beforeEach(installFake);
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports support when the engine is present', () => {
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn()}),
    );

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
  });

  it('reports no support when neither engine global exists', () => {
    // Firefox ships no SpeechRecognition at all, so the button must not render
    // there rather than offering a control that cannot work.
    vi.stubGlobal('SpeechRecognition', undefined);
    vi.stubGlobal('webkitSpeechRecognition', undefined);

    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn()}),
    );

    expect(result.current.isSupported).toBe(false);
  });

  it('does not start until toggled', () => {
    renderHook(() => useVoiceSearch({onTranscript: vi.fn()}));

    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it('configures a one-shot session rather than open dictation', () => {
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn()}),
    );

    act(() => result.current.toggle());

    const recognition = FakeRecognition.instances[0];
    expect(recognition.started).toBe(true);
    // A search box wants a phrase then results, not a session that never ends.
    expect(recognition.continuous).toBe(false);
    // Interim results are what update the input live while the user is still
    // talking, and they are the only reason interimResults exists here.
    expect(recognition.interimResults).toBe(true);
    expect(result.current.isListening).toBe(true);
  });

  it('forwards the transcript, trimmed', () => {
    const onTranscript = vi.fn();
    const {result} = renderHook(() => useVoiceSearch({onTranscript}));

    act(() => result.current.toggle());
    act(() =>
      FakeRecognition.instances[0].emitResult([
        {isFinal: false, 0: {transcript: '  daft punk  '}},
      ]),
    );

    // Whitespace-padded engine output would otherwise become a query that
    // encodes to %20%20 and matches nothing.
    expect(onTranscript).toHaveBeenCalledWith('daft punk');
  });

  it('accumulates results that arrive from a later index', () => {
    const onTranscript = vi.fn();
    const {result} = renderHook(() => useVoiceSearch({onTranscript}));

    act(() => result.current.toggle());
    // The engine rewrites the whole result list per event, and resultIndex
    // marks where the new material starts. Reading from result 0 would
    // double-count earlier segments.
    act(() =>
      FakeRecognition.instances[0].emitResult(
        [
          {isFinal: false, 0: {transcript: 'around the '}},
          {isFinal: false, 0: {transcript: 'world'}},
        ],
        1,
      ),
    );

    expect(onTranscript).toHaveBeenCalledWith('world');
  });

  it('ignores an empty transcript', () => {
    const onTranscript = vi.fn();
    const {result} = renderHook(() => useVoiceSearch({onTranscript}));

    act(() => result.current.toggle());
    act(() =>
      FakeRecognition.instances[0].emitResult([
        {isFinal: false, 0: {transcript: '   '}},
      ]),
    );

    // An empty query opens the results list with nothing to search for.
    expect(onTranscript).not.toHaveBeenCalled();
  });

  it('keeps listening after an engine failure', () => {
    const onTranscript = vi.fn();
    const onError = vi.fn();
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript, onError}),
    );

    act(() => result.current.toggle());
    act(() => FakeRecognition.instances[0].emitError('network'));

    // Recognition can survive a non-fatal error and still be producing
    // results, so tearing the session down would be wrong.
    expect(onError).toHaveBeenCalledWith('network');
    expect(result.current.isListening).toBe(true);
  });

  it('treats a silent mic and a self-abort as normal, not as errors', () => {
    const onError = vi.fn();
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn(), onError}),
    );

    act(() => result.current.toggle());
    act(() => FakeRecognition.instances[0].emitError('no-speech'));
    act(() => FakeRecognition.instances[0].emitError('aborted'));

    // These are the two codes the hook itself causes. Toasting on them would
    // make the mic look broken every time the user simply said nothing.
    expect(onError).not.toHaveBeenCalled();
  });

  it('releases the session when the engine ends on its own', () => {
    const onError = vi.fn();
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn(), onError}),
    );

    act(() => result.current.toggle());
    act(() => FakeRecognition.instances[0].emitEnd());

    // Without clearing the ref, the next toggle would call stop() on a dead
    // engine and the mic would be permanently unresponsive.
    expect(result.current.isListening).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it('can be re-armed after a session ends', () => {
    const {result} = renderHook(() => useVoiceSearch({onTranscript: vi.fn()}));

    act(() => result.current.toggle());
    act(() => FakeRecognition.instances[0].emitEnd());
    act(() => result.current.toggle());

    expect(FakeRecognition.instances).toHaveLength(2);
    expect(FakeRecognition.instances[1].started).toBe(true);
    expect(result.current.isListening).toBe(true);
  });

  it('stops the running session on toggle instead of starting a second', () => {
    const {result} = renderHook(() => useVoiceSearch({onTranscript: vi.fn()}));

    act(() => result.current.toggle());
    act(() => result.current.toggle());

    // Two concurrent engines would fight over the microphone.
    expect(FakeRecognition.instances).toHaveLength(1);
    expect(FakeRecognition.instances[0].stopped).toBe(true);
  });

  it('flushes with stop rather than abort so a pending transcript survives', () => {
    const {result} = renderHook(() => useVoiceSearch({onTranscript: vi.fn()}));

    act(() => result.current.toggle());
    act(() => result.current.stop());

    // abort() discards what was already captured, so submitting a search while
    // dictating would throw away the phrase the user just spoke.
    expect(FakeRecognition.instances[0].stopped).toBe(true);
    expect(FakeRecognition.instances[0].aborted).toBe(false);
  });

  it('recovers when the engine throws on start', () => {
    const onError = vi.fn();
    FakeRecognition.startThrows = true;
    const {result} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn(), onError}),
    );

    // start() throws when the engine is already spinning up, which happens on a
    // fast double-click. That is not the user's problem to hear about.
    act(() => result.current.toggle());

    expect(result.current.isListening).toBe(false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes results to the latest callback after a re-render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {result, rerender} = renderHook(
      ({onTranscript}) => useVoiceSearch({onTranscript}),
      {initialProps: {onTranscript: first}},
    );

    act(() => result.current.toggle());
    rerender({onTranscript: second});
    act(() =>
      FakeRecognition.instances[0].emitResult([
        {isFinal: true, 0: {transcript: 'after re-render'}},
      ]),
    );

    // The search bar rebuilds its handlers on every keystroke. If the hook
    // captured the first one, later speech would land on a stale closure and
    // the input would silently stop updating.
    expect(second).toHaveBeenCalledWith('after re-render');
    expect(first).not.toHaveBeenCalled();
  });

  it('aborts the engine on unmount', () => {
    const {result, unmount} = renderHook(() =>
      useVoiceSearch({onTranscript: vi.fn()}),
    );

    act(() => result.current.toggle());
    unmount();

    // Leaving a recognition session running after the component is gone keeps
    // the microphone indicator on with nothing to show for it.
    expect(FakeRecognition.instances[0].aborted).toBe(true);
  });
});
