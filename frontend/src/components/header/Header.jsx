import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/piggie_logo.png';

function Header(){
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__content">
          <Link to="/" className="brand">
            <img src={logo} className="header__logo" alt="Logo Piggie" />
            <span className="header__name">Piggie</span>
          </Link>
          
          <nav className="header__nav">
            <Link 
              to="/dashboard" 
              className={`nav__link ${location.pathname === '/dashboard' ? 'nav__link--active' : ''}`}
            >
              Mi cuenta
            </Link>
            <Link 
              to="/transacciones" 
              className={`nav__link ${location.pathname === '/transacciones' ? 'nav__link--active' : ''}`}
            >
              Transacciones
            </Link>
            <Link 
              to="/prestamos" 
              className={`nav__link ${location.pathname === '/prestamos' ? 'nav__link--active' : ''}`}
            >
              Préstamos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
