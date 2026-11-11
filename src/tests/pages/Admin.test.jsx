import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Admin from '../../pages/Admin';
import { api } from '../../api/backend';

jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const catalogApi = jest.fn();
const statusApi = jest.fn();
const game = {
  id: 7,
  rawgId: 123,
  title: 'Demo: Admin game',
  description: 'Admin description',
  imageUrl: '',
  genres: ['rpg'],
  tags: ['singleplayer'],
  platforms: ['PC'],
  isPublished: true,
  matchScore: 0,
};
beforeEach(() => {
  jest.resetAllMocks();
  statusApi.mockResolvedValue({ steamConfigured: true });
  api.mockImplementation((path, options) =>
    path === '/api/admin/sync/status' ? statusApi(options) : catalogApi(path, options),
  );
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => jest.restoreAllMocks());
function fillTitle(title = 'Demo: New game') {
  fireEvent.change(screen.getByLabelText('ชื่อเกม'), { target: { value: title } });
}
function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'บันทึกเกม' }));
}

test('imports Steam API games and reloads the persisted catalog', async () => {
  catalogApi
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ imported: 12 })
    .mockResolvedValueOnce([game]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  expect(screen.queryByText(/RAWG/)).not.toBeInTheDocument();
  expect(catalogApi.mock.calls.map(([path]) => path)).toEqual(['/api/admin/games']);
  fireEvent.click(screen.getByRole('button', { name: 'นำเข้าเกม Steam' }));
  expect(await screen.findByRole('status')).toHaveTextContent('นำเข้าจาก Steam 12 เกมแล้ว');
  expect(catalogApi).toHaveBeenCalledWith('/api/admin/sync/steam', { method: 'POST' });
  expect(await screen.findByText(game.title)).toBeInTheDocument();
});

test('retries a failed initial catalog request', async () => {
  catalogApi.mockRejectedValueOnce(new Error('Catalog offline')).mockResolvedValueOnce([game]);
  render(<Admin />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Catalog offline');
  fireEvent.click(screen.getByRole('button', { name: 'โหลดรายการอีกครั้ง' }));
  expect(await screen.findByText(game.title)).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('a failed catalog retry does not claim that a write succeeded', async () => {
  catalogApi
    .mockRejectedValueOnce(new Error('Catalog offline'))
    .mockRejectedValueOnce(new Error('Still offline'));
  render(<Admin />);
  await screen.findByRole('alert');
  expect(screen.getByRole('button', { name: 'นำเข้าเกม Steam' })).toBeDisabled();
  expect(screen.getByLabelText('ชื่อเกม')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'โหลดรายการอีกครั้ง' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Still offline'));
  expect(screen.getByRole('alert')).not.toHaveTextContent('ดำเนินการสำเร็จแล้ว');
  expect(catalogApi.mock.calls.every(([, options]) => !options?.method)).toBe(true);
});

test('creates a game with normalized arrays even when submitting without blur', async () => {
  catalogApi
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ id: 8 })
    .mockResolvedValueOnce([game]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  fillTitle('  Demo: New game  ');
  fireEvent.change(screen.getByLabelText('Genres เช่น rpg, action'), {
    target: { value: ' rpg, action, ' },
  });
  fireEvent.change(screen.getByLabelText('Tags เช่น singleplayer, story-rich'), {
    target: { value: ' singleplayer, story-rich, ' },
  });
  submit();
  expect(await screen.findByRole('status')).toHaveTextContent('บันทึกข้อมูลแล้ว');
  expect(catalogApi).toHaveBeenCalledWith('/api/admin/games', {
    method: 'POST',
    body: {
      title: 'Demo: New game',
      description: '',
      imageUrl: '',
      genres: ['rpg', 'action'],
      tags: ['singleplayer', 'story-rich'],
      platforms: ['PC'],
      isPublished: true,
    },
  });
  expect(screen.getByLabelText('ชื่อเกม')).toHaveValue('');
});

test('updates a game and its publication flag without sending response-only fields', async () => {
  catalogApi
    .mockResolvedValueOnce([game])
    .mockResolvedValueOnce({ id: 7 })
    .mockResolvedValueOnce([{ ...game, isPublished: false }]);
  render(<Admin />);
  await screen.findByText(game.title);
  fireEvent.click(screen.getByRole('button', { name: 'แก้ไข' }));
  expect(screen.getByLabelText('คำอธิบาย')).toHaveValue('Admin description');
  fireEvent.click(screen.getByRole('checkbox', { name: 'เผยแพร่' }));
  submit();
  expect(await screen.findByText('ซ่อน')).toBeInTheDocument();
  expect(catalogApi).toHaveBeenCalledWith('/api/admin/games/7', {
    method: 'PUT',
    body: {
      title: game.title,
      description: game.description,
      imageUrl: '',
      genres: ['rpg'],
      tags: ['singleplayer'],
      platforms: ['PC'],
      isPublished: false,
    },
  });
});

test('keeps the editing form after a failed write', async () => {
  catalogApi.mockResolvedValueOnce([game]).mockRejectedValueOnce(new Error('Write failed'));
  render(<Admin />);
  await screen.findByText(game.title);
  fillTitle();
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('Write failed');
  expect(screen.getByLabelText('ชื่อเกม')).toHaveValue('Demo: New game');
  expect(screen.getByRole('button', { name: 'บันทึกเกม' })).toBeEnabled();
});

test('retries only the catalog after a successful save followed by reload failure', async () => {
  catalogApi
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ id: 8 })
    .mockRejectedValueOnce(new Error('Read failed'))
    .mockResolvedValueOnce([game]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  fillTitle();
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'ดำเนินการสำเร็จแล้ว แต่โหลดรายการล่าสุดไม่ได้',
  );
  fireEvent.click(screen.getByRole('button', { name: 'โหลดรายการอีกครั้ง' }));
  expect(await screen.findByText(game.title)).toBeInTheDocument();
  expect(catalogApi.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
});

test('cancels deletion or deletes the selected record after confirmation', async () => {
  catalogApi
    .mockResolvedValueOnce([game])
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce([]);
  render(<Admin />);
  await screen.findByText(game.title);
  window.confirm.mockReturnValueOnce(false);
  fireEvent.click(screen.getByRole('button', { name: 'ลบ' }));
  expect(catalogApi).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'ลบ' }));
  expect(await screen.findByRole('status')).toHaveTextContent('ลบเกมแล้ว');
  await waitFor(() => expect(screen.queryByText(game.title)).not.toBeInTheDocument());
  expect(catalogApi).toHaveBeenCalledWith('/api/admin/games/7', { method: 'DELETE' });
});

test('keeps the current catalog visible when Steam sync fails', async () => {
  catalogApi.mockResolvedValueOnce([game]).mockRejectedValueOnce(new Error('Steam unavailable'));
  render(<Admin />);
  await screen.findByText(game.title);
  fireEvent.click(screen.getByRole('button', { name: 'นำเข้าเกม Steam' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Steam unavailable');
  expect(screen.getByText(game.title)).toBeInTheDocument();
  expect(catalogApi).toHaveBeenLastCalledWith('/api/admin/sync/steam', { method: 'POST' });
});

test('shows the actual imported count after a successful sync', async () => {
  catalogApi
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ imported: 3 })
    .mockResolvedValueOnce([game]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  fireEvent.click(screen.getByRole('button', { name: 'นำเข้าเกม Steam' }));
  expect(await screen.findByRole('status')).toHaveTextContent('นำเข้าจาก Steam 3 เกมแล้ว');
  expect(await screen.findByText(game.title)).toBeInTheDocument();
});

test('rejects insecure images and Thai titles exceeding the backend byte limit', async () => {
  catalogApi.mockResolvedValueOnce([]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  fillTitle('ก'.repeat(84));
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('250 ไบต์');
  fillTitle();
  fireEvent.change(screen.getByLabelText('รูป HTTPS URL'), {
    target: { value: 'http://example.com/game.jpg' },
  });
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('HTTPS URL');
  expect(catalogApi).toHaveBeenCalledTimes(1);
});

test('requires configured Steam key for imports but still allows catalog editing', async () => {
  catalogApi.mockResolvedValue([]);
  statusApi.mockResolvedValueOnce({ steamConfigured: false });
  render(<Admin />);
  await screen.findByText('ยังไม่ได้ตั้งค่า STEAM_API_KEY บน Backend');
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  expect(screen.getByRole('button', { name: 'นำเข้าเกม Steam' })).toBeDisabled();
  expect(screen.getByLabelText('ชื่อเกม')).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'ตรวจสอบสถานะ Steam อีกครั้ง' }));
  await screen.findByText(/ตั้งค่า Steam API key แล้ว/);
  expect(screen.getByRole('button', { name: 'นำเข้าเกม Steam' })).toBeEnabled();
});

test('continues after the committed batch cursor, and reload retry never repeats an import', async () => {
  catalogApi
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce({ imported: 2, nextAppId: 502, hasMore: true })
    .mockRejectedValueOnce(new Error('Read failed'))
    .mockResolvedValueOnce([game])
    .mockResolvedValueOnce({ imported: 0, nextAppId: 514, hasMore: false })
    .mockResolvedValueOnce([game]);
  render(<Admin />);
  await screen.findByText('ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน');
  fireEvent.click(screen.getByRole('button', { name: 'นำเข้าเกม Steam' }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: 'โหลดรายการอีกครั้ง' }));
  await screen.findByText(game.title);
  expect(catalogApi.mock.calls.filter(([, options]) => options?.method === 'POST')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'นำเข้าชุดถัดไป' }));
  expect(await screen.findByRole('status')).toHaveTextContent('นำเข้าจาก Steam 0 เกมแล้ว');
  expect(catalogApi).toHaveBeenCalledWith('/api/admin/sync/steam?after=502', { method: 'POST' });
  expect(screen.queryByRole('button', { name: 'นำเข้าชุดถัดไป' })).not.toBeInTheDocument();
});

test('status failures do not block editing and can be retried', async () => {
  catalogApi.mockResolvedValue([game]);
  statusApi.mockRejectedValueOnce(new Error('Status offline'));
  render(<Admin />);
  await screen.findByText(/ตรวจสอบสถานะ Steam ไม่สำเร็จ: Status offline/);
  await screen.findByText(game.title);
  expect(screen.getByLabelText('ชื่อเกม')).toBeEnabled();
  expect(screen.getByRole('button', { name: 'นำเข้าเกม Steam' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'ตรวจสอบสถานะ Steam อีกครั้ง' }));
  await screen.findByText(/ตั้งค่า Steam API key แล้ว/);
  expect(screen.getByRole('button', { name: 'นำเข้าเกม Steam' })).toBeEnabled();
});
