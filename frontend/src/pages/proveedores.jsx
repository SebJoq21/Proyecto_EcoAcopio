import { useState, useEffect } from "react";
import { Api } from "../services/api";

export default function ProveedoresPage({ showToast, onRefresh }) {
  const [proveedores, setProveedores] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Formulario según las columnas estrictas de la DB
  const [formulario, setFormulario] = useState({
    nombre_completo: "",
    tipo_documento: "DNI",
    numero_documento: "",
    telefono: "",
    es_anonimo: false
  });

  const cargarProveedores = async () => {
    try {
      setFetching(true);
      const data = await Api.proveedores();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      if (typeof showToast === "function") showToast("error", "Error al cargar proveedores.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const manejarInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const registrarProveedor = async (e) => {
    e.preventDefault();
    if (!formulario.nombre_completo.trim()) {
      if (typeof showToast === "function") showToast("error", "El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      // Enviamos el JSON con los nombres exactos de Postgres
      await Api.req("POST", "/proveedores", {
        nombre_completo: formulario.nombre_completo.trim(),
        tipo_documento: formulario.es_anonimo ? null : formulario.tipo_documento,
        numero_documento: formulario.es_anonimo ? null : formulario.numero_documento.trim(),
        telefono: formulario.telefono.trim() || null,
        es_anonimo: formulario.es_anonimo
      });

      if (typeof showToast === "function") showToast("success", "👥 Persona registrada exitosamente.");
      
      setFormulario({ nombre_completo: "", tipo_documento: "DNI", numero_documento: "", telefono: "", es_anonimo: false });
      cargarProveedores();
      if (typeof onRefresh === "function") onRefresh();
    } catch (err) {
      if (typeof showToast === "function") showToast("error", err.message || "Error al crear proveedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text1)" }}>Gestión de Proveedores y Clientes</h1>
        <p style={{ color: "var(--text3)", margin: "4px 0 0 0" }}>Directorio oficial de entidades y control de transacciones de acopio</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.2fr", gap: 24 }}>
        {/* Formulario */}
        <div className="card" style={{ padding: 24, height: "fit-content" }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Nuevo Registro</h2>
          <form onSubmit={registrarProveedor}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Nombre Completo o Razón Social</label>
              <input type="text" className="form-input" name="nombre_completo" placeholder="Ej. Juan Pérez u Operaciones SAC" value={formulario.nombre_completo} onChange={manejarInput} disabled={loading} />
            </div>

            <div className="form-group" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="es_anonimo" name="es_anonimo" checked={formulario.es_anonimo} onChange={manejarInput} disabled={loading} style={{ width: 18, height: 18, cursor: "pointer" }} />
              <label htmlFor="es_anonimo" style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--text1)" }}>¿Es un proveedor anónimo / directo?</label>
            </div>

            {!formulario.es_anonimo && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tipo Doc.</label>
                  <select className="form-input" name="tipo_documento" value={formulario.tipo_documento} onChange={manejarInput} disabled={loading}>
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">C.E.</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Número Documento</label>
                  <input type="text" className="form-input" name="numero_documento" placeholder="Ej. 7453..." value={formulario.numero_documento} onChange={manejarInput} disabled={loading} />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Teléfono de Contacto (Opcional)</label>
              <input type="text" className="form-input" name="telefono" placeholder="Ej. +51 999..." value={formulario.telefono} onChange={manejarInput} disabled={loading} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Guardando..." : "💾 Registrar Proveedor"}
            </button>
          </form>
        </div>

        {/* Tabla (Sin mostrar el UUID de id_provider) */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Directorio de Terceros Autorizados</h2>
          {fetching ? (
            <p style={{ color: "var(--text3)" }}>Sincronizando directorio...</p>
          ) : proveedores.length === 0 ? (
            <p style={{ color: "var(--text3)" }}>No hay personas registradas.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)", color: "var(--text2)" }}>
                    <th style={{ padding: "12px 8px" }}>Nombre Completo</th>
                    <th style={{ padding: "12px 8px" }}>Identificación</th>
                    <th style={{ padding: "12px 8px" }}>Teléfono</th>
                    <th style={{ padding: "12px 8px", textAlign: "center" }}>Condición</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id_provider} style={{ borderBottom: "1px solid var(--border)", color: "var(--text1)" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 600 }}>{p.nombre_completo}</td>
                      <td style={{ padding: "12px 8px" }}>
                        {p.es_anonimo ? <span style={{ color: "var(--text3)" }}>—</span> : `${p.tipo_documento || "DNI"}: ${p.numero_documento || "—"}`}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text2)" }}>{p.telefono || "—"}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span className={`pill ${p.es_anonimo ? "pill-danger" : "pill-success"}`} style={{ fontSize: 11 }}>
                          {p.es_anonimo ? "Anónimo" : "Identificado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}