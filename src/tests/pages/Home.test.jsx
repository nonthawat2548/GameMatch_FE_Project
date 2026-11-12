import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { api } from '../../api/backend';

jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const games = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  title: 'Demo: Home ' + (index + 1),
  genres: ['rpg'],
  platforms: ['PC'],
}));
beforeEach(() => jest.resetAllMocks());
function page() {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

test('loads a four-game preview and links to the catalog and quiz', async () => {
  api.mockResolvedValue(games);
  page();
  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลดเกม');
  expect(await screen.findByRole('link', { name: games[0].title })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: games[3].title })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: games[4].title })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'ดูเกมทั้งหมด' })).toHaveAttribute('href', '/discover');
  expect(screen.getByRole('link', { name: 'ลองจับคู่เกม' })).toHaveAttribute('href', '/match');
});

test('shows an explicit empty catalog instead of inventing sample games', async () => {
  api.mockResolvedValue([]);
  page();
  expect(await screen.findByText('ยังไม่มีเกมในคลัง กลับมาดูใหม่ได้ภายหลัง')).toBeInTheDocument();
  expect(screen.queryByText(games[0].title)).not.toBeInTheDocument();
});

test('retries catalog loading while keeping the home navigation available', async () => {
  api.mockRejectedValueOnce(new Error('Server offline')).mockResolvedValueOnce(games);
  page();
  expect(await screen.findByRole('alert')).toHaveTextContent('Server offline');
  expect(screen.getByRole('link', { name: 'ลองจับคู่เกม' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  expect(await screen.findByRole('link', { name: games[0].title })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('uses a real catalog image for the featured game and links to its detail', async () => {
  api.mockResolvedValue([{ ...games[0], imageUrl: 'https://example.com/cover.jpg' }, ...games.slice(1)]);
  page();
  expect(await screen.findByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' })).toHaveAttribute('href', '/games/1');
  expect(screen.getByText('6', { selector: '.hero-stats strong' })).toBeInTheDocument();
});

test('searches the existing catalog immediately and links to a matching game', async () => {
  api.mockResolvedValue(games);
  page();
  await screen.findByRole('link', { name: games[0].title });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  HOME 6  ' } });
  expect(screen.getByText('พบ 1 เกม')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เปิดเกม Demo: Home 6' })).toHaveAttribute('href', '/games/6');
  expect(screen.getByRole('link', { name: 'ดูผลการค้นหาทั้งหมด' })).toHaveAttribute('href', '/discover?q=HOME%206');
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'not found' } });
  expect(screen.getByText(/ไม่พบเกมที่ตรงกับคำค้น/)).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });
  expect(screen.queryByText(/ไม่พบเกมที่ตรงกับคำค้น/)).not.toBeInTheDocument();
});

test('selects the ten highest ranked Steam Most Played games with images, not top sellers', async () => {
  const ranked = Array.from({ length: 12 }, (_, i) => ({
    id: 100 + i, steamId: 1000 + i, title: 'Ranked ' + (i + 1),
    genres: ['action'], platforms: ['PC'], imageUrl: 'https://example.com/cover.jpg',
    popularityOrder: i + 1, popularitySource: 'Steam Most Played', isPublished: true,
  }));
  api.mockResolvedValue([
    { ...ranked[0], id: 200, title: 'Top Seller', popularitySource: 'Steam Top Sellers (TH)' },
    ...ranked.slice().reverse(),
  ]);
  page();
  const featured = await screen.findByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' });
  expect(featured).toHaveAttribute('href', '/games/100');
  expect(screen.getByText('STEAM MOST PLAYED · #1')).toBeInTheDocument();
  expect(screen.getByLabelText('สไลด์ 1 จาก 10')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /สไลด์ .*Top Seller/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /สไลด์ .*Ranked 11/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'เกมก่อนหน้า' }));
  expect(featured).toHaveAttribute('href', '/games/109');
  fireEvent.click(screen.getByRole('button', { name: 'เกมถัดไป' }));
  expect(featured).toHaveAttribute('href', '/games/100');
});

test('dismisses search results on outside interaction without clearing the query', async () => {
  api.mockResolvedValue(games);
  page();
  const input = screen.getByRole('searchbox');
  await screen.findByRole('link', { name: games[0].title });
  fireEvent.change(input, { target: { value: 'Home' } });
  expect(screen.getByText('พบ 6 เกม')).toBeInTheDocument();
  fireEvent.pointerDown(screen.getByRole('heading', { name: 'หาเกมที่อยากเล่น' }));
  expect(screen.queryByText('พบ 6 เกม')).not.toBeInTheDocument();
  expect(input).toHaveValue('Home');
  fireEvent.click(input);
  expect(screen.getByText('พบ 6 เกม')).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('button', { name: 'ปิด' }), { key: 'Escape' });
  expect(screen.queryByText('พบ 6 เกม')).not.toBeInTheDocument();
});
