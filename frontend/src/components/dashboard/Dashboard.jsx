import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserById, getTransacciones, createDeposito, createRetiro } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeposito, setShowDeposito] = useState(false);
  const [showRetiro, setShowRetiro] = useState(false);
  const [montoOperacion, setMontoOperacion] = useState('');
  const [descripcionOperacion, setDescripcionOperacion] = useState('');
  const [loadingOperacion, setLoadingOperacion] = useState(false);

  const usuarioId = localStorage.getItem('usuario_id');

  useEffect(() => {
    if (!usuarioId) {
      navigate('/login');
      return;
    }
    loadData();
  }, [usuarioId, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, transaccionesData] = await Promise.all([
        getUserById(usuarioId),
        getTransacciones(usuarioId)
      ]);
      
      setUser(userData.user);
      setTransacciones(transaccionesData.transacciones || []);
      
      // Actualizar localStorage con saldo actualizado
      if (userData.user.saldo !== undefined) {
        localStorage.setItem('usuario_saldo', userData.user.saldo.toString());
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposito = async (e) => {
    e.preventDefault();
    if (!montoOperacion || parseFloat(montoOperacion) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoadingOperacion(true);
    try {
      await createDeposito(parseInt(usuarioId), parseFloat(montoOperacion), descripcionOperacion || 'Depósito');
      alert('Depósito realizado exitosamente');
      setShowDeposito(false);
      setMontoOperacion('');
      setDescripcionOperacion('');
      loadData(); // Recargar datos
    } catch (err) {
      alert(err.message || 'Error al realizar el depósito');
    } finally {
      setLoadingOperacion(false);
    }
  };

  const handleRetiro = async (e) => {
    e.preventDefault();
    if (!montoOperacion || parseFloat(montoOperacion) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoadingOperacion(true);
    try {
      await createRetiro(parseInt(usuarioId), parseFloat(montoOperacion), descripcionOperacion || 'Retiro');
      alert('Retiro realizado exitosamente');
      setShowRetiro(false);
      setMontoOperacion('');
      setDescripcionOperacion('');
      loadData(); // Recargar datos
    } catch (err) {
      alert(err.message || 'Error al realizar el retiro');
    } finally {
      setLoadingOperacion(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'deposito': 'Depósito',
      'retiro': 'Retiro',
      'transferencia': 'Transferencia'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <main className="dashboard">
        <div className="dashboard__container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <div className="dashboard__container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#c53030' }}>{error}</p>
            <button onClick={loadData} style={{ marginTop: '1rem' }}>Reintentar</button>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Hola, {user.nombre?.split(' ')[0] || 'Usuario'}</h1>
          <p className="dashboard__subtitle">Gestiona tus finanzas de forma simple y segura</p>
        </div>
        <div className="dashboard__grid">
          <section className="card card--saldo">
            <div className="card__header">
              <h2 className="card__title">Saldo disponible</h2>
              <span className="card__badge">Cuenta ahorros</span>
            </div>
            <div className="saldo__amount">{formatCurrency(user.saldo)}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                className="btn btn--small btn--primary"
                onClick={() => { setShowDeposito(true); setShowRetiro(false); }}
              >
                Depositar
              </button>
              <button 
                className="btn btn--small btn--secondary"
                onClick={() => { setShowRetiro(true); setShowDeposito(false); }}
              >
                Retirar
              </button>
            </div>
          </section>

          <section className="card card--perfil">
            <h2 className="card__title">Mi perfil</h2>
            <div className="perfil__info">
              <div>
                <span className="perfil__label">Nombre completo</span>
                <span className="perfil__value">{user.nombre || 'No disponible'}</span>
              </div>
              <div>
                <span className="perfil__label">Correo electrónico</span>
                <span className="perfil__value">{user.email || 'No disponible'}</span>
              </div>
              <div>
                <span className="perfil__label">Tipo de cuenta</span>
                <span className="perfil__value">Ahorros</span>
              </div>
            </div>
            <button className="btn--link" onClick={() => navigate('/transacciones')}>
              Hacer transferencia →
            </button>
          </section>

          <section className="card card--transacciones">
            <div className="card__header">
              <h2 className="card__title">Transacciones recientes</h2>
              <button className="btn btn--link" onClick={() => navigate('/transacciones')}>
                Ver todas →
              </button>
            </div>
            <div className="transacciones__list">
              {transacciones.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center', padding: '1rem' }}>
                  No hay transacciones aún
                </p>
              ) : (
                transacciones.slice(0, 5).map(tx => (
                  <div key={tx.id} className="transaccion__item">
                    <div>
                      <p className="transaccion__concepto">{getTipoLabel(tx.tipo)}</p>
                      <p className="transaccion__desde">
                        {tx.tipo === 'transferencia' 
                          ? tx.usuario_destino_id === parseInt(usuarioId)
                            ? `De: ${tx.usuario_nombre || 'Usuario'}`
                            : `Para: ${tx.usuario_destino_nombre || 'Usuario'}`
                          : tx.descripcion || getTipoLabel(tx.tipo)
                        }
                      </p>
                    </div>
                    <div className="transaccion__right">
                      <p className={`transaccion__monto ${tx.tipo === 'deposito' || (tx.tipo === 'transferencia' && tx.usuario_destino_id === parseInt(usuarioId)) ? 'transaccion__monto--positive' : 'transaccion__monto--negative'}`}>
                        {tx.tipo === 'deposito' || (tx.tipo === 'transferencia' && tx.usuario_destino_id === parseInt(usuarioId)) ? '+' : '-'}
                        {formatCurrency(tx.monto)}
                      </p>
                      <p className="transaccion__fecha">{formatDate(tx.created_at || tx.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Modal de Depósito */}
        {showDeposito && (
          <div className="modal-overlay" onClick={() => setShowDeposito(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Realizar Depósito</h3>
              <form onSubmit={handleDeposito}>
                <div className="form-group">
                  <label>Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={montoOperacion}
                    onChange={(e) => setMontoOperacion(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={loadingOperacion}
                  />
                </div>
                <div className="form-group">
                  <label>Descripción (opcional)</label>
                  <input
                    type="text"
                    value={descripcionOperacion}
                    onChange={(e) => setDescripcionOperacion(e.target.value)}
                    placeholder="Descripción del depósito"
                    disabled={loadingOperacion}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn--primary" disabled={loadingOperacion}>
                    {loadingOperacion ? 'Procesando...' : 'Depositar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn--secondary" 
                    onClick={() => { setShowDeposito(false); setMontoOperacion(''); setDescripcionOperacion(''); }}
                    disabled={loadingOperacion}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Retiro */}
        {showRetiro && (
          <div className="modal-overlay" onClick={() => setShowRetiro(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Realizar Retiro</h3>
              <form onSubmit={handleRetiro}>
                <div className="form-group">
                  <label>Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={user.saldo}
                    value={montoOperacion}
                    onChange={(e) => setMontoOperacion(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={loadingOperacion}
                  />
                  <small>Saldo disponible: {formatCurrency(user.saldo)}</small>
                </div>
                <div className="form-group">
                  <label>Descripción (opcional)</label>
                  <input
                    type="text"
                    value={descripcionOperacion}
                    onChange={(e) => setDescripcionOperacion(e.target.value)}
                    placeholder="Descripción del retiro"
                    disabled={loadingOperacion}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn--primary" disabled={loadingOperacion}>
                    {loadingOperacion ? 'Procesando...' : 'Retirar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn--secondary" 
                    onClick={() => { setShowRetiro(false); setMontoOperacion(''); setDescripcionOperacion(''); }}
                    disabled={loadingOperacion}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
