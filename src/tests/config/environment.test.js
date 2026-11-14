const { validateApiUrl } = require('../../../scripts/validate-env.cjs');

test.each(['', undefined, 'javascript:alert(1)', 'https://user:password@example.com', 'https://example.com?token=private', 'https://example.com#fragment', 'http://example.com'])('rejects invalid production API configuration: %p', (value) => {
  expect(() => validateApiUrl(value)).toThrow();
});

test.each(['http://localhost:8080', 'http://127.0.0.1:8080', 'http://[::1]:8080', 'https://local.localhost'])('requires explicit local QA opt-in: %s', (url) => {
  expect(() => validateApiUrl(url)).toThrow(/GM_ALLOW_LOCAL_API/);
  expect(validateApiUrl(url, true)).toBe(url);
});

test('accepts an HTTPS backend and normalizes trailing slashes', () => {
  expect(validateApiUrl(' https://api.example.com/v1/// ')).toBe('https://api.example.com/v1');
});
