import { useState, useEffect, useRef, useCallback } from 'react';

export default function useStreamingText() {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const timerRef = useRef(null);
  const textRef = useRef('');
  const boundariesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const onCompleteCallbackRef = useRef(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerStream = useCallback((fullText, speedMs = 15, onComplete = null) => {
    cleanup();
    
    if (!fullText) {
      setDisplayedText('');
      setIsStreaming(false);
      return;
    }

    textRef.current = fullText;
    onCompleteCallbackRef.current = onComplete;
    setDisplayedText('');
    setIsStreaming(true);

    // Find all word and newline boundary indices to stream word-by-word
    const indices = [];
    let idx = 0;
    
    while (idx < fullText.length) {
      const nextSpace = fullText.indexOf(' ', idx);
      const nextNewline = fullText.indexOf('\n', idx);
      
      let nextBoundary = -1;
      if (nextSpace !== -1 && nextNewline !== -1) {
        nextBoundary = Math.min(nextSpace, nextNewline);
      } else if (nextSpace !== -1) {
        nextBoundary = nextSpace;
      } else if (nextNewline !== -1) {
        nextBoundary = nextNewline;
      }
      
      if (nextBoundary === -1) {
        indices.push(fullText.length);
        break;
      } else {
        indices.push(nextBoundary + 1); // include the space/newline
        idx = nextBoundary + 1;
      }
    }

    boundariesRef.current = indices;
    currentIndexRef.current = 0;

    function streamStep() {
      if (currentIndexRef.current >= boundariesRef.current.length) {
        setDisplayedText(textRef.current);
        setIsStreaming(false);
        if (onCompleteCallbackRef.current) {
          onCompleteCallbackRef.current();
        }
        return;
      }

      const charLimit = boundariesRef.current[currentIndexRef.current];
      setDisplayedText(textRef.current.slice(0, charLimit));
      currentIndexRef.current += 1;

      timerRef.current = setTimeout(streamStep, speedMs);
    }

    streamStep();
  }, [cleanup]);

  const forceComplete = useCallback(() => {
    cleanup();
    setDisplayedText(textRef.current);
    setIsStreaming(false);
    if (onCompleteCallbackRef.current) {
      onCompleteCallbackRef.current();
    }
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    displayedText,
    isStreaming,
    triggerStream,
    forceComplete,
    setDisplayedText
  };
}
