import { useState, useEffect, useRef } from 'react';

interface UseVideoStreamProps {
  url: string;
  refreshRate?: number;
}

// Fallback video source for offline mode
const FALLBACK_VIDEO_SRC = '/images/offline-camera-feed.jpg';

export function useVideoStream({ url, refreshRate = 30 }: UseVideoStreamProps) {
  const [videoSrc, setVideoSrc] = useState<string>(FALLBACK_VIDEO_SRC);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateVideo = async () => {
      try {
        if (!url) {
          setVideoSrc(FALLBACK_VIDEO_SRC);
          setIsOffline(true);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch video feed');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
        setIsOffline(false);
      } catch (error) {
        console.error('Error fetching video feed:', error);
        setVideoSrc(FALLBACK_VIDEO_SRC);
        setIsOffline(true);
      }
    };

    // Initial update
    updateVideo();

    // Set up polling
    if (url) {
      intervalRef.current = setInterval(updateVideo, 1000 / refreshRate);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [url, refreshRate]);

  return { videoSrc, isOffline };
} 