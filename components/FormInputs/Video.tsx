import { useEffect, useRef } from "react";

export function Video({
  src,
  shouldStop,
}: {
  src: string;
  shouldStop: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldStop && videoRef.current) {
      videoRef.current.pause(); // Pause the video
      videoRef.current.currentTime = 0; // Reset to the beginning
    }
  }, [shouldStop]); // Runs whenever shouldStop changes
  return (
    <video ref={videoRef} controls preload="none" className="w-full h-auto">
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
