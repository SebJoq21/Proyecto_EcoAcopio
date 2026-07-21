import { useState, useEffect } from "react";
import { Api } from "../services/api";

export default function CategoriasPage({ showToast }) {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Cargar categorías de la base de datos al montar la vista
  const obtenerCategorias = async () => {
    try {
      setFetching(true);
      const data = await Api.categorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      if (typeof showToast === "function") {
        showToast("error", err.message || "Error al cargar categorías.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
  }, []);

  // Guardar nueva categoría siguiendo el contrato de la BD (tabla: categorias_materiales)
  const guardarCategoria = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      if (typeof showToast === "function") showToast("error", "El nombre es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      // El id_empresa se inyecta automáticamente desde el Api.req interceptor
      await Api.crearCategoria({ nombre: nombre.trim() });
      
      if (typeof showToast === "function") {
        showToast("success", "🏷️ Categoría creada exitosamente.");
      }
      setNombre("");
      obtenerCategorias(); // Recargar la lista
    } catch (err) {
      if (typeof showToast === "function") {
        showToast("error", err.message || "Error al crear la categoría.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text1)" }}>Categorías de Materiales</h1>
        <p style={{ color: "var(--text3)", margin: "4px 0 0 0" }}>Configuración del catálogo maestro para segmentación de residuos</p>
      </div>

      <div className="grid-form">
        {/* Formulario de Creación */}
        <div className="card" style={{ padding: 24, height: "fit-content" }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Nueva Categoría</h2>
          <form onSubmit={guardarCategoria}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Nombre de la Categoría</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Plásticos, Metales, Papel"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Guardando..." : "💾 Registrar Categoría"}
            </button>
          </form>
        </div>

        {/* Tabla / Listado de datos */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Categorías Registradas en la Empresa</h2>
          
          {fetching ? (
            <p style={{ color: "var(--text3)" }}>Cargando catálogo...</p>
          ) : categorias.length === 0 ? (
            <p style={{ color: "var(--text3)" }}>No hay categorías configuradas aún. Crea la primera a la izquierda.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)", color: "var(--text2)" }}>
                    <th style={{ padding: "12px 8px" }}>Nombre de Categoría</th>
                    <th style={{ padding: "12px 8px" }}>Fecha Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id_categoria} style={{ borderBottom: "1px solid var(--border)", color: "var(--text1)" }}>
                      <td style={{ padding: "12px 8px", fontWeight: 600 }}>{cat.nombre}</td>
                      <td style={{ padding: "12px 8px", color: "var(--text3)" }}>
                        {cat.fecha_creacion ? new Date(cat.fecha_creacion).toLocaleDateString() : "—"}
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