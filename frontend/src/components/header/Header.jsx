import './Header.css';
import logo from '../../assets/piggie_logo.png';

function Header(){
  return (
    <header className="header">
      <div className="header__inner">
        <div className="brand">
          <img src={logo} className="header__logo" alt="Logo Piggie" />
          <span className="header__name">Piggie</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
