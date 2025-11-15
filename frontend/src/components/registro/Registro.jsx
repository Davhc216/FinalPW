import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
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
    celular: '',
    password: '',
    confirmaPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validaciones básicas
    if (formData.correo !== formData.confirmaCorreo) {
      setError('Los correos no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmaPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!formData.correo || !formData.primerNombre || !formData.primerApellido || !formData.password) {
      setError('Por favor completa todos los campos obligatorios');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Concatenar nombres y apellidos
      const nombreCompleto = [
        formData.primerNombre,
        formData.segundoNombre,
        formData.primerApellido,
        formData.segundoApellido
      ].filter(Boolean).join(' ');

      // Llamar a la API de registro
      const response = await register(
        nombreCompleto,
        formData.correo,
        formData.password
      );

      // Guardar datos del usuario en localStorage
      localStorage.setItem('usuario_id', response.user.id);
      localStorage.setItem('usuario_nombre', response.user.nombre);
      localStorage.setItem('usuario_email', response.user.email);
      localStorage.setItem('usuario_saldo', '0');

      // Redirigir al Dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al registrar usuario. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div className="alert alert--error">
              {error}
            </div>
          )}

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
              disabled={loading}
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
              disabled={loading}
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
              Celular
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
              disabled={loading}
            />
            <span className="form-hint">10 dígitos sin espacios (opcional)</span>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={loading}
            />
            <span className="form-hint">Mínimo 6 caracteres</span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmaPassword" className="form-label">
              Confirma tu contraseña *
            </label>
            <input
              type="password"
              id="confirmaPassword"
              name="confirmaPassword"
              className="form-input"
              value={formData.confirmaPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
