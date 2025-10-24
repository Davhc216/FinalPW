import { BrowserRouter , Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

// Components
import Inicio from './components/inicio/Inicio';
import Box from './components/box/Box';
import Menu from './components/menu/Menu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home muestra Inicio */}
        <Route path='/' element={<Inicio />} />
        {/* Alias antiguo redirige a home */}
        <Route path='/inicio' element={<Navigate to="/" replace />} />
        <Route path='/menu' element = {<Menu />} />
        {/* Ruta opcional para Box si la quieres ver */}
        <Route path='/box' element={<Box />} />
        {/* Catch-all */}
        <Route path='*' element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App