import { BrowserRouter , Routes, Route} from 'react-router-dom';
import './App.css'

// Components
import Box from './components/box/Box';
import Inicio from './components/inicio/Inicio';
import Menu from './components/menu/Menu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<Box />} />
        <Route path='/inicio' element = {<Inicio />} />
        <Route path='/menu' element = {<Menu />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App