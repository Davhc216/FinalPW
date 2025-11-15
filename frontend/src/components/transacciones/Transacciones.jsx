import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTransferencia, getUsers } from '../../services/api';
import './Transacciones.css';

const initialState = {
  usuario_destino_id: '',
  monto: '',
  descripcion: ''
};

function Transacciones() {
  const navigate = useNavigate();
  const usuarioId = parseInt(localStorage.getItem('usuario_id') || '0');

  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [showUsuarios, setShowUsuarios] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleMonto = e => {
    const value = e.target.value.replace(/\D/g, '');
    setForm(f => ({ ...f, monto: value }));
  };

  const formatCurrency = v => v ? new Intl.NumberFormat('es-CO').format(v.replace(/\D/g, '')) : '';

  const loadUsuarios = async () => {
    try {
      const response = await getUsers();
      // Filtrar el usuario actual
      const otrosUsuarios = response.users.filter(u => u.id !== usuarioId);
      setUsuarios(otrosUsuarios);
      setShowUsuarios(true);
    } catch (err) {
      setError('Error al cargar usuarios');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!usuarioId) {
      setError('Debes iniciar sesión para realizar transferencias');
      navigate('/login');
      return;
    }

    if (!form.usuario_destino_id || !form.monto || parseFloat(form.monto) <= 0) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    if (parseInt(form.usuario_destino_id) === usuarioId) {
      setError('No puedes transferir a ti mismo');
      return;
    }

    setLoading(true);
    try {
      await createTransferencia(
        usuarioId,
        parseInt(form.usuario_destino_id),
        parseFloat(form.monto),
        form.descripcion || 'Transferencia'
      );
      
      alert(`Transferencia por $${formatCurrency(form.monto)} realizada exitosamente`);
      setForm(initialState);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="transacciones">
      <div className="transacciones__container">
        <div className="transacciones__header">
          <div>
            <h1 className="transacciones__title">Transferencia</h1>
            <p className="transacciones__subtitle">Envía dinero de forma rápida y segura</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')} disabled={loading}>
            ← Volver al inicio
          </button>
        </div>
        <div className="transacciones__content">
          <form className="transaccion-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Transferir dinero</h2>
            
            {error && (
              <div className="alert alert--error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="usuario_destino_id" className="form-label">
                ID del usuario destino *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  id="usuario_destino_id"
                  name="usuario_destino_id"
                  className="form-input"
                  value={form.usuario_destino_id}
                  onChange={handleChange}
                  placeholder="Ingresa el ID del usuario"
                  required
                  disabled={loading}
                  min="1"
                />
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={loadUsuarios}
                  disabled={loading}
                >
                  Ver usuarios
                </button>
              </div>
              {showUsuarios && usuarios.length > 0 && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f7fafc', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem', color: '#718096' }}>Usuarios disponibles:</p>
                  {usuarios.map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setForm(f => ({ ...f, usuario_destino_id: u.id.toString() }));
                        setShowUsuarios(false);
                      }}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        marginBottom: '0.25rem',
                        background: form.usuario_destino_id === u.id.toString() ? '#e6fffa' : 'transparent'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#edf2f7'}
                      onMouseLeave={(e) => e.target.style.background = form.usuario_destino_id === u.id.toString() ? '#e6fffa' : 'transparent'}
                    >
                      <strong>ID: {u.id}</strong> - {u.nombre} ({u.email})
                    </div>
                  ))}
                </div>
              )}
              <span className="form-hint">Ingresa el ID numérico del usuario al que deseas transferir</span>
            </div>

            <div className="form-group">
              <label htmlFor="monto" className="form-label">Monto *</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  id="monto"
                  name="monto"
                  className="form-input form-input--with-prefix"
                  value={formatCurrency(form.monto)}
                  onChange={handleMonto}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>
              <span className="form-hint">Ingresa el monto en pesos colombianos</span>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">Descripción (opcional)</label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-textarea"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Agrega una nota sobre esta transacción"
                rows="3"
                disabled={loading}
              />
            </div>

            {form.monto && (
              <div className="resumen">
                <h3 className="resumen__title">Resumen</h3>
                <div className="resumen__item">
                  <span>Monto:</span>
                  <span className="resumen__value">${formatCurrency(form.monto)} COP</span>
                </div>
                <div className="resumen__item">
                  <span>Comisión:</span>
                  <span className="resumen__value resumen__value--free">$0 COP</span>
                </div>
                <div className="resumen__item resumen__item--total">
                  <span>Total:</span>
                  <span className="resumen__value">${formatCurrency(form.monto)} COP</span>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Procesando...' : 'Transferir ahora'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Transacciones;
