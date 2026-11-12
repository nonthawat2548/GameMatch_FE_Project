// Banner artwork is independent of the Steam header used by GameCard.
// Steam Library Hero assets: https://partner.steamgames.com/doc/store/assets/libraryassets
// Asset paths verified against the corresponding SteamDB app metadata.
// Use the known hash, not the hash from header.jpg (different assets).
const heroPaths = {
  730: 'library_hero_2x.jpg',
  570: '06918d1009cc79ffdee853f1ef789cddf8014226/library_hero_2x.jpg',
  578080: 'a14b88ee69f55d5354d3efc1f725eddf40650869/library_hero_2x.jpg',
  4115450: 'c3019586a92590812df570bf8eb7c752a48132cb/library_hero_2x.jpg',
  1938090: '21c68de59cd47955c6a18f408d84a40e98a05a37/library_hero_2x.jpg',
  1172470: '8172a927a16a54bf8e8a21bce045f8304672c788/library_hero_2x.jpg',
  2868840: '142685c713492a21940cf2c01e50f85aca5780c8/library_hero_2x.jpg',
  4348910: '5c4503e62e9ff9d138d93d972ebd1fe62af114bc/library_hero_2x.jpg',
  236390: 'c0c9924bdb608cd5a03b44d878e187545c8e1dc5/library_hero_2x.jpg',
};
const cdn = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/';
// Official full-size cinematic trailer still, listed under ROB RUN's Steam metadata.
const robRunStill = cdn + '257396463/b6ff073fe516f2ec74fb0e4fe05ea88994c740a8/movie_full.jpg';
// Full-size screenshot from Steam appdetails, for Call of Duty's alternate fallback.
const codScreenshot = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1938090/ee5f6b6aebe4dc9e86b49c4e309d361b132df308/ss_ee5f6b6aebe4dc9e86b49c4e309d361b132df308.1920x1080.jpg?t=1784850874';

export function heroImageCandidates(game) {
  const urls = [];
  if (Number.isSafeInteger(game.steamId) && game.steamId > 0) {
    const base = cdn + game.steamId + '/';
    const known = heroPaths[game.steamId];
    if (known) {
      urls.push(base + known, base + known.replace('_2x.jpg', '.jpg'));
    }
    if (game.steamId === 4262460) urls.push(robRunStill);
    if (game.steamId === 1938090) urls.push(codScreenshot);
    urls.push(base + 'library_hero_2x.jpg', base + 'library_hero.jpg');
    // For a new game, a larger header is an intermediate fallback before the original.
    try {
      const header = new URL(game.imageUrl);
      if (header.protocol === 'https:' && header.hostname.endsWith('.steamstatic.com') &&
          header.pathname.includes('/apps/' + game.steamId + '/') && header.pathname.endsWith('/header.jpg')) {
        header.pathname = header.pathname.replace(/header\.jpg$/, 'header_2x.jpg');
        urls.push(header.href);
      }
    } catch {
      // Unknown image URL: keep the original fallback below.
    }
  }
  if (game.imageUrl) urls.push(game.imageUrl);
  return [...new Set(urls)];
}
