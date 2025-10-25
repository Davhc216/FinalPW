
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Prestamos.css';

const initialState = { monto: '', plazo: '', proposito: '', ingresos: '', ocupacion: '', aceptaTerminos: false };

function Prestamos() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleNum = name => e => setForm(f => ({ ...f, [name]: e.target.value.replace(/\D/g, '') }));
  const formatCurrency = v => v ? new Intl.NumberFormat('es-CO').format(v.replace(/\D/g, '')) : '';
  const handleSubmit = e => {
    e.preventDefault();
    const { monto, plazo, ingresos, aceptaTerminos } = form;
    if (!monto || !plazo || !ingresos) return alert('Por favor completa todos los campos obligatorios');
    if (!aceptaTerminos) return alert('Debes aceptar los términos y condiciones');
    alert(`Solicitud de préstamo por $${formatCurrency(monto)} enviada correctamente (demo)`);
    navigate('/dashboard');
  };
  return (
    <main className="prestamos">
      <div className="prestamos__container">
        <div className="prestamos__header">
          <div>
            <h1 className="prestamos__title">Solicitud de Préstamo</h1>
            <p className="prestamos__subtitle">Completa el formulario y obtén una respuesta en minutos</p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>← Volver al inicio</button>
        </div>
        <div className="prestamos__content">
          <form className="prestamo-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-title">Detalles del préstamo</h2>
              <div className="form-group">
                <label htmlFor="monto" className="form-label">¿Cuánto dinero necesitas? *</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input type="text" id="monto" name="monto" className="form-input form-input--with-prefix" value={formatCurrency(form.monto)} onChange={handleNum('monto')} placeholder="0" required />
                </div>
                <span className="form-hint">Monto entre $500,000 y $50,000,000</span>
              </div>
              <div className="form-group">
                <label htmlFor="plazo" className="form-label">¿En cuántos meses quieres pagarlo? *</label>
                <select id="plazo" name="plazo" className="form-input" value={form.plazo} onChange={handleChange} required>
                  <option value="">Selecciona el plazo</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses (1 año)</option>
                  <option value="18">18 meses</option>
                  <option value="24">24 meses (2 años)</option>
                  <option value="36">36 meses (3 años)</option>
                  <option value="48">48 meses (4 años)</option>
                  <option value="60">60 meses (5 años)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="proposito" className="form-label">¿Para qué lo necesitas? *</label>
                <select id="proposito" name="proposito" className="form-input" value={form.proposito} onChange={handleChange} required>
                  <option value="">Selecciona una opción</option>
                  <option value="vivienda">Vivienda</option>
                  <option value="vehiculo">Vehículo</option>
                  <option value="educacion">Educación</option>
                  <option value="negocio">Negocio/Emprendimiento</option>
                  <option value="deudas">Consolidar deudas</option>
                  <option value="personal">Uso personal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="form-section">
              <h2 className="section-title">Información financiera</h2>
              <div className="form-group">
                <label htmlFor="ingresos" className="form-label">Ingresos mensuales *</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input type="text" id="ingresos" name="ingresos" className="form-input form-input--with-prefix" value={formatCurrency(form.ingresos)} onChange={handleNum('ingresos')} placeholder="0" required />
                </div>
                <span className="form-hint">Incluye todas las fuentes de ingreso</span>
              </div>
              <div className="form-group">
                <label htmlFor="ocupacion" className="form-label">Ocupación actual *</label>
                <select id="ocupacion" name="ocupacion" className="form-input" value={form.ocupacion} onChange={handleChange} required>
                  <option value="">Selecciona tu ocupación</option>
                  <option value="empleado">Empleado</option>
                  <option value="independiente">Independiente</option>
                  <option value="empresario">Empresario</option>
                  <option value="pensionado">Pensionado</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="form-section">
              <label className="checkbox-label">
                <input type="checkbox" name="aceptaTerminos" checked={form.aceptaTerminos} onChange={handleChange} required />
                <span>
                  Acepto los <a href="#" className="link">términos y condiciones</a> y autorizo la consulta de mis datos en centrales de riesgo
                </span>
              </label>
            </div>
            <button type="submit" className="submit-btn">Solicitar préstamo</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Prestamos;
