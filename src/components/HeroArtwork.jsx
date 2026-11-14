import { useState } from 'react';
import { heroImageCandidates } from '../utils/heroImages';

export default function HeroArtwork({ game }) {
  const urls = heroImageCandidates(game);
  const [attempt, setAttempt] = useState(0);
  const src = urls[attempt];
  if (!src) return null;
  return (
    <img
      key={src}
      className="cinematic-art"
      src={src}
      alt=""
      decoding="async"
      onError={() => setAttempt((index) => index + 1)}
    />
  );
}
