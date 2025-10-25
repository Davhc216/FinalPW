import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Prestamos.css';

function Prestamos() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    monto: '',
    plazo: '',
    proposito: '',
    ingresos: '',
    ocupacion: '',
    tieneGarante: 'no',
    nombreGarante: '',
    documentoGarante: '',
    aceptaTerminos: false
  });

  const [tasaInteres] = useState(1.2); // 1.2% mensual
  const [cuotaMensual, setCuotaMensual] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Calcular cuota mensual si hay monto y plazo
    if (name === 'monto' || name === 'plazo') {
      const monto = name === 'monto' ? value.replace(/\D/g, '') : formData.monto.replace(/\D/g, '');
      const plazo = name === 'plazo' ? value : formData.plazo;
      
      if (monto && plazo) {
        calcularCuota(parseInt(monto), parseInt(plazo));
      }
    }
  };

  const calcularCuota = (monto, plazo) => {
    // Fórmula de cuota: M = P * [i(1 + i)^n] / [(1 + i)^n - 1]
    const i = tasaInteres / 100; // tasa mensual
    const factor = Math.pow(1 + i, plazo);
    const cuota = monto * (i * factor) / (factor - 1);
    setCuotaMensual(Math.round(cuota));
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, monto: value }));
    
    if (value && formData.plazo) {
      calcularCuota(parseInt(value), parseInt(formData.plazo));
    }
  };

  const handleIngresosChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, ingresos: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.monto || !formData.plazo || !formData.ingresos) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!formData.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    if (formData.tieneGarante === 'si' && (!formData.nombreGarante || !formData.documentoGarante)) {
      alert('Por favor completa los datos del garante');
      return;
    }

    console.log('Solicitud de préstamo:', formData);
    alert(`Solicitud de préstamo por $${formatCurrency(formData.monto)} enviada correctamente (demo)`);
    navigate('/dashboard');
  };

  return (
    <main className="prestamos">
      <div className="prestamos__container">
        {/* Encabezado */}
        <div className="prestamos__header">
          <div>
            <h1 className="prestamos__title">Solicitud de Préstamo</h1>
            <p className="prestamos__subtitle">
              Completa el formulario y obtén una respuesta en minutos
            </p>
          </div>
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al inicio
          </button>
        </div>

        <div className="prestamos__content">
          {/* Formulario */}
          <form className="prestamo-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2 className="section-title">Detalles del préstamo</h2>

              <div className="form-group">
                <label htmlFor="monto" className="form-label">
                  ¿Cuánto dinero necesitas? *
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
                <span className="form-hint">Monto entre $500,000 y $50,000,000</span>
              </div>

              <div className="form-group">
                <label htmlFor="plazo" className="form-label">
                  ¿En cuántos meses quieres pagarlo? *
                </label>
                <select
                  id="plazo"
                  name="plazo"
                  className="form-input"
                  value={formData.plazo}
                  onChange={handleChange}
                  required
                >
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
                <label htmlFor="proposito" className="form-label">
                  ¿Para qué lo necesitas? *
                </label>
                <select
                  id="proposito"
                  name="proposito"
                  className="form-input"
                  value={formData.proposito}
                  onChange={handleChange}
                  required
                >
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
                <label htmlFor="ingresos" className="form-label">
                  Ingresos mensuales *
                </label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    id="ingresos"
                    name="ingresos"
                    className="form-input form-input--with-prefix"
                    value={formatCurrency(formData.ingresos)}
                    onChange={handleIngresosChange}
                    placeholder="0"
                    required
                  />
                </div>
                <span className="form-hint">Incluye todas las fuentes de ingreso</span>
              </div>

              <div className="form-group">
                <label htmlFor="ocupacion" className="form-label">
                  Ocupación actual *
                </label>
                <select
                  id="ocupacion"
                  name="ocupacion"
                  className="form-input"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  required
                >
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
              <h2 className="section-title">Información del garante</h2>

              <div className="form-group">
                <label className="form-label">¿Tienes un garante? *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tieneGarante"
                      value="si"
                      checked={formData.tieneGarante === 'si'}
                      onChange={handleChange}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tieneGarante"
                      value="no"
                      checked={formData.tieneGarante === 'no'}
                      onChange={handleChange}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {formData.tieneGarante === 'si' && (
                <>
                  <div className="form-group">
                    <label htmlFor="nombreGarante" className="form-label">
                      Nombre completo del garante *
                    </label>
                    <input
                      type="text"
                      id="nombreGarante"
                      name="nombreGarante"
                      className="form-input"
                      value={formData.nombreGarante}
                      onChange={handleChange}
                      placeholder="Juan Pérez García"
                      required={formData.tieneGarante === 'si'}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="documentoGarante" className="form-label">
                      Documento del garante *
                    </label>
                    <input
                      type="text"
                      id="documentoGarante"
                      name="documentoGarante"
                      className="form-input"
                      value={formData.documentoGarante}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required={formData.tieneGarante === 'si'}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleChange}
                  required
                />
                <span>
                  Acepto los{' '}
                  <a href="#" className="link">términos y condiciones</a> y autorizo
                  la consulta de mis datos en centrales de riesgo
                </span>
              </label>
            </div>

            <button type="submit" className="submit-btn">
              Solicitar préstamo
            </button>
          </form>

          {/* Panel lateral */}
          <aside className="simulacion-panel">
            <h3 className="panel-title">Simulación de tu préstamo</h3>

            {formData.monto && formData.plazo ? (
              <div className="simulacion">
                <div className="simulacion__item">
                  <span className="simulacion__label">Monto solicitado</span>
                  <span className="simulacion__value simulacion__value--big">
                    ${formatCurrency(formData.monto)}
                  </span>
                </div>

                <div className="simulacion__item">
                  <span className="simulacion__label">Plazo</span>
                  <span className="simulacion__value">
                    {formData.plazo} meses
                  </span>
                </div>

                <div className="simulacion__item">
                  <span className="simulacion__label">Tasa de interés</span>
                  <span className="simulacion__value">
                    {tasaInteres}% mensual
                  </span>
                </div>

                <div className="simulacion__divider"></div>

                <div className="simulacion__item simulacion__item--highlight">
                  <span className="simulacion__label">Cuota mensual</span>
                  <span className="simulacion__value simulacion__value--big">
                    ${formatCurrency(cuotaMensual.toString())}
                  </span>
                </div>

                <div className="simulacion__item">
                  <span className="simulacion__label">Total a pagar</span>
                  <span className="simulacion__value">
                    ${formatCurrency((cuotaMensual * parseInt(formData.plazo)).toString())}
                  </span>
                </div>
              </div>
            ) : (
              <p className="simulacion__empty">
                Completa el monto y el plazo para ver tu simulación
              </p>
            )}

            <div className="beneficios">
              <h4 className="beneficios__title">Beneficios</h4>
              <ul className="beneficios__list">
                <li>✓ Aprobación en minutos</li>
                <li>✓ Sin costos ocultos</li>
                <li>✓ Desembolso inmediato</li>
                <li>✓ Flexibilidad de pago</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Prestamos;
