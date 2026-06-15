import React, { useEffect, useRef } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setTimeout(onComplete, 300);
    };

    video.addEventListener('ended', handleEnded);

    const fallbackTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      video.removeEventListener('ended', handleEnded);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-h-[100dvh] flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        >
          <source src="/loading.mp4" type="video/mp4" />
        </video>
        {/* Overlay text replacing "Flex" — positioned right on the logo in the center-upper area */}
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Black mask to cover original "Flex" text */}
          <div className="absolute inset-0 bg-black rounded-sm -m-2" />
          <h1
            className="relative text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase whitespace-nowrap"
            style={{
              letterSpacing: '0.12em',
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            Byton Movies
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
