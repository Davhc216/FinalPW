import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Transacciones.css';

function Transacciones() {
  const location = useLocation();
  const navigate = useNavigate();
  const actionFromState = location.state?.action || 'transferir';

  const [tipoTransaccion, setTipoTransaccion] = useState(actionFromState);
  const [formData, setFormData] = useState({
    // Transferir
    cuentaDestino: '',
    nombreDestino: '',
    banco: '',
    // Común
    monto: '',
    descripcion: '',
    // Retirar
    cajero: '',
    // Depositar
    origen: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.monto || formData.monto <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    console.log('Transacción:', { tipo: tipoTransaccion, ...formData });
    alert(`Transacción de ${tipoTransaccion} por $${formData.monto} procesada (demo)`);
    
    // Resetear formulario
    setFormData({
      cuentaDestino: '',
      nombreDestino: '',
      banco: '',
      monto: '',
      descripcion: '',
      cajero: '',
      origen: ''
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, monto: value }));
  };

  return (
    <main className="transacciones">
      <div className="transacciones__container">
        {/* Encabezado */}
        <div className="transacciones__header">
          <div>
            <h1 className="transacciones__title">Transacciones</h1>
            <p className="transacciones__subtitle">
              Gestiona tu dinero de forma rápida y segura
            </p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al inicio
          </button>
        </div>

        {/* Selector de tipo de transacción */}
        <div className="tipo-selector">
          <button
            className={`tipo-btn ${tipoTransaccion === 'transferir' ? 'tipo-btn--active' : ''}`}
            onClick={() => setTipoTransaccion('transferir')}
          >
            <span className="tipo-icon">💸</span>
            <span className="tipo-text">Transferir</span>
          </button>
          <button
            className={`tipo-btn ${tipoTransaccion === 'depositar' ? 'tipo-btn--active' : ''}`}
            onClick={() => setTipoTransaccion('depositar')}
          >
            <span className="tipo-icon">💰</span>
            <span className="tipo-text">Depositar</span>
          </button>
          <button
            className={`tipo-btn ${tipoTransaccion === 'retirar' ? 'tipo-btn--active' : ''}`}
            onClick={() => setTipoTransaccion('retirar')}
          >
            <span className="tipo-icon">🏧</span>
            <span className="tipo-text">Retirar</span>
          </button>
        </div>

        {/* Formulario */}
        <div className="transacciones__content">
          <form className="transaccion-form" onSubmit={handleSubmit}>
            <h2 className="form-title">
              {tipoTransaccion === 'transferir' && 'Transferir dinero'}
              {tipoTransaccion === 'depositar' && 'Depositar dinero'}
              {tipoTransaccion === 'retirar' && 'Retirar dinero'}
            </h2>

            {/* Campos específicos para transferir */}
            {tipoTransaccion === 'transferir' && (
              <>
                <div className="form-group">
                  <label htmlFor="cuentaDestino" className="form-label">
                    Número de cuenta destino *
                  </label>
                  <input
                    type="text"
                    id="cuentaDestino"
                    name="cuentaDestino"
                    className="form-input"
                    value={formData.cuentaDestino}
                    onChange={handleChange}
                    placeholder="1234567890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombreDestino" className="form-label">
                    Nombre del beneficiario *
                  </label>
                  <input
                    type="text"
                    id="nombreDestino"
                    name="nombreDestino"
                    className="form-input"
                    value={formData.nombreDestino}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="banco" className="form-label">
                    Banco destino *
                  </label>
                  <select
                    id="banco"
                    name="banco"
                    className="form-input"
                    value={formData.banco}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un banco</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bbva">BBVA</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </>
            )}

            {/* Campos específicos para depositar */}
            {tipoTransaccion === 'depositar' && (
              <div className="form-group">
                <label htmlFor="origen" className="form-label">
                  Origen del depósito *
                </label>
                <select
                  id="origen"
                  name="origen"
                  className="form-input"
                  value={formData.origen}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona el origen</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                  <option value="transferencia">Transferencia de otra cuenta</option>
                  <option value="nomina">Nómina</option>
                </select>
              </div>
            )}

            {/* Campos específicos para retirar */}
            {tipoTransaccion === 'retirar' && (
              <div className="form-group">
                <label htmlFor="cajero" className="form-label">
                  Ubicación del cajero (opcional)
                </label>
                <input
                  type="text"
                  id="cajero"
                  name="cajero"
                  className="form-input"
                  value={formData.cajero}
                  onChange={handleChange}
                  placeholder="Ej: Centro comercial Santa Fe"
                />
              </div>
            )}

            {/* Campos comunes */}
            <div className="form-group">
              <label htmlFor="monto" className="form-label">
                Monto *
              </label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input
                  type="text"
                  id="monto"
                  name="monto"
                  className="form-input form-input--with-prefix"
                  value={formatCurrency(formData.monto)}
                  onChange={handleMontoChange}
                  placeholder="0"
                  required
                />
              </div>
              <span className="form-hint">Ingresa el monto en pesos colombianos</span>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                className="form-textarea"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Agrega una nota sobre esta transacción"
                rows="3"
              />
            </div>

            {/* Resumen */}
            {formData.monto && (
              <div className="resumen">
                <h3 className="resumen__title">Resumen</h3>
                <div className="resumen__item">
                  <span>Monto:</span>
                  <span className="resumen__value">
                    ${formatCurrency(formData.monto)} COP
                  </span>
                </div>
                <div className="resumen__item">
                  <span>Comisión:</span>
                  <span className="resumen__value resumen__value--free">$0 COP</span>
                </div>
                <div className="resumen__item resumen__item--total">
                  <span>Total:</span>
                  <span className="resumen__value">
                    ${formatCurrency(formData.monto)} COP
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {tipoTransaccion === 'transferir' && 'Transferir ahora'}
              {tipoTransaccion === 'depositar' && 'Confirmar depósito'}
              {tipoTransaccion === 'retirar' && 'Confirmar retiro'}
            </button>
          </form>

          {/* Información adicional */}
          <aside className="info-panel">
            <h3 className="info-title">💡 Información importante</h3>
            <ul className="info-list">
              <li>
                <strong>Sin comisiones:</strong> Todas las transacciones son 100% gratuitas
              </li>
              <li>
                <strong>Rápido:</strong> Las transferencias se procesan al instante
              </li>
              <li>
                <strong>Seguro:</strong> Tus datos están protegidos con encriptación bancaria
              </li>
              <li>
                <strong>24/7:</strong> Realiza transacciones en cualquier momento
              </li>
            </ul>

            {tipoTransaccion === 'transferir' && (
              <div className="info-extra">
                <p className="info-extra__text">
                  Las transferencias a cuentas de otros bancos pueden tardar hasta 24 horas en procesarse.
                </p>
              </div>
            )}

            {tipoTransaccion === 'retirar' && (
              <div className="info-extra">
                <p className="info-extra__text">
                  Puedes retirar hasta $1,000,000 por día en cajeros automáticos.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Transacciones;
