import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      
      // Guardar datos del usuario en localStorage
      localStorage.setItem('usuario_id', response.user.id);
      localStorage.setItem('usuario_nombre', response.user.nombre);
      localStorage.setItem('usuario_email', response.user.email);
      localStorage.setItem('usuario_saldo', response.user.saldo);

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login__container">
        <div className="login__header">
          <h1 className="login__title">Iniciar sesión</h1>
          <p className="login__subtitle">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert--error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />
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
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="login__footer">
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="link">
                Regístrate aquí
              </Link>
            </p>
            <button 
              type="button" 
              className="back-button" 
              onClick={() => navigate('/')}
              disabled={loading}
            >
              ← Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Login;

