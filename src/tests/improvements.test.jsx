import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { GameInfo } from '../components/GameDetails';
import GameReviews from '../components/GameReviews';
import Detail from '../pages/Detail';
import App from '../App';
import { api } from '../api/backend';

jest.mock('../api/backend', () => ({
  api: jest.fn(),
  getToken: () => '',
  setToken: jest.fn(),
  SESSION_EXPIRED_EVENT: 'gamematch:session-expired',
}));

beforeEach(() => {
  jest.resetAllMocks();
  api.mockResolvedValue([]);
});

test('GameInfo shows Steam Thailand discount percentage and falls back from broken headerImage to game imageUrl', () => {
  const { container } = render(
    <MemoryRouter>
      <GameInfo
        game={{
          id: 54,
          steamId: 2868840,
          title: 'Slay the Spire 2',
          imageUrl: 'https://example.com/fallback-cover.jpg',
          genres: ['indie', 'strategy'],
          platforms: ['Windows'],
        }}
        metadata={{
          isFree: false,
          headerImage: 'https://example.com/broken-header.jpg',
          price: {
            currency: 'THB',
            initial: 49900,
            final: 39920,
            discount_percent: 20,
          },
          developers: ['Mega Crit'],
          publishers: ['Mega Crit'],
        }}
      />
    </MemoryRouter>,
  );

  expect(screen.getByText('฿399.20')).toBeInTheDocument();
  expect(screen.getByText('฿499.00')).toBeInTheDocument();
  expect(screen.getByText('−20%')).toBeInTheDocument();

  const cover = container.querySelector('.game-info-cover');
  expect(cover).toHaveAttribute('src', 'https://example.com/broken-header.jpg');
  fireEvent.error(cover);
  expect(container.querySelector('.game-info-cover')).toHaveAttribute(
    'src',
    'https://example.com/fallback-cover.jpg',
  );
  fireEvent.error(container.querySelector('.game-info-cover'));
  expect(container.querySelector('.game-info-cover')).toBeNull();
});

test('GameReviews opens edit mode automatically when returning with intent review and an existing review', async () => {
  const reviews = [
    {
      id: 99,
      memberId: 5,
      displayName: 'Alice',
      rating: 4,
      comment: 'เกมดีมาก เล่นกับเพื่อนสนุกสุดๆ',
      createdAt: '2026-11-12T10:00:00Z',
      helpfulCount: 2,
    },
  ];

  render(
    <MemoryRouter>
      <GameReviews
        gameId={46}
        user={{ id: 5, role: 'member', displayName: 'Alice' }}
        reviews={reviews}
        setReviews={jest.fn()}
        loading={false}
        loadError=""
        autoWrite={true}
      />
    </MemoryRouter>,
  );

  expect(await screen.findByRole('heading', { name: 'แก้ไขรีวิวของคุณ' })).toBeInTheDocument();
  expect(screen.getByText('คุณเคยรีวิวเกมนี้ไว้แล้ว สามารถแก้ไขรีวิวของคุณได้ด้านล่าง')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('เกมดีมาก เล่นกับเพื่อนสนุกสุดๆ');

  fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
  expect(screen.queryByRole('heading', { name: 'แก้ไขรีวิวของคุณ' })).not.toBeInTheDocument();
});

test('App sets dynamic route title and canonical URL without duplicating link tags', async () => {
  window.history.replaceState({}, '', '/discover');
  render(<App />);

  await waitFor(() => {
    expect(document.title).toBe('เกมทั้งหมด | GameMatch');
  });
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toMatch(/\/discover$/);

  fireEvent.click(screen.getAllByRole('link', { name: 'เปรียบเทียบ' })[0]);
  await waitFor(() => {
    expect(document.title).toBe('เปรียบเทียบเกม | GameMatch');
  });
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toMatch(/\/compare$/);
});

test('Detail page does not render system specs section even when metadata includes requirements', async () => {
  api.mockImplementation((path) => {
    if (path === '/api/games/46') {
      return Promise.resolve({
        id: 46,
        steamId: 730,
        title: 'Counter-Strike 2',
        description: 'Tactical shooter',
        genres: ['action'],
        tags: ['fps'],
        platforms: ['Windows'],
        imageUrl: 'https://example.com/cs2.jpg',
      });
    }
    if (path === '/api/games/46/metadata') {
      return Promise.resolve({
        isFree: true,
        requirements: {
          Windows: { minimum: 'Windows 10', recommended: 'Windows 11' },
        },
      });
    }
    return Promise.resolve([]);
  });

  render(
    <MemoryRouter initialEntries={['/games/46-counter-strike-2']}>
      <AuthProvider>
        <Routes>
          <Route path="/games/:id" element={<Detail />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

  expect(await screen.findByRole('heading', { name: 'Counter-Strike 2' })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('เกี่ยวกับเกม')).toBeInTheDocument());
  expect(screen.queryByRole('heading', { name: 'สเปกเครื่อง' })).not.toBeInTheDocument();
  expect(screen.queryByText('Windows 10')).not.toBeInTheDocument();
});
