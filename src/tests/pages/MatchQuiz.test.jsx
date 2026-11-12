import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MatchQuiz from '../../pages/MatchQuiz';
import { api } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
jest.mock('../../auth/AuthContext', () => ({ useAuth: jest.fn() }));
function next() { fireEvent.click(screen.getByRole('button', { name: 'ถัดไป' })); }
function finish() { next(); next(); fireEvent.click(screen.getByRole('button', { name: 'แนะนำเกมให้ฉัน' })); }
beforeEach(() => {
  jest.resetAllMocks();
  useAuth.mockReturnValue({ user: null });
});
test('sends selected preferences and renders match reasons', async () => {
  api.mockResolvedValue([
    {
      id: 1,
      title: 'Test RPG',
      genres: ['rpg'],
      platforms: ['PC'],
      matchScore: 100,
      reasons: ['เนื้อเรื่องตรง'],
    },
  ]);
  render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'แอ็กชัน' }));
  finish();
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith('/api/recommendations', {
      method: 'POST',
      body: { genre: 'action', mode: 'solo', style: 'story' },
    }),
  );
  expect(await screen.findByText('Test RPG')).toBeInTheDocument();
  expect(screen.getByText('ตรงกับความชอบ 100/100')).toBeInTheDocument();
  expect(screen.getByText('เนื้อเรื่องตรง')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /1\. แนวเกม/ }));
  fireEvent.click(screen.getByRole('radio', { name: 'วางแผน' }));
  expect(screen.queryByText('Test RPG')).not.toBeInTheDocument();
});
test('shows empty results', async () => {
  api.mockResolvedValue([]);
  render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  finish();
  expect(await screen.findByText(/ยังไม่มีเกมที่ตรงเงื่อนไข/)).toBeInTheDocument();
});
test('shows API errors', async () => {
  api.mockRejectedValue(new Error('Server offline'));
  render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  finish();
  expect(await screen.findByRole('alert')).toHaveTextContent('Server offline');
});

test('restores member preferences and prevents editing until restored', async () => {
  useAuth.mockReturnValue({ user: { id: 1 } });
  api.mockResolvedValue({ genre: 'strategy', mode: 'coop', style: 'challenge' });
  render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeDisabled();
  await waitFor(() => expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeChecked());
  next();
  expect(screen.getByRole('radio', { name: 'เล่นกับเพื่อน (Co-op)' })).toBeChecked();
  next();
  expect(screen.getByRole('radio', { name: 'ชอบเกมยาก ๆ' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'บันทึกความชอบ' }));
  expect(await screen.findByText('บันทึกความชอบแล้ว')).toBeInTheDocument();
  expect(api).toHaveBeenLastCalledWith('/api/me/preferences', {
    method: 'PUT',
    body: { genre: 'strategy', mode: 'coop', style: 'challenge' },
  });
});

test('waits for session restoration before allowing quiz input or guest requests', async () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  const page = render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('กำลังตรวจสอบบัญชี');
  expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeDisabled();
  next();
  expect(api).not.toHaveBeenCalled();
  expect(screen.queryByRole('link', { name: 'เข้าสู่ระบบ' })).not.toBeInTheDocument();
  useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
  let restore;
  api.mockReturnValue(
    new Promise((resolve) => {
      restore = resolve;
    }),
  );
  page.rerender(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeDisabled();
  restore({ genre: 'strategy', mode: 'coop', style: 'challenge' });
  await waitFor(() => expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeEnabled());
  expect(screen.getByRole('radio', { name: 'วางแผน' })).toBeChecked();
});

test('removes previous successful results when a new request fails', async () => {
  api
    .mockResolvedValueOnce([
      { id: 1, title: 'Old result', genres: [], platforms: [], matchScore: 45 },
    ])
    .mockRejectedValueOnce(new Error('Offline'));
  render(
    <MemoryRouter>
      <MatchQuiz />
    </MemoryRouter>,
  );
  finish();
  expect(await screen.findByText('Old result')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'แนะนำเกมให้ฉัน' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  expect(screen.queryByText('Old result')).not.toBeInTheDocument();
});
