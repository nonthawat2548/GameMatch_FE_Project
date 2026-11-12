import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';

function Location() { const location=useLocation(); return <span data-testid="location">{location.pathname}</span>; }
function page(user=null) {
  const logout=jest.fn().mockResolvedValue();
  const onToggle=jest.fn();
  render(<MemoryRouter><Navbar user={user} logout={logout} theme="dark" onToggle={onToggle}/><Location/></MemoryRouter>);
  return {logout,onToggle};
}
test('mobile menu toggles, closes on navigation and Escape, and keeps the same theme button', () => {
  const {onToggle}=page();
  const toggle=screen.getByRole('button',{name:'เปิดเมนู'});
  expect(toggle).toHaveAttribute('aria-expanded','false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded','true');
  expect(screen.getByRole('navigation',{name:'เมนูหลัก'})).toHaveClass('mobile-menu-open');
  fireEvent.click(screen.getByRole('link',{name:'เกมทั้งหมด'}));
  expect(screen.getByTestId('location')).toHaveTextContent('/discover');
  expect(toggle).toHaveAttribute('aria-expanded','false');
  fireEvent.click(toggle);
  fireEvent.keyDown(toggle,{key:'Escape'});
  expect(toggle).toHaveAttribute('aria-expanded','false');
  expect(toggle).toHaveFocus();
  fireEvent.click(screen.getByRole('button',{name:'สลับเป็นธีมสว่าง'}));
  expect(onToggle).toHaveBeenCalledTimes(1);
});
test('preserves member/admin links and closes on logout', () => {
  const {logout}=page({id:1,role:'admin',displayName:'Admin QA'});
  fireEvent.click(screen.getByRole('button',{name:'เปิดเมนู'}));
  expect(screen.getByRole('link',{name:'เกมโปรด'})).toHaveAttribute('href','/me/favorites');
  expect(screen.getByRole('link',{name:'จัดการเกม'})).toHaveAttribute('href','/admin');
  fireEvent.click(screen.getByRole('button',{name:'ออกจากระบบ'}));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button',{name:'เปิดเมนู'})).toHaveAttribute('aria-expanded','false');
});
