import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameReviews from '../../components/GameReviews';
import { api } from '../../api/backend';

jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const mine = { id: 7, memberId: 1, displayName: 'Alice', rating: 5, comment: 'สนุกมาก', createdAt: '2026-11-12T00:00:00Z' };
const other = { ...mine, id: 8, memberId: 2, displayName: 'Bob', rating: 3, comment: 'เล่นเพลิน' };
const member = { id: 1, role: 'member' };
function Harness({ initial = [], user = member, loading = false, loadError = '' }) {
  const [reviews, setReviews] = useState(initial);
  return <MemoryRouter><GameReviews gameId="46" user={user} reviews={reviews} setReviews={setReviews} loading={loading} loadError={loadError} onRetry={jest.fn()} /></MemoryRouter>;
}
beforeEach(() => jest.resetAllMocks());

test('guest can read scores but cannot write or delete', () => {
  render(<Harness user={null} initial={[mine, other]} />);
  expect(screen.getByText('4.0')).toBeInTheDocument();
  expect(screen.getByText('สนุกมาก')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'ลบรีวิว' })).not.toBeInTheDocument();
});

test('member submits stars and comment then sees only own review controls', async () => {
  api.mockResolvedValue({ ...mine, rating: 4 });
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'ให้คะแนน 4 ดาว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'สนุกมาก' } });
  fireEvent.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));
  expect(await screen.findByText('ส่งรีวิวสำเร็จ')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/api/games/46/reviews', { method: 'POST', body: { rating: 4, comment: 'สนุกมาก' } });
  expect(screen.getByRole('button', { name: 'แก้ไขรีวิว' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
});

test('owner can edit and confirm deletion; other review stays', async () => {
  api.mockResolvedValueOnce({ ...mine, rating: 2, comment: 'ปรับคะแนน' }).mockResolvedValueOnce({ ok: true });
  render(<Harness initial={[mine, other]} />);
  expect(screen.getAllByRole('button', { name: 'ลบรีวิว' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'แก้ไขรีวิว' }));
  expect(screen.getByLabelText('ความคิดเห็น')).toHaveValue('สนุกมาก');
  fireEvent.click(screen.getByRole('button', { name: 'ให้คะแนน 2 ดาว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'ปรับคะแนน' } });
  fireEvent.click(screen.getByRole('button', { name: 'บันทึกการแก้ไข' }));
  expect(await screen.findByText('ปรับคะแนน')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/api/games/46/reviews/7', { method: 'PUT', body: { rating: 2, comment: 'ปรับคะแนน' } });
  fireEvent.click(screen.getByRole('button', { name: 'ลบรีวิว' }));
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'ยืนยันลบ' }));
  await waitFor(() => expect(screen.queryByText('ปรับคะแนน')).not.toBeInTheDocument());
  expect(api).toHaveBeenLastCalledWith('/api/games/46/reviews/7', { method: 'DELETE' });
  expect(screen.getByText('เล่นเพลิน')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'เขียนรีวิว' })).toBeInTheDocument();
});

test('admin can delete another review but cannot edit it', () => {
  render(<Harness user={{ id: 9, role: 'admin' }} initial={[other]} />);
  expect(screen.getByRole('button', { name: 'ลบรีวิว' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'แก้ไขรีวิว' })).not.toBeInTheDocument();
});

test('failed write keeps the draft and reports the error', async () => {
  api.mockRejectedValue(new Error('ระบบฐานข้อมูลขัดข้อง'));
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'ยังอยู่' } });
  fireEvent.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('ระบบฐานข้อมูลขัดข้อง');
  expect(screen.getByLabelText('ความคิดเห็น')).toHaveValue('ยังอยู่');
});

test('loading and failed list do not pretend to be an empty review list', () => {
  const { rerender } = render(<Harness loading />);
  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลดรีวิว');
  rerender(<Harness loadError="โหลดไม่ได้" />);
  expect(screen.getByRole('alert')).toHaveTextContent('โหลดไม่ได้');
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
  expect(screen.queryByText(/ยังไม่มีรีวิว/)).not.toBeInTheDocument();
});
