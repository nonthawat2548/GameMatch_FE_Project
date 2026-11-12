import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../../pages/AdminDashboard';
import { api } from '../../api/backend';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
test('loads admin counts from Go and handles errors with retry', async () => {
  api.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ games: 8, published: 5, members: 4, admins: 1, reviews: 6 });
  render(<MemoryRouter initialEntries={['/admin/dashboard']}><AdminDashboard /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
  fireEvent.click(screen.getByRole('button', { name: 'ลองใหม่' }));
  const label = await screen.findByText('เกมทั้งหมด');
  expect(label.parentElement).toHaveTextContent('8');
  expect(screen.getByText('ซ่อนอยู่').parentElement).toHaveTextContent('3');
  expect(screen.getByText('รีวิวทั้งหมด').parentElement).toHaveTextContent('6');
  expect(within(screen.getByRole('navigation', { name: 'เมนูผู้ดูแลระบบ' })).getByRole('link', { name: 'จัดการสมาชิก' })).toHaveAttribute('href', '/admin/members');
  expect(api).toHaveBeenLastCalledWith('/api/admin/stats', expect.objectContaining({ signal: expect.anything() }));
});
