const genres = {
  action: 'แอ็กชัน',
  adventure: 'ผจญภัย',
  rpg: 'RPG',
  strategy: 'วางแผน',
  simulation: 'จำลองสถานการณ์',
  puzzle: 'พัซเซิล',
  sports: 'กีฬา',
  racing: 'แข่งรถ',
  indie: 'อินดี้',
  casual: 'เล่นสบาย ๆ',
  'massively-multiplayer': 'MMO',
  'early-access': 'Early Access',
  'free-to-play': 'Free to Play',
  fps: 'FPS',
  survival: 'เอาตัวรอด',
  horror: 'สยองขวัญ',
  moba: 'MOBA',
};

export function genreLabel(slug) {
  return genres[slug] || slug.replace(/-/g, ' ');
}
