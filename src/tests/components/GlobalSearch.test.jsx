import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import GlobalSearch from '../../components/GlobalSearch';
import { api } from '../../api/backend';
jest.mock('../../api/backend',()=>({api:jest.fn()}));
function Location(){const l=useLocation();return <span data-testid="url">{l.pathname}</span>;}
test('Ctrl K loads the catalog once and keyboard selection opens the readable URL',async()=>{
 api.mockResolvedValue([{id:46,title:'Counter-Strike 2'},{id:47,title:'Counter-Strike Source'}]);
 render(<MemoryRouter><GlobalSearch/><Location/></MemoryRouter>);
 expect(api).not.toHaveBeenCalled();
 fireEvent.keyDown(window,{key:'k',ctrlKey:true});
 const input=screen.getByRole('combobox',{name:'ค้นหาเกมด่วน'});
 fireEvent.change(input,{target:{value:'Counter'}});
 await screen.findByRole('option',{name:'Counter-Strike 2'});
 fireEvent.keyDown(input,{key:'ArrowDown'});
 fireEvent.submit(input.closest('form'));
 expect(screen.getByTestId('url')).toHaveTextContent('/games/47-counter-strike-source');
 expect(api).toHaveBeenCalledTimes(1);
});
