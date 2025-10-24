import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css';

function Inicio() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleAplicar = () => {
    if (email.trim()) {
      navigate('/registro', { state: { email } });
    } else {
      alert('Por favor ingresa tu correo electrónico');
    }
  };

  return (
    <main className="inicio">
      {/* Hero */}
      <section className="hero">
        <div className="container hero__content">
          <div className="hero__text">
            <p className="eyebrow">Inicio</p>
            <h1 className="hero__title">
              Elige un <span className="highlight">nuevo</span> inicio para tus
              finanzas
            </h1>
            <p className="hero__subtitle">
              Envía y recibe dinero al instante y sin costos. Una experiencia
              simple, segura y pensada para ti.
            </p>
            <div className="cta">
              <input
                type="email"
                placeholder="Escribe tu correo electrónico"
                aria-label="Correo electrónico"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAplicar()}
              />
              <button className="button" onClick={handleAplicar}>
                Aplicar ahora
              </button>
            </div>
            <p className="helper">
              Al continuar aceptas nuestros términos y políticas.
            </p>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <div className="card-mock"></div>
            <div className="bubble bubble--1"></div>
            <div className="bubble bubble--2"></div>
          </div>
        </div>
      </section>

      {/* Beneficios rápidos */}
      <section className="benefits container" aria-label="Beneficios">
        <ul className="benefits__list">
          <li className="benefit">
            <span className="benefit__icon">⚡</span>
            Rápido y sin costos
          </li>
          <li className="benefit">
            <span className="benefit__icon">🔒</span>
            Seguridad de nivel bancario
          </li>
          <li className="benefit">
            <span className="benefit__icon">📱</span>
            100% digital
          </li>
          <li className="benefit">
            <span className="benefit__icon">💜</span>
            Soporte que sí responde
          </li>
        </ul>
      </section>

      {/* Productos */}
      <section className="productos">
        <div className="container">
          <h2 className="section__title">Nuestros productos</h2>

          <div className="grid">
            <article className="card">
              <div className="card__icon" aria-hidden="true">💳</div>
              <h3 className="card__title">Tarjeta de crédito</h3>
              <p className="card__desc">
                Compra en todo el mundo como quieras. Sin letras pequeñas.
              </p>
              <button className="link">Conocer más →</button>
            </article>

            <article className="card">
              <div className="card__icon" aria-hidden="true">🏦</div>
              <h3 className="card__title">Cuenta de ahorros</h3>
              <p className="card__desc">
                Mueve tu dinero y hazlo crecer con total libertad.
              </p>
              <button className="link">Conocer más →</button>
            </article>

            <article className="card">
              <div className="card__icon" aria-hidden="true">📈</div>
              <h3 className="card__title">CDT</h3>
              <p className="card__desc">
                Invierte en tus metas de forma segura y simple.
              </p>
              <button className="link">Conocer más →</button>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Inicio;