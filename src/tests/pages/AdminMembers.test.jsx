import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMembers from '../../pages/AdminMembers';
import { api } from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
jest.mock('../../auth/AuthContext', () => ({ useAuth: jest.fn() }));
const members = [
  { id: 1, displayName: 'Admin A', email: 'a@example.test', username: 'admin_a', role: 'admin' },
  { id: 2, displayName: 'Player B', email: 'b@example.test', username: 'player_b', role: 'member' },
];
beforeEach(() => {
  jest.resetAllMocks();
  useAuth.mockReturnValue({ user: members[0] });
});
function page() { render(<MemoryRouter initialEntries={['/admin/members']}><AdminMembers /></MemoryRouter>); }

test('cancel closes the native role dialog and restores the trigger without writing', async () => {
  api.mockResolvedValue(members);
  page();
  const trigger = await screen.findByRole('button', { name: 'เลื่อนเป็น Admin: Player B' });
  trigger.focus();
  fireEvent.click(trigger);
  const modal = screen.getByRole('dialog');
  expect(modal).toHaveAttribute('open');
  fireEvent(modal, new Event('cancel', { bubbles: true, cancelable: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(api).toHaveBeenCalledTimes(1);
});
test('lists members, blocks own role change, confirms promotion and reflects server result', async () => {
  api.mockResolvedValueOnce(members).mockResolvedValueOnce({ ...members[1], role: 'admin' });
  page();
  const promote = await screen.findByRole('button', { name: 'เลื่อนเป็น Admin: Player B' });
  expect(screen.getByRole('button', { name: 'ลดเป็น Member: Admin A' })).toBeDisabled();
  fireEvent.click(promote);
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'ยืนยันเปลี่ยนบทบาท' }));
  expect(await screen.findByRole('button', { name: 'ลดเป็น Member: Player B' })).toBeEnabled();
  expect(api).toHaveBeenLastCalledWith('/api/admin/members/2/role', { method: 'PUT', body: { role: 'admin' } });
});
test('filters by name and role without refetching', async () => {
  api.mockResolvedValue(members);
  page();
  await screen.findByRole('button', { name: 'เลื่อนเป็น Admin: Player B' });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'PLAYER_B' } });
  expect(screen.queryByRole('button', { name: 'ลดเป็น Member: Admin A' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('บทบาท'), { target: { value: 'admin' } });
  expect(screen.getByText('ไม่พบสมาชิกที่ตรงกับคำค้น')).toBeInTheDocument();
  expect(api).toHaveBeenCalledTimes(1);
});
test('shows server errors without changing the role', async () => {
  api.mockResolvedValueOnce(members).mockRejectedValueOnce(new Error('สิทธิ์ไม่ถูกต้อง'));
  page();
  fireEvent.click(await screen.findByRole('button', { name: 'เลื่อนเป็น Admin: Player B' }));
  fireEvent.click(screen.getByRole('button', { name: 'ยืนยันเปลี่ยนบทบาท' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('สิทธิ์ไม่ถูกต้อง');
  expect(screen.getByRole('button', { name: 'เลื่อนเป็น Admin: Player B' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
