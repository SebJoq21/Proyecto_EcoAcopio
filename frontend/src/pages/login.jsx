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
  const [errores, setErrores] = useState({});
  const [loginErrores, setLoginErrores] = useState({});

  const safeToast = (type, msg) => {
    if (typeof showToast === "function") showToast(type, msg);
    else if (type === "error") alert(msg);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = true;
    if (!password) errs.password = true;
    if (Object.keys(errs).length > 0) {
      setLoginErrores(errs);
      return;
    }
    setLoginErrores({});
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
    const errs = {};

    if (step === 1) {
      if (!form.nombres) errs.nombres = true;
      if (!form.apellidos) errs.apellidos = true;
      if (!form.userEmail) errs.userEmail = true;
      if (!form.password) errs.password = true;
      else if (form.password.length < 6) errs.password = true;

      if (Object.keys(errs).length > 0) {
        setErrores(errs);
        return;
      }

      setErrores({});
      setStep(2);
      return;
    }

    if (!form.razon_social) errs.razon_social = true;
    if (!form.ruc) errs.ruc = true;
    if (!form.direccion) errs.direccion = true;
    if (!form.telefono) errs.telefono = true;
    if (!form.empresaEmail) errs.empresaEmail = true;

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
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
      safeToast("error", err.message || "Error al crear la cuenta.");
    } finally {
      setRegLoading(false);
    }
  };

  const limpiarLoginError = (campo) => {
    setLoginErrores((prev) => {
      if (!prev[campo]) return prev;
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  };

  const limpiarError = (campo) => {
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const next = { ...prev };
      delete next[campo];
      return next;
    });
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
    setErrores({});
  };

  return (
    <div className="auth-container" style={{
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0, 0, 0, 0.05)'
    }}>
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
              onClick={() => { setTab("login"); setError(""); setErrores({}); }}
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab${tab === "register" ? " active" : ""}`}
              onClick={() => { setTab("register"); setError(""); setErrores({}); }}
            >
              Crear Cuenta
            </button>
          </div>

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
                <label className={`form-label ${loginErrores.email ? "text-red-500" : ""}`}>Correo Electrónico</label>
                <input
                  type="email" className={`form-input ${loginErrores.email ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="nombre@recicladora.com"
                  value={email} onChange={e => { setEmail(e.target.value); limpiarLoginError("email"); }}
                  disabled={loading} autoComplete="username"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className={`form-label ${loginErrores.password ? "text-red-500" : ""}`}>Contraseña</label>
                <input
                  type="password" className={`form-input ${loginErrores.password ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="••••••••"
                  value={password} onChange={e => { setPassword(e.target.value); limpiarLoginError("password"); }}
                  disabled={loading} autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar al Sistema"}
              </button>
            </form>
          ) : (
            <form className="auth-form-register" onSubmit={handleRegister} noValidate>
              <div className={`auth-form-fields ${step === 1 ? "auth-form-fields--static" : "auth-form-fields--scroll"}`}>
                {step === 1 && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className={`form-label ${errores.nombres ? "text-red-500" : ""}`}>Nombres</label>
                        <input type="text" className={`form-input ${errores.nombres ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="Juan"
                          value={form.nombres} onChange={e => { setForm({ ...form, nombres: e.target.value }); limpiarError("nombres"); }} disabled={regLoading} />
                      </div>
                      <div className="form-group">
                        <label className={`form-label ${errores.apellidos ? "text-red-500" : ""}`}>Apellidos</label>
                        <input type="text" className={`form-input ${errores.apellidos ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="Pérez"
                          value={form.apellidos} onChange={e => { setForm({ ...form, apellidos: e.target.value }); limpiarError("apellidos"); }} disabled={regLoading} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className={`form-label ${errores.userEmail ? "text-red-500" : ""}`}>Correo Electrónico</label>
                      <input type="email" className={`form-input ${errores.userEmail ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="admin@recicladora.com"
                        value={form.userEmail} onChange={e => { setForm({ ...form, userEmail: e.target.value }); limpiarError("userEmail"); }} disabled={regLoading} autoComplete="email" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 24 }}>
                      <label className={`form-label ${errores.password ? "text-red-500" : ""}`}>Contraseña</label>
                      <input type="password" className={`form-input ${errores.password ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="Mínimo 6 caracteres"
                        value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); limpiarError("password"); }} disabled={regLoading} autoComplete="new-password" />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="form-group">
                      <label className={`form-label ${errores.razon_social ? "text-red-500" : ""}`}>Razón Social</label>
                      <input type="text" className={`form-input ${errores.razon_social ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="Recicladora Ejemplo SAC"
                        value={form.razon_social} onChange={e => { setForm({ ...form, razon_social: e.target.value }); limpiarError("razon_social"); }} disabled={regLoading} />
                    </div>
                    <div className="form-group">
                      <label className={`form-label ${errores.ruc ? "text-red-500" : ""}`}>RUC</label>
                      <input type="text" className={`form-input ${errores.ruc ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="20123456789"
                        value={form.ruc} onChange={e => { setForm({ ...form, ruc: e.target.value }); limpiarError("ruc"); }} disabled={regLoading} />
                    </div>
                    <div className="form-group">
                      <label className={`form-label ${errores.direccion ? "text-red-500" : ""}`}>Dirección</label>
                      <input type="text" className={`form-input ${errores.direccion ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="Av. Principal 123, Lima"
                        value={form.direccion} onChange={e => { setForm({ ...form, direccion: e.target.value }); limpiarError("direccion"); }} disabled={regLoading} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className={`form-label ${errores.telefono ? "text-red-500" : ""}`}>Teléfono</label>
                        <input type="text" className={`form-input ${errores.telefono ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="+51 999 888 777"
                          value={form.telefono} onChange={e => { setForm({ ...form, telefono: e.target.value }); limpiarError("telefono"); }} disabled={regLoading} />
                      </div>
                      <div className="form-group">
                        <label className={`form-label ${errores.empresaEmail ? "text-red-500" : ""}`}>Correo Corporativo</label>
                        <input type="email" className={`form-input ${errores.empresaEmail ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""}`} placeholder="info@recicladora.com"
                          value={form.empresaEmail} onChange={e => { setForm({ ...form, empresaEmail: e.target.value }); limpiarError("empresaEmail"); }} disabled={regLoading} />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="form-label">URL del Logo</label>
                      <input type="text" className="form-input" placeholder="https://... (Opcional)"
                        value={form.logo_url} onChange={e => { setForm({ ...form, logo_url: e.target.value }); }} disabled={regLoading} />
                    </div>
                    <a href="#" className="auth-back-link" onClick={handleBack}>← Volver</a>
                  </>
                )}
              </div>
              <div className="auth-form-footer">
                {step === 1 && (
                  <button type="submit" className="btn btn-primary btn-full btn-lg">
                    Siguiente →
                  </button>
                )}
                {step === 2 && (
                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={regLoading}>
                    {regLoading ? "Creando..." : "Finalizar y Crear Empresa"}
                  </button>
                )}
              </div>
            </form>
          )}

        </div>
      </div>
  );
}
