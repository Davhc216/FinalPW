
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transacciones.css';

const initialState = {
  cuentaDestino: '', nombreDestino: '', banco: '', monto: '', descripcion: ''
};

function Transacciones() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleMonto = e => setForm(f => ({ ...f, monto: e.target.value.replace(/\D/g, '') }));
  const formatCurrency = v => v ? new Intl.NumberFormat('es-CO').format(v.replace(/\D/g, '')) : '';
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.monto || form.monto <= 0) return alert('Por favor ingresa un monto válido');
    alert(`Transferencia por $${formatCurrency(form.monto)} procesada (demo)`);
    setForm(initialState);
  };
  return (
    <main className="transacciones">
      <div className="transacciones__container">
        <div className="transacciones__header">
          <div>
            <h1 className="transacciones__title">Transferencia</h1>
            <p className="transacciones__subtitle">Envía dinero de forma rápida y segura</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Volver al inicio</button>
        </div>
        <div className="transacciones__content">
          <form className="transaccion-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Transferir dinero</h2>
            <div className="form-group">
              <label htmlFor="cuentaDestino" className="form-label">Número de cuenta destino *</label>
              <input type="text" id="cuentaDestino" name="cuentaDestino" className="form-input" value={form.cuentaDestino} onChange={handleChange} placeholder="1234567890" required />
            </div>
            <div className="form-group">
              <label htmlFor="nombreDestino" className="form-label">Nombre del beneficiario *</label>
              <input type="text" id="nombreDestino" name="nombreDestino" className="form-input" value={form.nombreDestino} onChange={handleChange} placeholder="Juan Pérez" required />
            </div>
            <div className="form-group">
              <label htmlFor="banco" className="form-label">Banco destino *</label>
              <select id="banco" name="banco" className="form-input" value={form.banco} onChange={handleChange} required>
                <option value="">Selecciona un banco</option>
                <option value="bancolombia">Bancolombia</option>
                <option value="davivienda">Davivienda</option>
                <option value="bbva">BBVA</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="monto" className="form-label">Monto *</label>
              <div className="input-wrapper">
                <span className="input-prefix">$</span>
                <input type="text" id="monto" name="monto" className="form-input form-input--with-prefix" value={formatCurrency(form.monto)} onChange={handleMonto} placeholder="0" required />
              </div>
              <span className="form-hint">Ingresa el monto en pesos colombianos</span>
            </div>
            <div className="form-group">
              <label htmlFor="descripcion" className="form-label">Descripción (opcional)</label>
              <textarea id="descripcion" name="descripcion" className="form-textarea" value={form.descripcion} onChange={handleChange} placeholder="Agrega una nota sobre esta transacción" rows="3" />
            </div>
            {form.monto && <div className="resumen">
              <h3 className="resumen__title">Resumen</h3>
              <div className="resumen__item"><span>Monto:</span><span className="resumen__value">${formatCurrency(form.monto)} COP</span></div>
              <div className="resumen__item"><span>Comisión:</span><span className="resumen__value resumen__value--free">$0 COP</span></div>
              <div className="resumen__item resumen__item--total"><span>Total:</span><span className="resumen__value">${formatCurrency(form.monto)} COP</span></div>
            </div>}
            <button type="submit" className="submit-btn">Transferir ahora</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Transacciones;
