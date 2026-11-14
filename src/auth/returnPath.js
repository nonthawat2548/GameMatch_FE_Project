const pages = [
  '/',
  '/discover',
  '/match',
  '/compare',
  '/about',
  '/me/favorites',
  '/me/profile',
  '/admin',
  '/admin/dashboard',
  '/admin/members',
];

export function returnPath(value) {
  if (typeof value !== 'string') return '/';
  return pages.includes(value) || /^\/games\/[1-9]\d*(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(value) ? value : '/';
}
