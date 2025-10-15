
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onError: (error: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 480 },
          height: { ideal: 480 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      onError("Camera access was denied. Please allow camera permissions in your browser settings to use this feature.");
    }
  }, [onError]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureClick = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full">
      <div className="relative w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden mb-6">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border-4 border-gray-700/50 rounded-lg pointer-events-none"></div>
      </div>
      <button
        onClick={handleCaptureClick}
        className="bg-[#1DB954] text-white p-4 rounded-full hover:bg-[#1ed760] transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#181818] focus:ring-[#1DB954]"
        aria-label="Capture mood"
      >
        <CameraIcon className="w-8 h-8" />
      </button>
      <p className="text-gray-400 mt-4 text-center">Position your face in the frame and capture your mood.</p>
    </div>
  );
};
