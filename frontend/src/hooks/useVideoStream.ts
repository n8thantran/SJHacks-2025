import { useState, useEffect } from 'react';

interface VideoStreamProps {
  url: string;
  refreshRate?: number; // in milliseconds
}

export function useVideoStream({ url, refreshRate = 33 }: VideoStreamProps) { // ~30fps
  const [streamUrl, setStreamUrl] = useState(`${url}?t=${Date.now()}`);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setStreamUrl(`${url}?t=${Date.now()}`);
    }, refreshRate);

    return () => {
      clearInterval(interval);
    };
  }, [url, refreshRate, isStreaming]);

  const toggleStream = () => {
    setIsStreaming(prev => !prev);
  };

  return {
    streamUrl,
    isStreaming,
    toggleStream
  };
} 