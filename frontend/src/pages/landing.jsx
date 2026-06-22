import { useState } from "react";

const features = [
  { icon: "⚖️", title: "Control de Pesaje", desc: "Registra cada ingreso de material con precisión. Sistema optimizado para centros de acopio de cualquier tamaño." },
  { icon: "📦", title: "Inventario en Tiempo Real", desc: "Monitorea tus existencias al instante. Visualiza stock, tendencias y alertas en un solo lugar." },
  { icon: "📊", title: "Reportes Inteligentes", desc: "Genera reportes detallados con análisis de tendencias para tomar decisiones informadas." },
  { icon: "👥", title: "Gestión de Proveedores", desc: "Administra tu red de proveedores con historial completo de transacciones y pagos." },
  { icon: "🔍", title: "Auditoría y Trazabilidad", desc: "Registro completo de cada operación con trazabilidad total y certificación digital." }
];

const steps = [
  { num: "01", title: "Registra el Ingreso", desc: "Pesa y clasifica los materiales reciclables que llegan a tu centro de acopio de forma rápida y precisa." },
  { num: "02", title: "Gestiona tu Inventario", desc: "Lleva el control preciso de cada material, desde su ingreso hasta su destino final, con actualización en tiempo real." },
  { num: "03", title: "Genera Impacto", desc: "Obtén reportes que te permitan medir y comunicar tu contribución al medio ambiente y la economía circular." }
];

const testimonials = [
  { nombre: "María García", cargo: "Gerente de Operaciones, Centro Verde SAC", texto: "EcoAcopio transformó la gestión de nuestro centro de acopio. Ahora podemos rastrear cada kilogramo y generar reportes en segundos.", iniciales: "MG" },
  { nombre: "Carlos Mendoza", cargo: "Director General, Recicladora del Sur", texto: "La plataforma nos ayudó a reducir pérdidas en un 40% y optimizar nuestro inventario. El registro de pesajes es increíblemente rápido y preciso.", iniciales: "CM" },
  { nombre: "Ana Torres", cargo: "Coordinadora Ambiental, EcoVida Perú", texto: "Implementar EcoAcopio fue la mejor decisión para nuestro centro. La trazabilidad que ofrece es clave para nuestra certificación ambiental.", iniciales: "AT" },
  { nombre: "Javier Silva", cargo: "Jefe de Planta, Acopios del Norte", texto: "El control de proveedores nos ha salvado de muchos dolores de cabeza. La plataforma es súper intuitiva para que mis operarios la usen a diario.", iniciales: "JS" },
  { nombre: "Lucía Fernández", cargo: "Fundadora, Recicla +", texto: "Dejamos los cuadernos y Excel atrás. Tener el stock actualizado en tiempo real nos permite negociar muchísimo mejor con nuestros compradores.", iniciales: "LF" }
];

const faqs = [
  { q: "¿Qué es EcoAcopio?", a: "EcoAcopio es un sistema de gestión integral para centros de acopio de materiales reciclables. Permite controlar pesaje, inventario, proveedores y generar reportes inteligentes con trazabilidad completa." },
  { q: "¿Quiénes pueden usar la plataforma?", a: "Cualquier centro de acopio, recicladora o empresa de gestión de residuos. Desde pequeños centros comunitarios hasta grandes operaciones industriales." },
  { q: "¿Necesito capacitación para usarlo?", a: "La plataforma está diseñada para ser intuitiva. Ofrecemos guías interactivas, tutoriales en video y soporte técnico para facilitar la adopción." },
  { q: "¿Ofrecen soporte técnico?", a: "Sí, contamos con soporte técnico por correo electrónico y chat en horario laboral. Planes premium incluyen soporte prioritario 24/7." },
  { q: "¿Puedo probarlo antes de comprar?", a: "Sí, ofrecemos una prueba gratuita por 14 días sin compromiso. Solo crea una cuenta y comienza a explorar todas las funcionalidades." }
];

export default function Landing({ onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @keyframes carruselTestimonios {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-350px * 5 - 24px * 5)); }
        }
        .testimonios-contenedor {
          overflow: hidden;
          width: 100%;
          padding: 20px 0;
          position: relative;
        }
        .testimonios-pista {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: carruselTestimonios 35s linear infinite;
        }
        .testimonios-pista:hover {
          animation-play-state: paused;
        }
        .testimonio-card {
          width: 350px;
          min-width: 350px;
        }
        .paso-card {
          background: linear-gradient(to bottom, #ffffff, #f8fafc);
          border: 1px solid #e2e8f0;
          border-top: 4px solid #10b981;
          border-radius: 12px;
          padding: 40px 24px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .paso-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
      <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => scrollTo("hero")} style={{ cursor: "pointer" }}>
            <span className="landing-logo-icon">♻️</span>
            <span className="landing-logo-text">EcoAcopio</span>
          </div>
          <div className="landing-nav-links">
            <a href="#about" onClick={e => { e.preventDefault(); scrollTo("about"); }}>Nosotros</a>
            <a href="#features" onClick={e => { e.preventDefault(); scrollTo("features"); }}>Características</a>
            <a href="#process" onClick={e => { e.preventDefault(); scrollTo("process"); }}>¿Cómo funciona?</a>
            <a href="#testimonials" onClick={e => { e.preventDefault(); scrollTo("testimonials"); }}>Testimonios</a>
            <a href="#faq" onClick={e => { e.preventDefault(); scrollTo("faq"); }}>FAQ</a>
            <a href="#contact" onClick={e => { e.preventDefault(); scrollTo("contact"); }}>Contacto</a>
          </div>
          <div className="landing-nav-actions">
            <button className="landing-btn landing-btn-ghost" onClick={() => onNavigate("auth", "login")}>
              Iniciar Sesión
            </button>
            <button className="landing-btn landing-btn-primary" onClick={() => onNavigate("auth", "register")}>
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      <section id="hero" className="landing-hero landing-section">
        <div className="landing-hero-bg">
          <div className="landing-hero-shape shape-1" />
          <div className="landing-hero-shape shape-2" />
          <div className="landing-hero-shape shape-3" />
        </div>
        <div className="landing-hero-content">
          <div className="landing-hero-badge">Plataforma de Gestión Sostenible</div>
          <h1 className="landing-hero-title">
            Transformamos <span className="text-emerald">residuos</span><br />
            en oportunidades
          </h1>
          <p className="landing-hero-sub">
            La plataforma inteligente para la gestión de centros de acopio.
            Controla pesaje, inventario, proveedores y reportes en un solo lugar.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={() => onNavigate("auth", "register")}>
              Comenzar ahora →
            </button>
            <button className="landing-btn landing-btn-outline landing-btn-lg" onClick={() => scrollTo("features")}>
              Conocer más ↓
            </button>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="hero-floating-container">
            <div className="hero-floating-main hero-panel">
              <div className="hero-panel-grid-bg" />
              <div className="hero-panel-header">El problema global</div>
              <div className="hero-panel-body">
                <div className="hero-panel-item">
                  <svg className="hero-panel-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-9 9" />
                    <path d="M3 12h8" />
                    <path d="M11 3v9" />
                    <path d="M15 8l4 4-4 4" />
                    <path d="M9 16l-4-4 4-4" />
                  </svg>
                  <div className="hero-panel-item-content">
                    <div className="hero-panel-number">9%</div>
                    <div className="hero-panel-desc">Del plástico a nivel mundial logra ser reciclado</div>
                  </div>
                </div>
                <div className="hero-panel-divider" />
                <div className="hero-panel-item">
                  <svg className="hero-panel-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2h4v2a3 3 0 0 1 3 3v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3z" />
                    <path d="M9 7h6" />
                    <path d="M10 11h4" />
                    <path d="M10 14h4" />
                  </svg>
                  <div className="hero-panel-item-content">
                    <div className="hero-panel-number">1 Millón</div>
                    <div className="hero-panel-desc">De botellas de plástico se compran cada minuto en el mundo</div>
                  </div>
                </div>
                <div className="hero-panel-divider" />
                <div className="hero-panel-item">
                  <svg className="hero-panel-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 16q3-4 6 0q3 4 6 0q3-4 6 0" />
                    <path d="M2 20q3-3 6 0q3 3 6 0q3-3 6 0" />
                    <path d="M2 12q3-4 6 0q3 4 6 0q3-4 6 0" />
                  </svg>
                  <div className="hero-panel-item-content">
                    <div className="hero-panel-number">8 Millones</div>
                    <div className="hero-panel-desc">De toneladas de plástico terminan en los océanos cada año</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-micro micro-chart">
              <div className="micro-chart-line">
                <svg width="60" height="24" viewBox="0 0 60 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20 Q10 18 18 14 Q26 8 34 12 Q42 6 50 10 Q54 4 58 6" />
                  <path d="M2 20 Q10 18 18 14 Q26 8 34 12 Q42 6 50 10 Q54 4 58 6" stroke="url(#grad)" strokeWidth="3" opacity=".3" />
                </svg>
              </div>
              <div className="micro-chart-info">
                <span className="micro-chart-label">Índice de contaminación</span>
                <span className="micro-chart-value">+12.4%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="landing-about landing-section">
        <div className="landing-section-inner">
          <div className="landing-about-grid">
            <div className="landing-about-content">
              <span className="landing-section-tag">Nosotros</span>
              <h2 className="landing-about-title">
                Digitalizando la gestión de centros de acopio en <span className="text-emerald">América Latina</span>
              </h2>
              <p className="landing-about-desc">
                En EcoAcopio creemos que la tecnología es clave para potenciar el reciclaje y la economía circular.
                Nuestra plataforma ayuda a centros de acopio a operar de manera más eficiente, transparente y sostenible.
              </p>
              <p className="landing-about-desc">
                Desde 2024, trabajamos con recicladoras y centros de acopio para digitalizar sus operaciones,
                reducir pérdidas y maximizar su impacto ambiental positivo.
              </p>
              <div className="ods-row">
                <div className="ods-card" style={{ "--ods-color": "#A21942" }}>
                  <div className="ods-icon">💼</div>
                  <div className="ods-body">
                    <span className="ods-number">ODS 8</span>
                    <span className="ods-title">Trabajo decente y crecimiento económico</span>
                  </div>
                </div>
                <div className="ods-card" style={{ "--ods-color": "#FD6925" }}>
                  <div className="ods-icon">⚙️</div>
                  <div className="ods-body">
                    <span className="ods-number">ODS 9</span>
                    <span className="ods-title">Industria, innovación e infraestructura</span>
                  </div>
                </div>
                <div className="ods-card" style={{ "--ods-color": "#BF8B2E" }}>
                  <div className="ods-icon">♻️</div>
                  <div className="ods-body">
                    <span className="ods-number">ODS 12</span>
                    <span className="ods-title">Producción y consumo responsables</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="landing-about-visual">
              <div className="about-card-grid">
                <div className="about-card"><span className="about-card-icon">🌱</span><span>Impacto Ambiental</span></div>
                <div className="about-card"><span className="about-card-icon">📈</span><span>Eficiencia Operativa</span></div>
                <div className="about-card"><span className="about-card-icon">🔗</span><span>Economía Circular</span></div>
                <div className="about-card"><span className="about-card-icon">🤝</span><span>Transparencia</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features-section landing-section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="landing-section-inner">
          <span className="landing-section-tag">Características</span>
          <h2 className="landing-section-title">Todo lo que necesitas para tu centro de acopio</h2>
          <p className="landing-section-sub">
            Herramientas diseñadas para optimizar cada aspecto de tu operación de reciclaje.
          </p>
          <div className="landing-features">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="process" className="landing-process landing-section">
        <div className="landing-section-inner">
          <span className="landing-section-tag">¿Cómo funciona?</span>
          <h2 className="landing-section-title">Tres pasos para transformar tu operación</h2>
          <p className="landing-section-sub">
            Implementa EcoAcopio en tu centro de acopio de forma rápida y sencilla.
          </p>
          <div className="landing-steps">
            {steps.map((s, i) => (
              <div key={i} className="landing-step paso-card">
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  margin: '0 auto 24px auto',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
                }}>
                  {parseInt(s.num, 10)}
                </div>
                <h3 className="landing-step-title">{s.title}</h3>
                <p className="landing-step-desc">{s.desc}</p>
                {i < steps.length - 1 && <div className="landing-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="landing-testimonials landing-section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="landing-section-inner">
          <span className="landing-section-tag">Testimonios</span>
          <h2 className="landing-section-title">Lo que dicen nuestros usuarios</h2>
          <p className="landing-section-sub">
            Conoce la experiencia de quienes ya confían en EcoAcopio.
          </p>
          <div className="testimonios-contenedor">
            <div className="testimonios-pista">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="testimonio-card landing-testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{t.texto}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.iniciales}</div>
                    <div>
                      <div className="testimonial-name">{t.nombre}</div>
                      <div className="testimonial-role">{t.cargo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="landing-faq landing-section">
        <div className="landing-section-inner">
          <span className="landing-section-tag">FAQ</span>
          <h2 className="landing-section-title">Preguntas frecuentes</h2>
          <p className="landing-section-sub">
            Resolvemos tus dudas sobre EcoAcopio.
          </p>
          <div className="landing-faq-list">
            {faqs.map((item, i) => (
              <div key={i} className={`landing-faq-item${openFaq === i ? " open" : ""}`}>
                <button className="landing-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="faq-chevron">{openFaq === i ? "−" : "+"}</span>
                </button>
                <div className="landing-faq-answer" style={{ maxHeight: openFaq === i ? "300px" : "0" }}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="landing-contact landing-section" style={{ backgroundColor: '#f8fafc' }}>
        <div className="landing-section-inner">
          <span className="landing-section-tag">Contacto</span>
          <h2 className="landing-section-title">Contáctanos</h2>
          <p className="landing-section-sub">
            Estamos aquí para ayudarte. Descubre cómo EcoAcopio puede transformar tu centro de acopio.
          </p>
          <div className="landing-contact-grid">
            <div className="landing-contact-info">
              <div className="contact-detail">
                <span className="contact-detail-icon">📍</span>
                <div>
                  <div className="contact-detail-label">Ubicación</div>
                  <div className="contact-detail-value">Lima, Perú</div>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon">📧</span>
                <div>
                  <div className="contact-detail-label">Correo</div>
                  <div className="contact-detail-value">hola@ecoacopio.com</div>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail-icon">📱</span>
                <div>
                  <div className="contact-detail-label">Teléfono</div>
                  <div className="contact-detail-value">+51 999 888 777</div>
                </div>
              </div>
            </div>
            <form className="landing-contact-form" onSubmit={e => { e.preventDefault(); alert("¡Mensaje enviado! Te contactaremos pronto."); }}>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Nombre" required />
                </div>
                <div className="form-group">
                  <input type="email" className="form-input" placeholder="Email" required />
                </div>
              </div>
              <div className="form-group">
                <input type="text" className="form-input" placeholder="Asunto" />
              </div>
              <div className="form-group">
                <textarea className="form-textarea" placeholder="Mensaje" rows={4} required />
              </div>
              <button type="submit" className="landing-btn landing-btn-primary landing-btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                Enviar mensaje →
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="landing-cta-section landing-section">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title">Únete a la transformación sostenible</h2>
          <p className="landing-cta-sub">
            Comienza a digitalizar tu centro de acopio y sé parte del cambio hacia un futuro más limpio.
          </p>
          <button className="landing-btn landing-btn-white landing-btn-lg" onClick={() => onNavigate("auth", "register")}>
            Crear cuenta gratuita →
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span className="landing-logo-icon">♻️</span>
            <span className="landing-logo-text" style={{ color: "white" }}>EcoAcopio</span>
          </div>
          <p className="landing-footer-text">
            Transformando residuos en oportunidades para un futuro sostenible.
          </p>
          <div className="landing-footer-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>© 2026 EcoAcopio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
