// Steam's official six-second preview assets (metadata checked on SteamDB).
// https://partner.steamgames.com/doc/store/trailer
// Keep these separate from card images and do not download or rehost the trailers.
const fallbackPaths = {
  730: '612468/aa5a28c78f12232e6b6839034550c28b162fad3e/1748810724',
  570: '116737/313addee2092d0bd6f538d164610061ea8bbe79c/1749859757',
  578080: '1309225277/08ba54c8ba10768fa42079088e766a37ae14b242/1758181273',
  4115450: '2017779222/246d84f0694ce7cd982874d0a6296874776d67f4/1780473709',
  1938090: '1281552379/e7fe3e6260dcf40e6841762271282415b5be4703/1780067712',
  1172470: '1182889611/d98a0365413af7dca2b67039b260d8849a97627d/1785867041',
  4262460: '1670834948/526423354ca76fe8f929a805ace5aa0da933f385/1775656792',
  2868840: '1627257579/a83072d3f9fb135618cc17b8390a50a19656a00d/1771464864',
  4348910: '1029376199/a658a0ad7992fdb9eba32eadff946e0d84c4d06c/1793112587',
  236390: '1521636058/72682bff0f1315da3a0f5bc680f452cf613bd23d/1782232582',
};

// Prefer gameplay-focused footage over reveal/cinematic trailers.
 // Source: official Steam trailer metadata (SteamDB app screenshots/info).
const gameplayPaths = {
  // Responsive Smokes (in-game mechanics demonstration)
  730: '607847/d73c6346bc3bf5dbc6d66a8f721bab640fa3d37c/1748810721',
  // Dota 2 - Sizzle Reel
  570: '343440/a4bddad5bacce0e8395f7458ef4d8d9bad3efca9/1749859790',
  // Phantom Blade Zero - Year of the Snake Gameplay Trailer
  4115450: '2061584490/a70ec30e56624f05d2b4d6c30f172031c6e09121/1765775351',
  // Slay the Spire 2 - Gameplay Trailer
  2868840: '640808763/5e2d60a7b2b5b59366ac22b2450aa134ee2b822a/1770238477',
  // Apex Legends: Cipher Gameplay Trailer
  1172470: '756891131/fee6a815b821b7a2d21ecba7f994564efe82cd12/1793730568',
};

export function heroVideoCandidates(game) {
  const id = game?.steamId;
  const paths = [...new Set([gameplayPaths[id], fallbackPaths[id]].filter(Boolean))];
  return paths.flatMap((path) => {
    const base = 'https://video.fastly.steamstatic.com/store_trailers/' + id + '/' + path + '/microtrailer';
    return [base + '.mp4', base + '.webm'];
  });
}
