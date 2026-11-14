import { returnPath } from '../../auth/returnPath';

describe('returnPath open-redirect protection', () => {
  test('allows safe internal routes including compare and admin sections', () => {
    expect(returnPath('/')).toBe('/');
    expect(returnPath('/discover')).toBe('/discover');
    expect(returnPath('/match')).toBe('/match');
    expect(returnPath('/compare')).toBe('/compare');
    expect(returnPath('/admin')).toBe('/admin');
    expect(returnPath('/admin/dashboard')).toBe('/admin/dashboard');
    expect(returnPath('/admin/members')).toBe('/admin/members');
    expect(returnPath('/games/46')).toBe('/games/46');
    expect(returnPath('/games/46-counter-strike-2')).toBe('/games/46-counter-strike-2');
  });

  test('rejects external URLs, protocol-relative URLs, and unknown paths', () => {
    expect(returnPath('https://evil.example')).toBe('/');
    expect(returnPath('//evil.example')).toBe('/');
    expect(returnPath('/\\evil.example')).toBe('/');
    expect(returnPath('javascript:alert(1)')).toBe('/');
    expect(returnPath('/discover?q=cs2')).toBe('/');
    expect(returnPath(null)).toBe('/');
    expect(returnPath(123)).toBe('/');
  });

  test.each(['\\\\outside.example/path', '/\\outside.example', '\\outside.example', '/%5coutside.example', '/games/7/../../\\outside.example', 'https:\\outside.example'])('rejects backslash and encoded redirect destinations: %s', (value) => {
    expect(returnPath(value)).toBe('/');
  });
});
