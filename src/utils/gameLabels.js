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

export function tagLabel(slug) {
  return ({fps:'FPS',pvp:'PvP',moba:'MOBA',rpg:'RPG',mmorpg:'MMORPG',esports:'Esports','co-op':'Co-op','online-co-op':'Online Co-op','local-co-op':'Local Co-op'})[slug] || slug.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
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
