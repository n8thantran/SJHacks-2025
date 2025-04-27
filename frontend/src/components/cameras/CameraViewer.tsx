import { useEffect, useRef, useState } from 'react';
import { Video, PauseCircle, RefreshCw } from 'lucide-react';

interface CameraViewerProps {
  cameraId: number;
  onClose: () => void;
}

export default function CameraViewer({ cameraId, onClose }: CameraViewerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchFrame = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/video-feed');
        if (!response.ok) {
          throw new Error('Failed to fetch video feed');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (imgRef.current) {
          imgRef.current.src = url;
          setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video feed');
        console.error('Error fetching video feed:', err);
        setIsLoading(false);
      }
    };

    if (isPlaying) {
      // Fetch a new frame every 100ms (10 FPS)
      frameInterval.current = setInterval(fetchFrame, 100);
    }

    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
          <p className="text-lg mb-2">Error loading camera feed</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img
            ref={imgRef}
            alt="Camera Feed"
            className="w-full h-full object-contain"
            onError={() => setError('Failed to load image')}
          />
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-slate-800/70 rounded-full text-slate-300 hover:text-white"
            >
              {isPlaying ? <PauseCircle size={20} /> : <Video size={20} />}
            </button>
            <button
              onClick={() => {
                if (imgRef.current) {
                  imgRef.current.src = '';
                  setIsLoading(true);
                }
              }}
              className="p-2 bg-slate-800/70 rounded-full text-slate-300 hover:text-white"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
} 