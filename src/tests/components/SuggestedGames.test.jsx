import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SuggestedGames from '../../components/SuggestedGames';
import { api } from '../../api/backend';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
test('loads similar games, handles failure and retries the exact API', async () => {
  api.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([{ id: 2, title: 'Similar game', genres: ['action'], platforms: ['PC'] }]);
  render(<MemoryRouter><SuggestedGames path="/api/games/1/similar" title="เกมที่คล้ายกัน" description="จากแนวที่ชอบ" emptyText="ยังไม่มีเกม" /></MemoryRouter>);
  expect(await screen.findByText(/Offline/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'โหลดคำแนะนำอีกครั้ง' }));
  expect(await screen.findByRole('link', { name: 'Similar game' })).toHaveAttribute('href', '/games/2-similar-game');
  expect(api).toHaveBeenCalledTimes(2);
  expect(api).toHaveBeenLastCalledWith('/api/games/1/similar', expect.objectContaining({ signal: expect.anything() }));
});
