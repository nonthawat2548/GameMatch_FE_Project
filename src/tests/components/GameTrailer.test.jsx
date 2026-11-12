import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GameTrailer from '../../components/GameTrailer';
import { api } from '../../api/backend';

jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const game = { id: 99, steamId: 4262460, title: 'ROB RUN', imageUrl: 'https://example.com/poster.jpg' };
const list = [
  { id: 1, title: 'Gameplay', sources: ['https://video.fastly.steamstatic.com/store_trailers/game.mp4','https://video.fastly.steamstatic.com/store_trailers/game.webm'], preview: true },
  { id: 2, title: 'Launch', sources: ['https://video.fastly.steamstatic.com/store_trailers/launch.mp4'], preview: false },
];
beforeEach(() => jest.resetAllMocks());
function page(item = game) {
  return render(<GameTrailer game={item}><img src={item.imageUrl} alt={item.title}/></GameTrailer>);
}
test('loads real metadata for any Steam game and switches between native clips', async () => {
  api.mockResolvedValue(list);
  const { container } = page({...game, steamId: 123456});
  expect(screen.getByRole('img')).toBeInTheDocument();
  await screen.findByText('คลิปตัวอย่างสั้น');
  const video = container.querySelector('video');
  expect(video).toHaveAttribute('src',list[0].sources[0]);
  expect(video.controls).toBe(true);
  expect(video.muted).toBe(true);
  expect(video.loop).toBe(false);
  expect(video).toHaveAttribute('playsinline');
  expect(api).toHaveBeenCalledWith('/api/games/99/trailers',expect.objectContaining({signal:expect.anything()}));
  fireEvent.click(screen.getByRole('button',{name:'Launch'}));
  expect(container.querySelector('video')).toHaveAttribute('src',list[1].sources[0]);
});
test('tries another native format and restores the poster when every source fails', async () => {
  api.mockResolvedValue(list);
  const {container}=page();
  await screen.findByText('คลิปตัวอย่างสั้น');
  fireEvent.error(container.querySelector('video'));
  expect(container.querySelector('video')).toHaveAttribute('src',list[0].sources[1]);
  fireEvent.error(container.querySelector('video'));
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByRole('link',{name:/ดู Trailer เต็มบน Steam/})).toHaveAttribute('href','https://store.steampowered.com/app/4262460/');
});
test('non-Steam games keep their cover and never fetch the endpoint', () => {
  page({...game,steamId:null,rawgId:5});
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
});
test('shows retry for an upstream error without removing the rest of the detail', async () => {
  api.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(list);
  page({...game,steamId:987654});
  await screen.findByText('โหลดคลิปจาก Steam ไม่สำเร็จ');
  fireEvent.click(screen.getByRole('button',{name:'โหลดคลิปใหม่'}));
  await screen.findByText('คลิปตัวอย่างสั้น');
  await waitFor(()=>expect(api).toHaveBeenCalledTimes(2));
});
