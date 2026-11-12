import { passwordError, characterCount } from '../../utils/validation';
test('counts characters rather than UTF-8 bytes for the minimum password length', () => {
  expect(characterCount('กขค')).toBe(3);
  expect(passwordError('กขค')).not.toBe('');
  expect(passwordError('กขคงจฉชซ')).toBe('');
  expect(passwordError('ก'.repeat(25))).not.toBe('');
});
