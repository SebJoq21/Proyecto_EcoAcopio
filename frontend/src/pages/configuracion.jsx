import { useState, useEffect } from "react";
import { Api } from "../services/api";
import Modal from "../components/Modal";

export default function ConfiguracionPage({ app, showToast, onNav }) {
  const [empresa, setEmpresa] = useState({
    razon_social: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: ""
  });

  const handleChangeEmpresa = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  };

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    contrasena: "",
    rol: "OPERARIO"
  });
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

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
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargandoUsuarios(true);
      const data = await Api.req("GET", "/usuarios");
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrarUsuario = async (e) => {
    e.preventDefault();

    if (!nuevoUsuario.nombres || !nuevoUsuario.apellidos || !nuevoUsuario.email || !nuevoUsuario.contrasena) {
      showToast("error", "Por favor, completa todos los campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nuevoUsuario.email)) {
      showToast("error", "El formato del email no es valido.");
      return;
    }

    try {
      setCargando(true);
      await Api.req("POST", "/usuarios", { ...nuevoUsuario, rol: "OPERARIO" });

      showToast("success", "Operario registrado exitosamente.");
      setNuevoUsuario({ nombres: "", apellidos: "", email: "", contrasena: "", rol: "OPERARIO" });
      setModalAbierto(false);
      cargarUsuarios();
    } catch (error) {
      showToast("error", "Error al registrar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!confirm("¿Estas seguro de eliminar este usuario?")) return;
    try {
      await Api.req("DELETE", `/usuarios/${id}`);
      showToast("success", "Usuario eliminado correctamente.");
      cargarUsuarios();
    } catch (error) {
      showToast("error", "Error al eliminar: " + error.message);
    }
  };

  const abrirModal = () => {
    setNuevoUsuario({ nombres: "", apellidos: "", email: "", contrasena: "", rol: "OPERARIO" });
    setModalAbierto(true);
  };

  return (
    <div className="page" style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <button onClick={() => onNav("dashboard")} style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: '14px', marginBottom: '10px', display: 'inline-block', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver al Panel</button>
        <h1 className="page-title">⚙️ Configuracion del Sistema</h1>
        <p className="page-sub">Administra los datos de tu empresa y los usuarios del sistema</p>
      </div>

      <div className="grid-21">
        {/* IZQUIERDA: PERFIL EMPRESA */}
        <div className="card">
          <div className="card-title">Perfil de la Empresa</div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>RAZON SOCIAL</label>
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
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>DIRECCION</label>
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
               <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>TELEFONO</label>
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

        {/* DERECHA: GESTION DE USUARIOS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 200px)', overflow: 'hidden' }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="card-title" style={{ margin: 0 }}>Gestion de Usuarios</div>
              <button
                type="button"
                className="btn-primary"
                onClick={abrirModal}
              >
                + Nuevo Operario
              </button>
            </div>

            <h5 style={{ color: 'var(--text2)', fontSize: '12px', letterSpacing: '1px', marginBottom: '10px' }}>OPERARIOS REGISTRADOS</h5>
          </div>

          {cargandoUsuarios ? (
            <div style={{ textAlign: "center", padding: '24px 0', color: "var(--text2)" }}>
              <span className="spinner" />
            </div>
          ) : usuarios.length === 0 ? (
            <div style={{ textAlign: "center", padding: '24px 0', color: "var(--text2)" }}>
              No hay operarios registrados aun
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
              paddingRight: '4px',
            }}>
              {usuarios.filter(u => String(u.rol).toUpperCase() !== "ADMIN").map((u) => (
                <div
                  key={u.id_usuario || u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--blue-bg), var(--teal-bg))',
                    border: '1px solid var(--blue-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--blue)',
                    flexShrink: 0,
                  }}>
                    {(u.nombres || u.nombre || "U")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text1)' }}>
                      {u.nombres || u.nombre} {u.apellidos || u.apellido || ""}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
                      {u.email}
                    </div>
                  </div>
                  {String(u.rol).toUpperCase() !== "ADMIN" && (
                    <button
                      onClick={() => handleEliminarUsuario(u.id_usuario || u.id)}
                      title="Eliminar operario"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        color: 'var(--red)',
                        flexShrink: 0,
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalAbierto && (
        <Modal onClose={() => setModalAbierto(false)}>
          <div className="modal-title">Registrar Nuevo Operario</div>
          <div className="modal-sub">Completa los datos para crear una cuenta de operario</div>
          <form onSubmit={handleRegistrarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombres <span className="req">*</span></label>
              <input
                type="text"
                name="nombres"
                className="form-input"
                value={nuevoUsuario.nombres}
                onChange={handleChangeUsuario}
                placeholder="Nombres del operario"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Apellidos <span className="req">*</span></label>
              <input
                type="text"
                name="apellidos"
                className="form-input"
                value={nuevoUsuario.apellidos}
                onChange={handleChangeUsuario}
                placeholder="Apellidos del operario"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email <span className="req">*</span></label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={nuevoUsuario.email}
                onChange={handleChangeUsuario}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contraseña <span className="req">*</span></label>
              <input
                type="password"
                name="contrasena"
                className="form-input"
                value={nuevoUsuario.contrasena}
                onChange={handleChangeUsuario}
                placeholder="Minimo 6 caracteres"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={cargando}>
                {cargando ? "Registrando..." : "Registrar Operario"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
