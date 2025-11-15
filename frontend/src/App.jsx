import { BrowserRouter , Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

// Components
import Inicio from './components/inicio/Inicio';
import Header from './components/header/Header';
import Registro from './components/registro/Registro';
import Login from './components/login/Login';
import Dashboard from './components/dashboard/Dashboard';
import Transacciones from './components/transacciones/Transacciones';
import Prestamos from './components/prestamos/Prestamos';
import Box from './components/box/Box';
import Menu from './components/menu/Menu';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* Home muestra Inicio */}
        <Route path='/' element={<Inicio />} />
        {/* Alias antiguo redirige a home */}
        <Route path='/inicio' element={<Navigate to="/" replace />} />
        {/* Registro */}
        <Route path='/registro' element={<Registro />} />
        {/* Login */}
        <Route path='/login' element={<Login />} />
        {/* Dashboard - Gestión de cuentas */}
        <Route path='/dashboard' element={<Dashboard />} />
        {/* Transacciones */}
        <Route path='/transacciones' element={<Transacciones />} />
        {/* Préstamos */}
        <Route path='/prestamos' element={<Prestamos />} />
        {/* Menu */}
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