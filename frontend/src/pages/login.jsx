import { useState } from "react";
import { Api } from "../services/api";

export default function AuthPage({ onLogin, showToast, onNavigate, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState({ nombres: "", apellidos: "", email: "", password: "", empresa: "" });
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
    if (!reg.nombres || !reg.apellidos || !reg.email || !reg.password) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }
    if (reg.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setRegLoading(true);
    try {
      await Api.register({
        nombres: reg.nombres, apellidos: reg.apellidos,
        email: reg.email, password: reg.password,
        nombre_empresa: reg.empresa
      });
      safeToast("success", "Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
      setTab("login");
      setEmail(reg.email);
    } catch (err) {
      setError(err.message || "Error al crear la cuenta.");
    } finally {
      setRegLoading(false);
    }
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

          {tab === "login" ? (
            <form onSubmit={handleLogin} noValidate>
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
            <form onSubmit={handleRegister} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombres</label>
                  <input type="text" className="form-input" placeholder="Juan"
                    value={reg.nombres} onChange={e => setReg({ ...reg, nombres: e.target.value })} disabled={regLoading} />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos</label>
                  <input type="text" className="form-input" placeholder="Pérez"
                    value={reg.apellidos} onChange={e => setReg({ ...reg, apellidos: e.target.value })} disabled={regLoading} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input type="email" className="form-input" placeholder="juan@recicladora.com"
                  value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} disabled={regLoading} autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Empresa</label>
                <input type="text" className="form-input" placeholder="Recicladora Ejemplo SAC"
                  value={reg.empresa} onChange={e => setReg({ ...reg, empresa: e.target.value })} disabled={regLoading} />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                  value={reg.password} onChange={e => setReg({ ...reg, password: e.target.value })} disabled={regLoading} autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={regLoading}>
                {regLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
