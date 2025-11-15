import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/piggie_logo.png';

function Header(){
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuario_id');
    const nombre = localStorage.getItem('usuario_nombre');
    setIsLoggedIn(!!usuarioId);
    setUserName(nombre || '');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('usuario_nombre');
    localStorage.removeItem('usuario_email');
    localStorage.removeItem('usuario_saldo');
    setIsLoggedIn(false);
    navigate('/');
  };
  
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__content">
          <Link to="/" className="brand">
            <img src={logo} className="header__logo" alt="Logo Piggie" />
            <span className="header__name">Piggie</span>
          </Link>
          
          <nav className="header__nav">
            {isLoggedIn ? (
              <>
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
                <span className="nav__user" style={{ padding: '8px 16px', color: '#718096', fontSize: '14px' }}>
                  {userName?.split(' ')[0] || 'Usuario'}
                </span>
                <button 
                  onClick={handleLogout}
                  className="nav__link nav__link--logout"
                  style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav__link ${location.pathname === '/login' ? 'nav__link--active' : ''}`}
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro" 
                  className={`nav__link ${location.pathname === '/registro' ? 'nav__link--active' : ''}`}
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
