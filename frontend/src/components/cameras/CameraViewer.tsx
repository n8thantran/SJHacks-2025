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
        const response = await fetch('http://localhost:8000/video-feed', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video feed: ${response.status}`);
        }
        
        // Get the image data as a blob
        const blob = await response.blob();
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        if (imgRef.current) {
          // Clean up previous URL
          if (imgRef.current.src) {
            URL.revokeObjectURL(imgRef.current.src);
          }
          
          // Create a new image element to preload
          const img = new Image();
          img.onload = () => {
            if (imgRef.current) {
              imgRef.current.src = url;
              setIsLoading(false);
            }
          };
          img.onerror = () => {
            setError('Failed to load image');
            setIsLoading(false);
          };
          img.src = url;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video feed');
        console.error('Error fetching video feed:', err);
        setIsLoading(false);
      }
    };

    if (isPlaying) {
      // Initial fetch
      fetchFrame();
      // Fetch a new frame every 50ms (for ~20 FPS)
      frameInterval.current = setInterval(fetchFrame, 50);
    }

    return () => {
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
      // Clean up any remaining object URLs
      if (imgRef.current?.src) {
        URL.revokeObjectURL(imgRef.current.src);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
          <p className="text-lg mb-2">Error loading camera feed</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
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
                  URL.revokeObjectURL(imgRef.current.src);
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