import { useEffect, useRef, useState } from 'react';
import { heroVideoCandidates } from '../utils/heroVideos';

export default function HeroVideo({ game, paused, onPlaybackChange }) {
  const urls = heroVideoCandidates(game);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);
  const src = urls[attempt];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let active = true;
    function syncPlayback() {
      if (paused || document.hidden) {
        video.pause();
        return;
      }
      // Autoplay may be blocked in some browsers. Keep the artwork visible.
      video.muted = true;
      const playing = video.play();
      if (playing && playing.catch) {
        playing.catch((error) => {
          if (!active || error.name === 'AbortError') return;
          setReady(false);
          onPlaybackChange?.(false);
        });
      }
    }
    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [src, paused, onPlaybackChange]);

  if (!src) return null;
  return (
    <video
      key={src}
      ref={videoRef}
      className={'cinematic-video' + (ready ? ' is-playing' : '')}
      src={src}
      muted
      playsInline
      loop
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => {
        setReady(true);
        onPlaybackChange?.(true);
      }}
      onWaiting={() => onPlaybackChange?.(false)}
      onStalled={() => onPlaybackChange?.(false)}
      onError={() => {
        setReady(false);
        onPlaybackChange?.(false);
        setAttempt((n) => n + 1);
      }}
    />
  );
}
