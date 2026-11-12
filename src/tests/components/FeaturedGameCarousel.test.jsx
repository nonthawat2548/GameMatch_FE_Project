import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeaturedGameCarousel from '../../components/FeaturedGameCarousel';

const games = [
  { id: 46, title: 'Game A', imageUrl: 'https://example.com/a.jpg' },
  { id: 47, title: 'Game B', imageUrl: 'https://example.com/b.jpg' },
  { id: 48, title: 'Game C', imageUrl: 'https://example.com/c.jpg' },
];

function page(items = games) {
  return render(<MemoryRouter><FeaturedGameCarousel games={items} /></MemoryRouter>);
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('moves forward, backward and wraps through real games', () => {
  page();
  const link = screen.getByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' });
  expect(link).toHaveAttribute('href', '/games/46');
  fireEvent.click(screen.getByRole('button', { name: 'เกมก่อนหน้า' }));
  expect(link).toHaveAttribute('href', '/games/48');
  fireEvent.click(screen.getByRole('button', { name: 'เกมถัดไป' }));
  expect(link).toHaveAttribute('href', '/games/46');
  fireEvent.click(screen.getByRole('button', { name: 'สไลด์ 2: Game B' }));
  expect(link).toHaveAttribute('href', '/games/47');
  expect(screen.getByRole('button', { name: 'สไลด์ 2: Game B' })).toHaveAttribute('aria-pressed', 'true');
});

test('advances automatically and supports pause and resume', () => {
  page();
  const link = screen.getByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' });
  act(() => jest.advanceTimersByTime(4000));
  expect(link).toHaveAttribute('href', '/games/47');
  fireEvent.click(screen.getByRole('button', { name: 'หยุดสไลด์อัตโนมัติ' }));
  expect(screen.getByRole('region', { name: 'เกมเด่น' })).toHaveClass('is-paused');
  act(() => jest.advanceTimersByTime(8000));
  expect(link).toHaveAttribute('href', '/games/47');
  fireEvent.click(screen.getByRole('button', { name: 'เล่นสไลด์อัตโนมัติ' }));
  expect(screen.getByRole('region', { name: 'เกมเด่น' })).not.toHaveClass('is-paused');
  act(() => jest.advanceTimersByTime(4000));
  expect(link).toHaveAttribute('href', '/games/48');
});

test('keeps rotating while the mouse is over the carousel or a navigation button is focused', () => {
  page();
  const carousel = screen.getByRole('region', { name: 'เกมเด่น' });
  const link = screen.getByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' });
  fireEvent.mouseEnter(carousel);
  fireEvent.focus(screen.getByRole('button', { name: 'เกมถัดไป' }));
  act(() => jest.advanceTimersByTime(4000));
  expect(link).toHaveAttribute('href', '/games/47');
  act(() => jest.advanceTimersByTime(4000));
  expect(link).toHaveAttribute('href', '/games/48');
  act(() => jest.advanceTimersByTime(4000));
  expect(link).toHaveAttribute('href', '/games/46');
});

test('automatically advances across multiple intervals without a click', () => {
  page();
  act(() => jest.advanceTimersByTime(8000));
  expect(screen.getByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' })).toHaveAttribute('href', '/games/48');
});

test('does not show carousel controls when there is only one game', () => {
  page(games.slice(0, 1));
  expect(screen.getByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' })).toHaveAttribute('href', '/games/46');
  expect(screen.queryByRole('button', { name: 'เกมถัดไป' })).not.toBeInTheDocument();
});

test('keeps the existing placeholder when there are no images', () => {
  page([]);
  expect(screen.queryByRole('link', { name: 'เปิดรายละเอียดเกมเด่น' })).not.toBeInTheDocument();
  expect(document.querySelector('.hero-placeholder')).toBeInTheDocument();
});
