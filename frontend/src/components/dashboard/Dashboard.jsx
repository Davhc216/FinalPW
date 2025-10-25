
import { useLocation } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();
  const user = location.state?.userData || { primerNombre: 'Usuario', primerApellido: '', correo: 'usuario@ejemplo.com' };
  const saldo = 2450000;
  const transacciones = [
    { id: 1, concepto: 'Transferencia recibida', monto: 500000, fecha: '2025-10-20', desde: 'Juan Pérez' }
  ];
  const formatCurrency = a => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(a);
  return (
    <main className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Hola, {user.primerNombre}</h1>
          <p className="dashboard__subtitle">Gestiona tus finanzas de forma simple y segura</p>
        </div>
        <div className="dashboard__grid">
          <section className="card card--saldo">
            <div className="card__header">
              <h2 className="card__title">Saldo disponible</h2>
              <span className="card__badge">Cuenta ahorros</span>
            </div>
            <div className="saldo__amount">{formatCurrency(saldo)}</div>
          </section>
          <section className="card card--perfil">
            <h2 className="card__title">Mi perfil</h2>
            <div className="perfil__info">
              <div><span className="perfil__label">Nombre completo</span><span className="perfil__value">{user.primerNombre} {user.segundoNombre || ''} {user.primerApellido} {user.segundoApellido || ''}</span></div>
              <div><span className="perfil__label">Correo electrónico</span><span className="perfil__value">{user.correo}</span></div>
              <div><span className="perfil__label">Celular</span><span className="perfil__value">{user.celular || 'No registrado'}</span></div>
              <div><span className="perfil__label">Tipo de cuenta</span><span className="perfil__value">Ahorros</span></div>
            </div>
            <button className="btn--link">Editar perfil →</button>
          </section>
          <section className="card card--transacciones">
            <div className="card__header">
              <h2 className="card__title">Transacciones recientes</h2>
              <button className="btn btn--link">Ver todas →</button>
            </div>
            <div className="transacciones__list">
              {transacciones.map(tx => (
                <div key={tx.id} className="transaccion__item">
                  <div>
                    <p className="transaccion__concepto">{tx.concepto}</p>
                    <p className="transaccion__desde">{tx.desde}</p>
                  </div>
                  <div className="transaccion__right">
                    <p className="transaccion__monto">{formatCurrency(tx.monto)}</p>
                    <p className="transaccion__fecha">{tx.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
