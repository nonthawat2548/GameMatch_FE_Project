import { friendlyReason, genreLabel, tagLabel, matchPartLabel } from '../../utils/gameLabels';
test('uses everyday Thai for recommendation reasons and familiar game terms', () => {
  expect(genreLabel('free-to-play')).toBe('เล่นฟรี');
  expect(tagLabel('online-co-op')).toBe('Online Co-op');
  expect(tagLabel('unknown-tag')).toBe('Unknown Tag');
  expect(matchPartLabel('รูปแบบการเล่น')).toBe('เล่นกับใคร');
  expect(friendlyReason('แนวเกมตรงกับความชอบ +45')).toBe('เป็นแนวเกมที่คุณชอบ +45');
  expect(friendlyReason('แท็กร่วม: online-co-op, story-rich')).toBe('จุดเด่นคล้ายกัน: Online Co-op, Story Rich');
  expect(friendlyReason('คล้ายกับ Dota 2')).toBe('คล้ายกับ Dota 2');
});
