import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData || {
    primerNombre: 'Usuario',
    primerApellido: '',
    correo: 'usuario@ejemplo.com'
  };

  // Datos simulados
  const [saldo] = useState(2450000);
  const [transacciones] = useState([
    { id: 1, tipo: 'ingreso', concepto: 'Transferencia recibida', monto: 500000, fecha: '2025-10-20', desde: 'Juan Pérez' },
    { id: 2, tipo: 'egreso', concepto: 'Pago servicios', monto: -120000, fecha: '2025-10-19', desde: 'EPM' },
    { id: 3, tipo: 'egreso', concepto: 'Retiro cajero', monto: -200000, fecha: '2025-10-18', desde: 'ATM Banco' },
    { id: 4, tipo: 'ingreso', concepto: 'Depósito', monto: 1000000, fecha: '2025-10-15', desde: 'Nómina empresa' },
    { id: 5, tipo: 'egreso', concepto: 'Transferencia enviada', monto: -80000, fecha: '2025-10-14', desde: 'María González' }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="dashboard">
      <div className="dashboard__container">
        {/* Encabezado */}
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">
              Hola, {userData.primerNombre} 👋
            </h1>
            <p className="dashboard__subtitle">
              Gestiona tus finanzas de forma simple y segura
            </p>
          </div>
        </div>

        {/* Grid principal */}
        <div className="dashboard__grid">
          {/* Tarjeta de saldo */}
          <section className="card card--saldo">
            <div className="card__header">
              <h2 className="card__title">Saldo disponible</h2>
              <span className="card__badge">Cuenta ahorros</span>
            </div>
            <div className="saldo__amount">
              {formatCurrency(saldo)}
            </div>
            <div className="saldo__actions">
              <button 
                className="btn btn--primary"
                onClick={() => navigate('/transacciones')}
              >
                Realizar transacción
              </button>
              <button 
                className="btn btn--secondary"
                onClick={() => navigate('/prestamos')}
              >
                Solicitar préstamo
              </button>
            </div>
          </section>

          {/* Tarjeta de perfil */}
          <section className="card card--perfil">
            <h2 className="card__title">Mi perfil</h2>
            <div className="perfil__info">
              <div className="perfil__item">
                <span className="perfil__label">Nombre completo</span>
                <span className="perfil__value">
                  {userData.primerNombre} {userData.segundoNombre || ''} {userData.primerApellido} {userData.segundoApellido || ''}
                </span>
              </div>
              <div className="perfil__item">
                <span className="perfil__label">Correo electrónico</span>
                <span className="perfil__value">{userData.correo}</span>
              </div>
              <div className="perfil__item">
                <span className="perfil__label">Celular</span>
                <span className="perfil__value">{userData.celular || 'No registrado'}</span>
              </div>
              <div className="perfil__item">
                <span className="perfil__label">Tipo de cuenta</span>
                <span className="perfil__value">Ahorros</span>
              </div>
            </div>
            <button className="btn btn--link">Editar perfil →</button>
          </section>

          {/* Tarjeta de transacciones recientes */}
          <section className="card card--transacciones">
            <div className="card__header">
              <h2 className="card__title">Transacciones recientes</h2>
              <button className="btn btn--link">Ver todas →</button>
            </div>
            <div className="transacciones__list">
              {transacciones.map(tx => (
                <div key={tx.id} className="transaccion__item">
                  <div className="transaccion__icon-wrapper">
                    <span className={`transaccion__icon transaccion__icon--${tx.tipo}`}>
                      {tx.tipo === 'ingreso' ? '↓' : '↑'}
                    </span>
                  </div>
                  <div className="transaccion__info">
                    <p className="transaccion__concepto">{tx.concepto}</p>
                    <p className="transaccion__desde">{tx.desde}</p>
                  </div>
                  <div className="transaccion__right">
                    <p className={`transaccion__monto transaccion__monto--${tx.tipo}`}>
                      {formatCurrency(tx.monto)}
                    </p>
                    <p className="transaccion__fecha">{tx.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tarjeta de acciones rápidas */}
          <section className="card card--acciones">
            <h2 className="card__title">Acciones rápidas</h2>
            <div className="acciones__grid">
              <button 
                className="accion__btn"
                onClick={() => navigate('/transacciones', { state: { action: 'transferir' } })}
              >
                <span className="accion__icon">💸</span>
                <span className="accion__text">Transferir</span>
              </button>
              <button 
                className="accion__btn"
                onClick={() => navigate('/transacciones', { state: { action: 'depositar' } })}
              >
                <span className="accion__icon">💰</span>
                <span className="accion__text">Depositar</span>
              </button>
              <button 
                className="accion__btn"
                onClick={() => navigate('/transacciones', { state: { action: 'retirar' } })}
              >
                <span className="accion__icon">🏧</span>
                <span className="accion__text">Retirar</span>
              </button>
              <button 
                className="accion__btn"
                onClick={() => navigate('/prestamos')}
              >
                <span className="accion__icon">📋</span>
                <span className="accion__text">Préstamo</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
