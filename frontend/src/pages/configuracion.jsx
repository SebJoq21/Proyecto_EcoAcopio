import { useState, useEffect } from "react";
import { Api } from "../services/api";

export default function ConfiguracionPage({ app, showToast }) {
  // 1. Estados para el formulario de Nueva Empresa (Opcional, si ya lo tienes, mantenlo)
  const [empresa, setEmpresa] = useState({
    razon_social: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: ""
  });

  // 1b. Manejar cambios en los inputs de la empresa
  const handleChangeEmpresa = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  };

  // 1c. Protección de ruta + precarga de empresa
  useEffect(() => {
    const user = Api.getUser();
    const isAdmin = user && user.rol && String(user.rol).toUpperCase() === 'ADMIN';
    if (!isAdmin) {
      showToast("error", "Acceso denegado: Solo para administradores");
      window.location.href = '/';
      return;
    }
    if (user && user.id_empresa) {
      Api.req("GET", `/empresas/${user.id_empresa}`)
        .then((data) => {
          setEmpresa({
            razon_social: data.razon_social || data.nombre || "",
            ruc: data.ruc || "",
            direccion: data.direccion || "",
            telefono: data.telefono || "",
            email: data.email || ""
          });
        })
        .catch((err) => {
          console.error("Error cargando empresa:", err);
          const emp = user?.empresa || user?.Empresa;
          if (emp) {
            setEmpresa({
              razon_social: emp.razon_social || emp.nombre || "",
              ruc: emp.ruc || "",
              direccion: emp.direccion || "",
              telefono: emp.telefono || "",
              email: emp.email || ""
            });
          }
        });
    }
  }, []);

  // 2. ESTADOS PARA EL NUEVO OPERARIO
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    contrasena: "",
    rol: "OPERARIO" // Por defecto
  });
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);

  // 3. Manejar cambios en los inputs del nuevo usuario
  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 4. LÓGICA PRINCIPAL: REGISTRAR EL USUARIO
  const handleRegistrarUsuario = async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // VALIDACIÓN: No permitir envío si hay campos vacíos
    if (!nuevoUsuario.nombres || !nuevoUsuario.apellidos || !nuevoUsuario.email || !nuevoUsuario.contrasena) {
      showToast("error", "Por favor, completa todos los campos.");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoUsuario.email)) {
      showToast("error", "El formato del email no es válido.");
      return;
    }

    try {
      setCargando(true);
      // OJO: Aquí estoy usando una ruta inventada, asegúrate de que coincida con tu backend
      const response = await Api.req("POST", "/usuarios", nuevoUsuario); 
      
      showToast("success", "Usuario registrado exitosamente.");
      
      // Limpiamos el formulario y lo ocultamos
      setNuevoUsuario({ nombres: "", apellidos: "", email: "", contrasena: "", rol: "Operario" });
      setMostrarFormulario(false);
      
      // (Opcional) Aquí podrías volver a cargar la lista de usuarios
      // cargarUsuarios(); 
    } catch (error) {
      showToast("error", "Error al registrar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="page" style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <a href="/" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px', marginBottom: '10px', display: 'inline-block' }}>← Volver al Panel</a>
        <h1 className="page-title">⚙️ Configuración del Sistema</h1>
        <p className="page-sub">Administra los datos de tu empresa y los usuarios del sistema</p>
      </div>

      <div className="grid-21">
        {/* IZQUIERDA: PERFIL EMPRESA (Mantenemos tu diseño) */}
        <div className="card">
          <div className="card-title">Perfil de la Empresa</div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>RAZÓN SOCIAL</label>
               <input
                 type="text"
                 name="razon_social"
                 value={empresa.razon_social || ""}
                 onChange={handleChangeEmpresa}
                 disabled={true}
                 placeholder="Ej: EcoAcopio S.A.C."
                 style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', opacity: 0.7, cursor: 'not-allowed' }}
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>RUC</label>
               <input
                 type="text"
                 name="ruc"
                 value={empresa.ruc || ""}
                 onChange={handleChangeEmpresa}
                 placeholder="20123456789"
                 style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>DIRECCIÓN</label>
               <input
                 type="text"
                 name="direccion"
                 value={empresa.direccion || ""}
                 onChange={handleChangeEmpresa}
                 placeholder="Av. Principal 123, Lima"
                 style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>TELÉFONO</label>
               <input
                 type="text"
                 name="telefono"
                 value={empresa.telefono || ""}
                 onChange={handleChangeEmpresa}
                 placeholder="+51 999 888 777"
                 style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
               />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>EMAIL DE CONTACTO</label>
               <input
                 type="email"
                 name="email"
                 value={empresa.email || ""}
                 onChange={handleChangeEmpresa}
                 placeholder="info@recicladora.com"
                 style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
               />
            </div>
            <button type="button" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* DERECHA: GESTIÓN DE USUARIOS */}
        <div className="card">
          {/* Cabecera Flexbox para no amontonar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="card-title" style={{ margin: 0 }}>Gestión de Usuarios</div>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              {mostrarFormulario ? "Cancelar" : "+ Nuevo Operario"}
            </button>
          </div>

          {/* Formulario que se muestra/oculta */}
          {mostrarFormulario && (
            <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: '20px', background: 'var(--bg2)' }}>
              <h4 style={{ margin: '0 0 15px 0', color: 'var(--text)' }}>Registrar Nuevo Usuario</h4>
              
              {/* IMPORTANTE: Añadimos onSubmit al form */}
              <form onSubmit={handleRegistrarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="text" 
                  name="nombres"
                  value={nuevoUsuario.nombres}
                  onChange={handleChangeUsuario}
                  placeholder="Nombres" 
                  style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }} 
                />
                <input 
                  type="text" 
                  name="apellidos"
                  value={nuevoUsuario.apellidos}
                  onChange={handleChangeUsuario}
                  placeholder="Apellidos" 
                  style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }} 
                />
                <input 
                  type="email" 
                  name="email"
                  value={nuevoUsuario.email}
                  onChange={handleChangeUsuario}
                  placeholder="Email" 
                  style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }} 
                />
                <input 
                  type="password" 
                  name="contrasena"
                  value={nuevoUsuario.contrasena}
                  onChange={handleChangeUsuario}
                  placeholder="Contraseña" 
                  style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }} 
                />
                <select 
                  name="rol"
                  value={nuevoUsuario.rol}
                  onChange={handleChangeUsuario}
                  style={{ padding: '8px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                >
                  <option value="OPERARIO">Operario</option>
                  <option value="ADMIN">Admin</option>
                </select>
                
                {/* Cambiamos el tipo a "submit" para que dispare el formulario */}
                <button type="submit" className="btn-primary" disabled={cargando} style={{ marginTop: '5px' }}>
                  {cargando ? "Registrando..." : "Registrar Usuario"}
                </button>
              </form>
            </div>
          )}

          {/* Lista de Usuarios (Mockup temporal) */}
          <div style={{ marginTop: '10px' }}>
            <h5 style={{ color: 'var(--text2)', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>USUARIOS REGISTRADOS</h5>
            <div style={{ textAlign: "center", padding: '24px 0', color: "var(--text2)" }}>
              No hay usuarios registrados aún
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}