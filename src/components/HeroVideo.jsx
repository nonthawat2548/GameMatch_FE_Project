import { useEffect, useRef, useState } from 'react';
import { heroVideoCandidates } from '../utils/heroVideos';

export default function HeroVideo({ game, paused, onPlaybackStarted }) {
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
      video.muted = true;
      const playing = video.play();
      if (playing && playing.catch) {
        playing.catch((error) => {
          if (!active || error.name === 'AbortError') return;
          setReady(false);
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
  }, [src, paused, onPlaybackStarted]);

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
        onPlaybackStarted?.();
      }}
      onError={() => {
        setReady(false);
        setAttempt((n) => n + 1);
      }}
    />
  );
}
