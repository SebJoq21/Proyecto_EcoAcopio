import { useState } from "react";
import { Api } from "../services/api";

export default function LoginPage({ onLogin, showToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Función auxiliar interna por si showToast no está disponible momentáneamente
  const safeToast = (type, message) => {
    if (typeof showToast === "function") {
      showToast(type, message);
    } else {
      console.log(`[Toast - ${type}]: ${message}`);
      if (type === "error") alert(message);
    }
  };

  const manejarLogin = async (e) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      safeToast("error", "⚠️ El email y la contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      // 1. Envío plano del payload al endpoint de Express
      const respuesta = await Api.login({ email, password });

      // 2. Extraemos el token y el objeto de usuario nativo de Express
      const { token, usuario } = respuesta;

      if (!token || !usuario) {
        throw new Error("Respuesta incompleta del servidor de autenticación.");
      }

      // 3. ADAPTADOR FRONTEND: Convertimos las variables al contrato exacto de App.jsx
      // Mapeamos 'rol' a 'rol' e individualizamos 'nombres' y 'apellidos'
      const usuarioHomologado = {
        id: usuario.id_usuario,
        rol: usuario.rol, 
        nombre: usuario.nombres || "",
        apellido: usuario.apellidos || "",
        email: usuario.email,
        id_empresa: usuario.id_empresa,
        activo: usuario.activo
      };

      // 4. Guardamos las credenciales en el almacenamiento de sesión
      sessionStorage.setItem("eco_token", token);
      sessionStorage.setItem("eco_user", JSON.stringify(usuarioHomologado));

      // 5. Invocamos la función nativa de tu App.jsx para cambiar de pantalla
      if (typeof onLogin === "function") {
        onLogin(usuarioHomologado);
      } else {
        // Fallback de contingencia si no se detecta la prop
        window.location.reload();
      }

    } catch (err) {
      safeToast("error", err.message || "Error al iniciar sesión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const cargarDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="login-screen">
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>♻️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text1)", margin: 0 }}>EcoAcopio ERP</h1>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 4, marginBottom: 0 }}>Sistema de Gestión de Acopio</p>
        </div>

        <form onSubmit={manejarLogin} noValidate>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="nombre@recicladora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? "Cargando..." : "🔒 Ingresar al Sistema"}
          </button>
        </form>

        <div className="sep" style={{ margin: "24px 0 16px 0" }} />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            style={{ fontSize: 12, padding: "8px 4px" }}
            onClick={() => cargarDemo("admin@recicladora.com", "admin123")}
            disabled={loading}
          >
            👨‍💼 Demo Admin
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            style={{ fontSize: 12, padding: "8px 4px" }}
            onClick={() => cargarDemo("operador@recicladora.com", "operador123")}
            disabled={loading}
          >
            👷 Demo Operario
          </button>
        </div>
      </div>
    </div>
  );
}
