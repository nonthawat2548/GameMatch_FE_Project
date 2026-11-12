import { render, screen, fireEvent } from '@testing-library/react';
import SteamRating from '../../components/SteamRating';
import { api } from '../../api/backend';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
const game = {id: 7, steamId: 730, title:'CS2'};
const summary = {positive: 8700, negative: 1300, total: 10000, positivePercent: 87, score: 8, description:'Very Positive'};
beforeEach(() => jest.resetAllMocks());
test('shows the official review summary and separate positive and negative counts', async () => {
  api.mockResolvedValue(summary);
  render(<SteamRating game={game}/>);
  expect(await screen.findByText('87%')).toBeInTheDocument();
  expect(screen.getByText('แง่บวกเป็นอย่างมาก')).toBeInTheDocument();
  expect(screen.getByText(/10,000 รีวิว/)).toBeInTheDocument();
  expect(screen.getByText('แนะนำ 8,700 คน')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','87');
  expect(screen.getByRole('link',{name:/ดูรีวิวบน Steam/})).toHaveAttribute('href','https://store.steampowered.com/app/730/#app_reviews_hash');
  expect(api).toHaveBeenCalledWith('/api/games/7/steam-rating',expect.objectContaining({signal:expect.anything()}));
});
test('shows no reviews instead of inventing a zero score', async () => {
  api.mockResolvedValue({positive:0,negative:0,total:0,positivePercent:null,score:0});
  render(<SteamRating game={game}/>);
  expect(await screen.findByText('ยังไม่มีคะแนนรีวิวจาก Steam')).toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
test('a real zero percent is different from no reviews', async () => {
  api.mockResolvedValue({positive:0,negative:10,total:10,positivePercent:0,score:1,description:'Overwhelmingly Negative'});
  render(<SteamRating game={game}/>);
  expect(await screen.findByText('0%')).toBeInTheDocument();
});
test('handles upstream errors and retries without changing game detail', async () => {
  api.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(summary);
  render(<SteamRating game={game}/>);
  expect(await screen.findByText('โหลดคะแนนไม่ได้ในตอนนี้')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'โหลดคะแนนใหม่'}));
  expect(await screen.findByText('87%')).toBeInTheDocument();
});
test('manual games do not request Steam scores', () => {
  const {container}=render(<SteamRating game={{id:7,title:'Manual'}}/>);
  expect(container).toBeEmptyDOMElement();
  expect(api).not.toHaveBeenCalled();
});
