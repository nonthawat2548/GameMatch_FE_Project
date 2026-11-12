import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Compare from '../../pages/Compare';
import { api } from '../../api/backend';
jest.mock('../../api/backend', () => ({ api: jest.fn() }));
test('compares actual catalog data and prevents duplicate selection', async () => {
  api.mockResolvedValue([
    { id: 1, title: 'A', genres: ['action'], platforms: ['PC'], tags: ['pvp'] },
    { id: 2, title: 'B', genres: ['rpg'], platforms: ['PC'], tags: ['singleplayer'] },
  ]);
  render(<MemoryRouter initialEntries={['/compare?game=1']}><Compare /></MemoryRouter>);
  expect(await screen.findByLabelText('เกมที่ 1')).toHaveValue('1');
  expect(screen.getByText('เลือกอย่างน้อย 2 เกมเพื่อเริ่มเปรียบเทียบ')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('เกมที่ 2'), { target: { value: '2' } });
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/games/1');
  expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute('href', '/games/2');
  expect(screen.getAllByText('พบข้อมูลรองรับ')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'ล้างการเลือก' }));
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});
