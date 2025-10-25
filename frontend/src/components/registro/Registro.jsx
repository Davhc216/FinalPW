import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Registro.css';

function Registro() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromInicio = location.state?.email || '';

  const [formData, setFormData] = useState({
    correo: emailFromInicio,
    confirmaCorreo: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    celular: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.correo !== formData.confirmaCorreo) {
      alert('Los correos no coinciden');
      return;
    }

    if (!formData.correo || !formData.primerNombre || !formData.primerApellido || !formData.celular) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    console.log('Datos de registro:', formData);
    
    // Redirigir al Dashboard con los datos del usuario
    navigate('/dashboard', { 
      state: { 
        userData: formData 
      } 
    });
  };

  return (
    <main className="registro">
      <div className="registro__container">
        <div className="registro__header">
          <h1 className="registro__title">Crea tu cuenta</h1>
          <p className="registro__subtitle">
            Completa tus datos para empezar a disfrutar de todos los beneficios
          </p>
        </div>

        <form className="registro__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              className="form-input"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmaCorreo" className="form-label">
              Confirma tu correo *
            </label>
            <input
              type="email"
              id="confirmaCorreo"
              name="confirmaCorreo"
              className="form-input"
              value={formData.confirmaCorreo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primerNombre" className="form-label">
                Primer nombre *
              </label>
              <input
                type="text"
                id="primerNombre"
                name="primerNombre"
                className="form-input"
                value={formData.primerNombre}
                onChange={handleChange}
                placeholder="Juan"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="segundoNombre" className="form-label">
                Segundo nombre
              </label>
              <input
                type="text"
                id="segundoNombre"
                name="segundoNombre"
                className="form-input"
                value={formData.segundoNombre}
                onChange={handleChange}
                placeholder="Carlos (opcional)"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primerApellido" className="form-label">
                Primer apellido *
              </label>
              <input
                type="text"
                id="primerApellido"
                name="primerApellido"
                className="form-input"
                value={formData.primerApellido}
                onChange={handleChange}
                placeholder="Pérez"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="segundoApellido" className="form-label">
                Segundo apellido
              </label>
              <input
                type="text"
                id="segundoApellido"
                name="segundoApellido"
                className="form-input"
                value={formData.segundoApellido}
                onChange={handleChange}
                placeholder="García (opcional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="celular" className="form-label">
              Celular *
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              className="form-input"
              value={formData.celular}
              onChange={handleChange}
              placeholder="3001234567"
              pattern="[0-9]{10}"
              required
            />
            <span className="form-hint">10 dígitos sin espacios</span>
          </div>

          <button type="submit" className="submit-button">
            Crear cuenta
          </button>

          <button type="button" className="back-button-bottom" onClick={() => navigate(-1)}>
            ← Volver
          </button>

          <p className="form-footer">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="link">Términos y Condiciones</a> y{' '}
            <a href="#" className="link">Política de Privacidad</a>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Registro;
