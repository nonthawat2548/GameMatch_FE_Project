const genres = {
  action: 'แอ็กชัน',
  adventure: 'ผจญภัย',
  rpg: 'RPG',
  strategy: 'วางแผน',
  simulation: 'จำลองชีวิต / สถานการณ์',
  puzzle: 'แก้ปริศนา',
  sports: 'กีฬา',
  racing: 'แข่งรถ',
  indie: 'อินดี้',
  casual: 'เล่นสบาย ๆ',
  'massively-multiplayer': 'MMO',
  'early-access': 'เกมระหว่างพัฒนา (Early Access)',
  'free-to-play': 'เล่นฟรี',
  fps: 'เกมยิง FPS',
  survival: 'เอาตัวรอด',
  horror: 'สยองขวัญ',
  moba: 'MOBA',
};

export function genreLabel(slug) {
  return genres[slug] || slug.replace(/-/g, ' ');
}

const tags = {
  singleplayer: 'เล่นคนเดียว', 'single-player': 'เล่นคนเดียว',
  multiplayer: 'เล่นหลายคน', 'multi-player': 'เล่นหลายคน',
  'co-op': 'เล่นกับเพื่อน', cooperative: 'เล่นกับเพื่อน',
  'online-co-op': 'เล่นกับเพื่อนออนไลน์', 'local-co-op': 'เล่นด้วยกันบนเครื่องเดียว',
  'co-op-campaign': 'เล่นเนื้อเรื่องกับเพื่อน', pvp: 'แข่งกับคนอื่น',
  'online-pvp': 'แข่งออนไลน์', 'local-pvp': 'แข่งกันบนเครื่องเดียว',
  'story-rich': 'เนื้อเรื่องเข้มข้น', 'story-driven': 'เน้นเนื้อเรื่อง',
  'open-world': 'โลกกว้าง', 'first-person': 'มุมมองบุคคลที่หนึ่ง',
  'third-person': 'มุมมองบุคคลที่สาม', competitive: 'เน้นแข่งขัน',
  relaxing: 'เล่นชิล ๆ', cozy: 'บรรยากาศสบาย ๆ', difficult: 'เกมยาก',
  challenging: 'ท้าทายฝีมือ', 'souls-like': 'แนว Souls-like',
  shooter: 'เกมยิง', sandbox: 'เล่นได้อิสระ', 'free-to-play': 'เล่นฟรี',
  crafting: 'สร้างของ', exploration: 'สำรวจโลก', building: 'สร้างบ้าน / ฐาน',
};
export function tagLabel(slug) {
  return tags[slug] || genreLabel(slug);
}

export function matchPartLabel(label) {
  return { 'รูปแบบการเล่น': 'เล่นกับใคร', 'สไตล์การเล่น': 'ฟีลเกมที่ชอบ' }[label] || label;
}

export function friendlyReason(reason) {
  const labels = {
    'แนวเกมตรงกับความชอบ +45': 'เป็นแนวเกมที่คุณชอบ +45',
    'รูปแบบการเล่นตรง +25': 'เล่นได้ในแบบที่คุณเลือก +25',
    'สไตล์การเล่นตรง +30': 'ได้ฟีลเกมที่คุณชอบ +30',
  };
  if (labels[reason]) return labels[reason];
  if (reason.startsWith('แนวเกมร่วม: ')) return 'แนวเกมคล้ายกัน: ' + reason.slice('แนวเกมร่วม: '.length).split(', ').map(genreLabel).join(', ');
  if (reason.startsWith('แท็กร่วม: ')) return 'จุดเด่นคล้ายกัน: ' + reason.slice('แท็กร่วม: '.length).split(', ').map(tagLabel).join(', ');
  return reason;
}
