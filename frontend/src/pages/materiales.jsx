import { useState, useEffect } from "react";
import { Api } from "../services/api";
import { emojisDisponibles, obtenerEmojiPorDefecto } from "../utils/emojis";

export default function MaterialesPage({ showToast, onRefresh }) {
  const [materiales, setMateriales] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estado para el formulario de creación (campos idénticos a la estructura de la DB)
  const [formulario, setFormulario] = useState({
    id_categoria: "",
    etiqueta: "",
    nombre: "",
    precio_referencial_kg: "",
    emoji: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Carga inicial de datos desde Express
  const cargarDatosPantalla = async () => {
    try {
      setFetching(true);
      // Traemos las categorías y materiales en paralelo para mayor velocidad
      const [listaMats, listaCats] = await Promise.all([
        Api.materiales(false), // false para traer todos (activos e inactivos)
        Api.categorias()
      ]);
      
      setMateriales(Array.isArray(listaMats) ? listaMats : []);
      setCategorias(Array.isArray(listaCats) ? listaCats : []);
    } catch (err) {
      if (typeof showToast === "function") {
        showToast("error", err.message || "Error al sincronizar datos maestro.");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    cargarDatosPantalla();
  }, []);

  // Manejador de cambios en los inputs del formulario
  const manejarInput = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar el nuevo material cumpliendo las restricciones NOT NULL de Postgres
  const registrarMaterial = async (e) => {
    e.preventDefault();
    const { id_categoria, etiqueta, nombre, precio_referencial_kg, emoji } = formulario;

    // Validaciones básicas en el cliente antes de golpear el backend
    if (!id_categoria || !etiqueta.trim() || !nombre.trim() || !precio_referencial_kg) {
      if (typeof showToast === "function") showToast("error", "⚠️ Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      // El payload se envía plano tal como lo requiere la tabla 'materiales'
      await Api.crearMaterial({
        id_categoria,
        etiqueta: etiqueta.trim().toUpperCase(),
        nombre: nombre.trim(),
        precio_referencial_kg: parseFloat(precio_referencial_kg),
        emoji: emoji || undefined
      });

      if (typeof showToast === "function") {
        showToast("success", "📦 Material añadido correctamente a la lista maestra.");
      }
      
      // Limpiamos el formulario
      setFormulario({ id_categoria: "", etiqueta: "", nombre: "", precio_referencial_kg: "", emoji: "" });
      
      // Sincronizamos la lista local y notificamos a App.jsx si es necesario
      cargarDatosPantalla();
      if (typeof onRefresh === "function") onRefresh();

    } catch (err) {
      if (typeof showToast === "function") {
        showToast("error", err.message || "Error al crear el material.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text1)" }}>Lista Maestra de Materiales</h1>
        <p style={{ color: "var(--text3)", margin: "4px 0 0 0" }}>Definición de precios de referencia y catálogos de valorización</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 24 }}>
        
        {/* Formulario de Alta de Material */}
        <div className="card" style={{ padding: 24, height: "fit-content" }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Nuevo Material</h2>
          
          <form onSubmit={registrarMaterial}>
            
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Categoría Asociada</label>
              <select
                className="form-input"
                name="id_categoria"
                value={formulario.id_categoria}
                onChange={manejarInput}
                disabled={loading || categorias.length === 0}
                style={{ cursor: "pointer" }}
              >
                <option value="">-- Seleccione una Categoría --</option>
                {categorias.map((cat) => (
                  // El valor interno es el UUID, pero el usuario solo lee el nombre humano limpio
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {categorias.length === 0 && !fetching && (
                <small style={{ color: "var(--text3)", display: "block", marginTop: 4 }}>
                  ⚠️ No hay categorías registradas. Configúralas primero.
                </small>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Etiqueta / Código Corto</label>
              <input
                type="text"
                className="form-input"
                name="etiqueta"
                placeholder="Ej. PET-01, COBRE-A"
                value={formulario.etiqueta}
                onChange={manejarInput}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Nombre del Material</label>
              <input
                type="text"
                className="form-input"
                name="nombre"
                placeholder="Ej. Botella Plástica Transparente"
                value={formulario.nombre}
                onChange={manejarInput}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Icono / Emoji representativo</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {emojisDisponibles.map((item) => (
                  <button
                    key={item.emoji}
                    type="button"
                    title={item.label}
                    onClick={() => setFormulario((prev) => ({ ...prev, emoji: prev.emoji === item.emoji ? "" : item.emoji }))}
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 20,
                      border: formulario.emoji === item.emoji ? "2px solid var(--primary)" : "1px solid var(--border)",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: formulario.emoji === item.emoji ? "rgba(99, 102, 241, 0.1)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Precio Referencial por Kg ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                name="precio_referencial_kg"
                placeholder="0.00"
                value={formulario.precio_referencial_kg}
                onChange={manejarInput}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || categorias.length === 0}>
              {loading ? "Registrando..." : "💾 Registrar Material"}
            </button>
          </form>
        </div>

        {/* Listado Maestro de Materiales de la Empresa */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Catálogo de Materiales Autorizados</h2>
          
          {fetching ? (
            <p style={{ color: "var(--text3)" }}>Sincronizando inventario con la base de datos...</p>
          ) : materiales.length === 0 ? (
            <p style={{ color: "var(--text3)" }}>No hay materiales definidos. Registra el primero usando el formulario lateral.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)", color: "var(--text2)" }}>
                    <th style={{ padding: "12px 8px", width: 40 }}></th>
                    <th style={{ padding: "12px 8px" }}>Código</th>
                    <th style={{ padding: "12px 8px" }}>Nombre</th>
                    <th style={{ padding: "12px 8px" }}>Categoría</th>
                    <th style={{ padding: "12px 8px", textAlign: "right" }}>Precio/Kg Base</th>
                    <th style={{ padding: "12px 8px", textAlign: "center" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.map((mat) => {
                    // Buscamos de forma local el nombre de la categoría mapeada para no mostrar el UUID en la celda
                    const catAsociada = categorias.find(c => c.id_categoria === mat.id_categoria);
                    const nombreCategoriaLegible = catAsociada ? catAsociada.nombre : (mat.categoria || "—");

                    return (
                      <tr key={mat.id_material} style={{ borderBottom: "1px solid var(--border)", color: "var(--text1)" }}>
                        <td style={{ padding: "12px 8px", textAlign: "center", fontSize: 20 }}>
                          {mat.emoji || obtenerEmojiPorDefecto(nombreCategoriaLegible)}
                        </td>
                        <td style={{ padding: "12px 8px", fontWeight: 700, color: "var(--primary)" }}>
                          {mat.etiqueta}
                        </td>
                        <td style={{ padding: "12px 8px", fontWeight: 500 }}>{mat.nombre}</td>
                        {/* Aquí mostramos el nombre limpio de la categoría en lugar del UUID string */}
                        <td style={{ padding: "12px 8px", color: "var(--text2)" }}>{nombreCategoriaLegible}</td>
                        <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>
                          $ {parseFloat(mat.precio_referencial_kg || mat.precio || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "12px 8px", textAlign: "center" }}>
                          <span className={`pill ${mat.active || mat.activo ? "pill-success" : "pill-danger"}`}>
                            {mat.active || mat.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
