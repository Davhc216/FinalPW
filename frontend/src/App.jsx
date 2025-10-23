import { BrowserRouter , Routes, Route} from 'react-router';
import './App.css'

// Components
import Box from './components/box/Box';
import Menu from './components/menu/Menu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<Box />} />
        <Route path='/menu' element = {<Menu />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App