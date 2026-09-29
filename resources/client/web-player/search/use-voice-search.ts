import {useCallback, useEffect, useRef, useState} from 'react';

export type VoiceSearchStatus = 'idle' | 'listening' | 'unsupported';

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: {transcript: string};
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & {error: string};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface UseVoiceSearchProps {
  onTranscript: (transcript: string) => void;
  onError?: (message: string) => void;
  lang?: string;
}

export function useVoiceSearch({
  onTranscript,
  onError,
  lang = 'en-US',
}: UseVoiceSearchProps) {
  const [status, setStatus] = useState<VoiceSearchStatus>(() =>
    getRecognitionConstructor() ? 'idle' : 'unsupported',
  );

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Kept in refs so the callbacks can stay stable: swapping the handlers on
  // every render would tear down a recognition session mid-utterance.
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  useEffect(() => {
    // The ref is read inside the cleanup rather than captured out here. This
    // effect runs once on mount, when no session exists yet, so a value
    // captured now would still be null on unmount and would abort nothing,
    // leaving the microphone open with no component left to stop it.
    return () => {
      const recognition = recognitionRef.current;
      if (!recognition) {
        return;
      }
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }
    // stop() rather than abort(): abort() discards whatever was already
    // captured, and we want the final partial result flushed to the input.
    recognition.stop();
  }, []);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      return;
    }

    const Recognition = getRecognitionConstructor();
    if (!Recognition) {
      setStatus('unsupported');
      onErrorRef.current?.('unsupported');
      return;
    }

    const instance = new Recognition();
    instance.lang = lang;
    // A search box is a one-shot: the user says a phrase and expects results,
    // not an always-open dictation session. interimResults drives the live
    // transcript in the input, and the final result is what we commit.
    instance.continuous = false;
    instance.interimResults = true;
    instance.maxAlternatives = 1;

    instance.onresult = event => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const trimmed = transcript.trim();
      if (trimmed) {
        onTranscriptRef.current(trimmed);
      }
    };

    instance.onerror = event => {
      // 'no-speech' and 'aborted' are routine: the user said nothing, or we
      // stopped it ourselves. Surfacing them as errors would make the mic look
      // broken when it worked as designed.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onErrorRef.current?.(event.error);
      }
    };

    instance.onend = () => {
      recognitionRef.current = null;
      setStatus('idle');
    };

    recognitionRef.current = instance;
    setStatus('listening');
    try {
      instance.start();
    } catch {
      // start() throws if the engine is already starting up. Treat it as
      // nothing happening rather than a user-facing error.
      recognitionRef.current = null;
      setStatus('idle');
    }
  }, [lang]);

  return {
    status,
    isListening: status === 'listening',
    isSupported: status !== 'unsupported',
    toggle,
    stop,
  };
}
