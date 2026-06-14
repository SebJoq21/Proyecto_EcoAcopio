import { useState } from "react";
import { Api } from "../services/api";

export default function AuthPage({ onLogin, showToast, onNavigate, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombres: "", apellidos: "", userEmail: "", password: "",
    razon_social: "", ruc: "", direccion: "", telefono: "", empresaEmail: "", logo_url: ""
  });
  const [regLoading, setRegLoading] = useState(false);
  const [error, setError] = useState("");

  const safeToast = (type, msg) => {
    if (typeof showToast === "function") showToast(type, msg);
    else if (type === "error") alert(msg);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      const msg = "El email y la contraseña son obligatorios.";
      setError(msg);
      safeToast("error", msg);
      return;
    }
    setLoading(true);
    try {
      const r = await Api.login({ email, password });
      const { token, usuario } = r;
      if (!token || !usuario) throw new Error("Respuesta incompleta del servidor.");
      const u = {
        id: usuario.id_usuario, rol: usuario.rol,
        nombre: usuario.nombres || "", apellido: usuario.apellidos || "",
        email: usuario.email, id_empresa: usuario.id_empresa, activo: usuario.activo
      };
      sessionStorage.setItem("eco_token", token);
      sessionStorage.setItem("eco_user", JSON.stringify(u));
      if (typeof onLogin === "function") onLogin(u);
      else window.location.reload();
    } catch (err) {
      const msg = err.message || "Error al iniciar sesión.";
      setError(msg);
      safeToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!form.nombres || !form.apellidos || !form.userEmail || !form.password) {
        setError("Todos los campos son obligatorios.");
        return;
      }
      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      setStep(2);
      return;
    }

    if (!form.razon_social || !form.ruc || !form.direccion || !form.telefono || !form.empresaEmail) {
      setError("Todos los campos de la empresa son obligatorios.");
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        razon_social: form.razon_social,
        ruc: form.ruc,
        direccion: form.direccion,
        telefono: form.telefono,
        email: form.empresaEmail,
        logo_url: form.logo_url || undefined,
        usuario: {
          nombres: form.nombres,
          apellidos: form.apellidos,
          email: form.userEmail,
          password: form.password,
          rol: "ADMIN"
        }
      };
      await Api.register(payload);

      const loginRes = await Api.login({ email: form.userEmail, password: form.password });
      const { token, usuario } = loginRes;
      if (!token || !usuario) throw new Error("Respuesta incompleta del servidor.");
      const u = {
        id: usuario.id_usuario, rol: usuario.rol,
        nombre: usuario.nombres || "", apellido: usuario.apellidos || "",
        email: usuario.email, id_empresa: usuario.id_empresa, activo: usuario.activo
      };
      sessionStorage.setItem("eco_token", token);
      sessionStorage.setItem("eco_user", JSON.stringify(u));
      if (typeof onLogin === "function") onLogin(u);
      else window.location.reload();
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
    setError("");
  };

  return (
    <div className="login-screen">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="auth-brand-icon">♻️</div>
            <h2 className="auth-brand-title">EcoAcopio</h2>
            <p className="auth-brand-desc">Sistema de Gestión de Centros de Acopio</p>
            <div className="auth-brand-features">
              {["Control de pesaje", "Inventario en tiempo real", "Reportes inteligentes", "Gestión de proveedores"].map((f, i) => (
                <div key={i} className="auth-brand-feature">✓ {f}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <button className="auth-close-btn" onClick={() => onNavigate && onNavigate("landing")} aria-label="Cerrar">
            ✕
          </button>
          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === "login" ? " active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab${tab === "register" ? " active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              Crear Cuenta
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {tab === "register" && (
            <>
              <div className="auth-steps">
                <div className={`auth-step ${step === 1 ? "active" : ""}`}>
                  <span className="auth-step-num">1</span>
                  <span>Administrador</span>
                </div>
                <div className="auth-step-line" />
                <div className={`auth-step ${step === 2 ? "active" : ""}`}>
                  <span className="auth-step-num">2</span>
                  <span>Empresa</span>
                </div>
              </div>
              <p className="auth-step-label">
                {step === 1 ? "Datos del Administrador" : "Datos de la Empresa"}
              </p>
            </>
          )}

          {tab === "login" ? (
            <form className="auth-form-scroll" onSubmit={handleLogin} noValidate>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email" className="form-input" placeholder="nombre@recicladora.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={loading} autoComplete="username"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Contraseña</label>
                <input
                  type="password" className="form-input" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={loading} autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar al Sistema"}
              </button>
            </form>
          ) : (
            <form className="auth-form-scroll" onSubmit={handleRegister} noValidate>
              {step === 1 && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombres</label>
                      <input type="text" className="form-input" placeholder="Juan"
                        value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })} disabled={regLoading} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apellidos</label>
                      <input type="text" className="form-input" placeholder="Pérez"
                        value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })} disabled={regLoading} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input type="email" className="form-input" placeholder="admin@recicladora.com"
                      value={form.userEmail} onChange={e => setForm({ ...form, userEmail: e.target.value })} disabled={regLoading} autoComplete="email" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Contraseña</label>
                    <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} disabled={regLoading} autoComplete="new-password" />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full btn-lg">
                    Siguiente →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Razón Social</label>
                    <input type="text" className="form-input" placeholder="Recicladora Ejemplo SAC"
                      value={form.razon_social} onChange={e => setForm({ ...form, razon_social: e.target.value })} disabled={regLoading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RUC</label>
                    <input type="text" className="form-input" placeholder="20123456789"
                      value={form.ruc} onChange={e => setForm({ ...form, ruc: e.target.value })} disabled={regLoading} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dirección</label>
                    <input type="text" className="form-input" placeholder="Av. Principal 123, Lima"
                      value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} disabled={regLoading} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-input" placeholder="+51 999 888 777"
                        value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} disabled={regLoading} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Correo Corporativo</label>
                      <input type="email" className="form-input" placeholder="info@recicladora.com"
                        value={form.empresaEmail} onChange={e => setForm({ ...form, empresaEmail: e.target.value })} disabled={regLoading} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">URL del Logo</label>
                    <input type="text" className="form-input" placeholder="https://... (Opcional)"
                      value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} disabled={regLoading} />
                  </div>
                  <a href="#" className="auth-back-link" onClick={handleBack}>← Volver</a>
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={regLoading}>
                    {regLoading ? "Creando..." : "Finalizar y Crear Empresa"}
                  </button>
                </>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
