import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameReviews from '../../components/GameReviews';
import { api } from '../../api/backend';

jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const mine = { id: 7, memberId: 1, displayName: 'Alice', rating: 5, comment: 'สนุกมากเล่นกับเพื่อนได้', createdAt: '2026-11-12T00:00:00Z' };
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
  expect(screen.getByText('สนุกมากเล่นกับเพื่อนได้')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'เขียนรีวิว' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'ลบรีวิว' })).not.toBeInTheDocument();
});

test('member submits stars and comment then sees only own review controls', async () => {
  api.mockResolvedValue({ ...mine, rating: 4 });
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'ให้คะแนน 4 ดาว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'สนุกมากเล่นกับเพื่อนได้' } });
  fireEvent.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));
  expect(await screen.findByText('โพสต์รีวิวแล้ว')).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith('/api/games/46/reviews', { method: 'POST', body: { rating: 4, comment: 'สนุกมากเล่นกับเพื่อนได้' } });
  expect(screen.getByRole('button', { name: 'แก้ไขรีวิว' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
});

test('owner can edit and confirm deletion; other review stays', async () => {
  api.mockResolvedValueOnce({ ...mine, rating: 2, comment: 'ปรับคะแนนหลังเล่นไปหลายชั่วโมง' }).mockResolvedValueOnce({ ok: true });
  render(<Harness initial={[mine, other]} />);
  expect(screen.getAllByRole('button', { name: 'ลบรีวิว' })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'แก้ไขรีวิว' }));
  expect(screen.getByLabelText('ความคิดเห็น')).toHaveValue('สนุกมากเล่นกับเพื่อนได้');
  fireEvent.click(screen.getByRole('button', { name: 'ให้คะแนน 2 ดาว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'ปรับคะแนนหลังเล่นไปหลายชั่วโมง' } });
  fireEvent.click(screen.getByRole('button', { name: 'บันทึกการแก้ไข' }));
  expect(await screen.findByText('บันทึกการแก้ไขแล้ว')).toBeInTheDocument();
  expect(screen.getByText('ปรับคะแนนหลังเล่นไปหลายชั่วโมง')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ลบรีวิว' })).toBeEnabled();
  expect(api).toHaveBeenCalledWith('/api/games/46/reviews/7', { method: 'PUT', body: { rating: 2, comment: 'ปรับคะแนนหลังเล่นไปหลายชั่วโมง' } });
  fireEvent.click(screen.getByRole('button', { name: 'ลบรีวิว' }));
  expect(api).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'ยืนยันลบ' }));
  await waitFor(() => expect(screen.queryByText('ปรับคะแนนหลังเล่นไปหลายชั่วโมง')).not.toBeInTheDocument());
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
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'ข้อความรีวิวนี้ยังอยู่' } });
  fireEvent.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('ระบบฐานข้อมูลขัดข้อง');
  expect(screen.getByLabelText('ความคิดเห็น')).toHaveValue('ข้อความรีวิวนี้ยังอยู่');
});

test('loading and failed list do not pretend to be an empty review list', () => {
  const { rerender } = render(<Harness loading />);
  expect(screen.getByRole('status')).toHaveTextContent('กำลังโหลดรีวิว');
  rerender(<Harness loadError="โหลดไม่ได้" />);
  expect(screen.getByRole('alert')).toHaveTextContent('โหลดไม่ได้');
  expect(screen.queryByRole('button', { name: 'เขียนรีวิว' })).not.toBeInTheDocument();
  expect(screen.queryByText(/ยังไม่มีรีวิว/)).not.toBeInTheDocument();
});

test('requires at least ten characters before posting', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
  fireEvent.change(screen.getByLabelText('ความคิดเห็น'), { target: { value: 'สนุก' } });
  expect(screen.getByRole('button', { name: 'ส่งรีวิว' })).toBeDisabled();
  expect(api).not.toHaveBeenCalled();
});

test('filters and sorts actual member reviews without changing the overall score', () => {
  const newest = {...other, id:9, memberId:3, displayName:'Cara', rating:1, comment:'เกมนี้ยังไม่เหมาะกับฉัน', createdAt:'2026-11-13T00:00:00Z'};
  render(<Harness user={null} initial={[mine, other, newest]}/>);
  expect(screen.getByText('3.0')).toBeInTheDocument();
  const articles = () => screen.getAllByRole('article').map(el=>el.textContent);
  expect(articles()[0]).toContain('Cara');
  fireEvent.change(screen.getByRole('combobox',{name:'เรียงรีวิว'}),{target:{value:'highest'}});
  expect(articles()[0]).toContain('Alice');
  fireEvent.change(screen.getByRole('combobox',{name:'กรองคะแนนรีวิว'}),{target:{value:'3'}});
  expect(articles()).toHaveLength(1);
  expect(articles()[0]).toContain('Bob');
  expect(screen.getByText('3.0')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox',{name:'กรองคะแนนรีวิว'}),{target:{value:'2'}});
  expect(screen.getByText('ไม่มีรีวิวที่ตรงกับตัวกรอง')).toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
});
test('filtering other reviews never hides the signed-in member review or its controls', () => {
  render(<Harness initial={[mine,other]}/>);
  fireEvent.change(screen.getByRole('combobox',{name:'กรองคะแนนรีวิว'}),{target:{value:'1'}});
  expect(screen.getByText(mine.comment)).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'แก้ไขรีวิว'})).toBeInTheDocument();
  expect(screen.queryByText(other.comment)).not.toBeInTheDocument();
});

test('helpful vote uses the protected API and updates the count from the server', async () => {
  api.mockResolvedValueOnce([]).mockResolvedValueOnce({helpfulCount:3,voted:true}).mockResolvedValueOnce({helpfulCount:2,voted:false});
  render(<Harness initial={[{...other,helpfulCount:2}]}/>);
  const button=await screen.findByRole('button',{name:'👍 มีประโยชน์ 2'});
  await waitFor(()=>expect(button).toBeEnabled());
  fireEvent.click(button);
  const voted=await screen.findByRole('button',{name:'👍 มีประโยชน์ 3'});
  expect(voted).toHaveAttribute('aria-pressed','true');
  expect(api).toHaveBeenCalledWith('/api/games/46/reviews/8/helpful',{method:'PUT'});
  fireEvent.click(voted);
  await waitFor(()=>expect(screen.getByRole('button',{name:'👍 มีประโยชน์ 2'})).toHaveAttribute('aria-pressed','false'));
  expect(api).toHaveBeenLastCalledWith('/api/games/46/reviews/8/helpful',{method:'DELETE'});
});

test('retries a failed vote-status read without reloading reviews, then allows voting', async () => {
  api.mockRejectedValueOnce(new Error('Temporary outage'))
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ helpfulCount: 3, voted: true });
  render(<Harness initial={[{ ...other, helpfulCount: 2 }]} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('ยังโหลดสถานะโหวตไม่ได้');
  expect(screen.getByText(other.comment)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '👍 มีประโยชน์ 2' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'ลองโหลดสถานะโหวตใหม่' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '👍 มีประโยชน์ 2' })).toBeEnabled());
  expect(screen.queryByText('ยังโหลดสถานะโหวตไม่ได้')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '👍 มีประโยชน์ 2' }));
  expect(await screen.findByRole('button', { name: '👍 มีประโยชน์ 3' })).toHaveAttribute('aria-pressed', 'true');
  expect(api.mock.calls.map(([path]) => path)).toEqual([
    '/api/me/review-votes/46', '/api/me/review-votes/46', '/api/games/46/reviews/8/helpful',
  ]);
});
