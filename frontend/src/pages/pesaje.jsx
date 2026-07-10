import { useState, useEffect, useCallback } from "react";
import { Api } from "../services/api";
import { obtenerEmojiPorDefecto } from "../utils/emojis";

export default function PesajePage({ app, showToast, onRefresh }) {
  // Catálogos locales para selectores dinámicos
  const [categorias, setCategorias] = useState([]);
  const [materialesTodos, setMaterialesTodos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ultimosPesajes, setUltimosPesajes] = useState([]);
  const [fetching, setFetching] = useState(false);

  // Filtros de categorías
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]);

  // Estructura transaccional del formulario vinculada a Postgres
  const [formulario, setFormulario] = useState({
    tipo_movimiento: "COMPRA",
    id_material: "",
    id_proveedor: "",
    peso_kg: "",
    precio_unitario: "",
    observaciones: ""
  });

  const [guardando, setGuardando] = useState(false);

  // Carga e integración local de catálogos atómicos
  // ✅ SOLUCIÓN SONARQUBE: Envolver en useCallback para dependencias seguras
  const cargarCatalogos = useCallback(async () => {
    try {
      setFetching(true);
      const resultados = await Promise.allSettled([
        Api.categorias(),
        Api.materiales(true),
        Api.proveedores(),
        Api.pesajes(`?limit=10`)
      ]);

      const [rCats, rMats, rProvs, rPesajes] = resultados;

      if (rCats.status === "fulfilled") {
        setCategorias(Array.isArray(rCats.value) ? rCats.value : []);
      } else {
        console.error("Error al cargar categorías:", rCats.reason);
        setCategorias([]);
      }

      if (rMats.status === "fulfilled") {
        setMaterialesTodos(Array.isArray(rMats.value) ? rMats.value : []);
      } else {
        console.error("Error al cargar materiales:", rMats.reason);
        setMaterialesTodos([]);
      }

      if (rProvs.status === "fulfilled") {
        setProveedores(Array.isArray(rProvs.value) ? rProvs.value : []);
      } else {
        console.error("Error al cargar proveedores:", rProvs.reason);
        setProveedores([]);
      }

      if (rPesajes.status === "fulfilled") {
        const val = rPesajes.value;
        setUltimosPesajes(Array.isArray(val) ? val : (val?.items || []));
      } else {
        console.error("Error al cargar pesajes:", rPesajes.reason);
        setUltimosPesajes([]);
      }

      const algunaFallo = resultados.some(r => r.status === "rejected");
      if (algunaFallo) {
        showToast("warning", "Algunos catálogos no se pudieron sincronizar. Verifique su conexión.");
      }
    } catch (err) {
      console.error("Error crítico sincronizando tablas relacionales:", err);
      showToast("error", "No se completó la sincronización con el servidor.");
    } finally {
      setFetching(false);
    }
  }, [showToast]);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Filtrado reactivo de materiales según categoría seleccionada
  useEffect(() => {
    if (!categoriaSeleccionada || !Array.isArray(materialesTodos)) {
      setMaterialesFiltrados([]);
    } else {
      const filtrados = materialesTodos.filter(
        (m) => m && String(m.id_categoria) === String(categoriaSeleccionada) && m.activo
      );
      setMaterialesFiltrados(filtrados);
    }
    setFormulario((prev) => ({ ...prev, id_material: "", precio_unitario: "" }));
  }, [categoriaSeleccionada, materialesTodos]);

  // Autocompletado del precio de referencia según catálogo maestro
  const handleMaterialChange = (idMat) => {
    const mat = materialesTodos.find((m) => String(m.id_material) === String(idMat));
    setFormulario((prev) => ({
      ...prev,
      id_material: idMat,
      precio_unitario: mat ? Number.parseFloat(mat.precio_referencial_kg || mat.precio || 0).toString() : ""
    }));
  };

  // Cálculo en tiempo real de la liquidación monetaria (Masa * Precio)
  const totalEstimado = (Number.parseFloat(formulario.peso_kg) || 0) * (Number.parseFloat(formulario.precio_unitario) || 0);

  // Registro transaccional en caliente
  const registrarTicket = async (e) => {
    e.preventDefault();
    if (!formulario.id_material || !formulario.id_proveedor || !formulario.peso_kg || !formulario.precio_unitario) {
      showToast("error", "Faltan seleccionar parámetros mandatorios (Proveedor / Material).");
      return;
    }

    if (Number.parseFloat(formulario.peso_kg) <= 0) {
      showToast("error", "El volumen físico ingresado en báscula debe ser mayor a 0 kg.");
      return;
    }

    try {
      setGuardando(true);
      const payload = {
        ...formulario,
        id_empresa: Api.getUser()?.id_empresa,
        id_usuario: Api.getUser()?.id_usuario,
        peso_kg: Number.parseFloat(formulario.peso_kg),
        precio_unitario: Number.parseFloat(formulario.precio_unitario),
        total_pagado: totalEstimado,
        estado: "Completado"
      };

      await Api.crearPesaje(payload);
      showToast("success", `¡Ticket grabado! Operación de ${formulario.tipo_movimiento} asentada en caja.`);
      
      // Limpieza y reinicio del formulario
      setFormulario({
        tipo_movimiento: "COMPRA",
        id_material: "",
        id_proveedor: "",
        peso_kg: "",
        precio_unitario: "",
        observaciones: ""
      });
      setCategoriaSeleccionada("");
      
      cargarCatalogos();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast("error", err.message || "Error de concurrencia al grabar en la base de datos.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">⚖️ Registro de Pesajes en Balanza</h1>
        <p className="page-sub">Panel atómico transaccional para el control de flujos de almacén y caja</p>
      </div>

      <div className="grid-2">
        {/* Formulario */}
        <div>
          <form className="card" onSubmit={registrarTicket}>
            <div className="card-title">Nuevo Ticket de Operación</div>

            <div className="form-group">
              {/* ✅ SOLUCIÓN SONARQUBE: Atributos htmlFor y tags asociadas */}
              <label className="form-label">Tipo de Movimiento</label>
              <div style={{ display: "flex", gap: 12 }}>
                <label htmlFor="tipo_compra" style={{ flex: 1, padding: "10px", border: "1px solid var(--border)", borderRadius: "var(--r)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: formulario.tipo_movimiento === "COMPRA" ? "rgba(16, 185, 129, 0.1)" : "transparent" }}>
                  <input id="tipo_compra" type="radio" name="tipo_movimiento" value="COMPRA" checked={formulario.tipo_movimiento === "COMPRA"} onChange={(e) => setFormulario({ ...formulario, tipo_movimiento: e.target.value })} />
                  <span>📥 Compra (Suma Stock)</span>
                </label>
                <label htmlFor="tipo_venta" style={{ flex: 1, padding: "10px", border: "1px solid var(--border)", borderRadius: "var(--r)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: formulario.tipo_movimiento === "VENTA" ? "rgba(239, 68, 68, 0.1)" : "transparent" }}>
                  <input id="tipo_venta" type="radio" name="tipo_movimiento" value="VENTA" checked={formulario.tipo_movimiento === "VENTA"} onChange={(e) => setFormulario({ ...formulario, tipo_movimiento: e.target.value })} />
                  <span>📤 Venta (Resta Stock)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              {/* ✅ SOLUCIÓN SONARQUBE: Accesibilidad (a11y) */}
              <label htmlFor="id_proveedor" className="form-label">Proveedor / Reciclador de Base *</label>
              <select 
                id="id_proveedor"
                className="form-select" 
                value={formulario.id_proveedor} 
                onChange={(e) => setFormulario({ ...formulario, id_proveedor: e.target.value })} 
                required
              >
                <option value="">-- Seleccionar Reciclador o Empresa Entidad --</option>
                {proveedores.map((p) => {
                  const uid = p.id_proveedor || p.id_provider || p.id;
                  const nombre = p.nombre_completo || p.nombre || "Proveedor Desconocido";
                  const doc = p.numero_documento || p.documento;
                  const esAnon = p.es_anonimo || p.anonimo;
                  // ✅ SOLUCIÓN SONARQUBE: Generador seguro de UUID en vez de Math.random()
                  return (
                    <option key={uid || crypto.randomUUID()} value={uid}>
                      {nombre} {doc && doc !== "—" ? `(${doc})` : ""} {esAnon ? "[Transeúnte]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid-2" style={{ gap: 12, padding: 0 }}>
              <div className="form-group">
                <label htmlFor="filtro_categoria" className="form-label">Filtrar Categoría *</label>
                <select id="filtro_categoria" className="form-select" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
                  <option value="">-- Ver Todas --</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="id_material" className="form-label">Material Específico *</label>
                <select id="id_material" className="form-select" value={formulario.id_material} onChange={(e) => handleMaterialChange(e.target.value)} disabled={!categoriaSeleccionada} required>
                  <option value="">-- Elige un material --</option>
                  {materialesFiltrados.map((m) => (
                    <option key={m.id_material} value={m.id_material}>
                      [{m.etiqueta || m.codigo}] {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 12, padding: 0 }}>
              <div className="form-group">
                <label htmlFor="peso_kg" className="form-label">Volumen Físico (Kilogramos) *</label>
                <input id="peso_kg" type="number" step="0.01" className="form-input" placeholder="0.00" value={formulario.peso_kg} onChange={(e) => setFormulario({ ...formulario, peso_kg: e.target.value })} required />
              </div>

              <div className="form-group">
                <label htmlFor="precio_unitario" className="form-label">Precio pactado por Kg (S/.) *</label>
                <input id="precio_unitario" type="number" step="0.01" className="form-input" placeholder="0.00" value={formulario.precio_unitario} onChange={(e) => setFormulario({ ...formulario, precio_unitario: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observaciones" className="form-label">Observaciones de Balanza (Opcional)</label>
              <input id="observaciones" type="text" className="form-input" placeholder="Mermas, estado de humedad..." value={formulario.observaciones} onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })} />
            </div>

            {totalEstimado > 0 && (
              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid var(--success)", padding: 12, borderRadius: "var(--r)", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>LIQUIDACIÓN DE FLUJO DE CAJA ESTIMADA:</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--success)", marginTop: 2 }}>
                  S/. {totalEstimado.toFixed(2)} PEN
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={guardando || fetching}>
              {guardando ? "Procesando en Balanza..." : "💾 Confirmar y Registrar Ticket"}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div>
          <div className="card">
            <div className="card-title">Últimos Pesajes del Turno Activo</div>
            {fetching && <p className="text-muted">Sincronizando con base de datos...</p>}
            {!fetching && ultimosPesajes.length === 0 && <p className="text-muted">No se registran movimientos en este período.</p>}
            
            {ultimosPesajes.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text3)", textAlign: "left" }}>
                      <th style={{ padding: "8px 4px" }}>Flujo</th>
                      <th style={{ padding: "8px 4px", width: 36 }}></th>
                      <th style={{ padding: "8px 4px" }}>Material</th>
                      <th style={{ padding: "8px 4px" }}>Tercero / Proveedor</th>
                      <th style={{ padding: "8px 4px", textAlign: "right" }}>Masa</th>
                      <th style={{ padding: "8px 4px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosPesajes.map((p) => {
                      if (!p) return null;
                      const mat = materialesTodos?.find((m) => String(m.id_material) === String(p.id_material));
                      const prov = proveedores?.find((pr) => 
                        String(pr.id_proveedor) === String(p.id_proveedor) || 
                        String(pr.id_provider) === String(p.id_proveedor) || 
                        String(pr.id) === String(p.id_proveedor)
                      );
                      
                      // ✅ SOLUCIÓN SONARQUBE: Eliminación de ternario anidado complejo
                      let nombreProveedorLegible = "Anónimo / Directo";
                      if (prov) {
                        nombreProveedorLegible = prov.nombre_completo || prov.nombre;
                      } else if (p.id_proveedor) {
                        nombreProveedorLegible = "Cargando tercero...";
                      }

                      // ✅ SOLUCIÓN SONARQUBE: ID seguro
                      const uniqueKey = p.id_pesaje || `item-${p.id_proveedor}-${crypto.randomUUID()}`;

                      return (
                        <tr key={uniqueKey} style={{ borderBottom: "1px solid var(--border)", color: "var(--text1)" }}>
                          <td style={{ padding: "12px 4px" }}>
                            <span className={`pill ${p.tipo_movimiento?.toUpperCase() === "VENTA" || p.tipo_movimiento?.toUpperCase() === "SALIDA" ? "pill-danger" : "pill-success"}`} style={{ fontSize: 11, padding: "2px 6px" }}>
                              {p.tipo_movimiento?.toUpperCase() === "VENTA" || p.tipo_movimiento?.toUpperCase() === "SALIDA" ? "📤 Venta" : "📥 Compra"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontSize: 18, padding: "12px 4px" }}>
                            {mat ? (mat.emoji || obtenerEmojiPorDefecto(mat.categoria?.nombre)) : "♻️"}
                          </td>
                          <td style={{ padding: "12px 4px", fontWeight: 500 }}>
                            {mat ? `[${mat.etiqueta || mat.codigo}] ${mat.nombre}` : "Cargando material..."}
                          </td>
                          <td style={{ padding: "12px 4px", color: "var(--text2)" }}>
                            {nombreProveedorLegible}
                          </td>
                          {/* ✅ SOLUCIÓN SONARQUBE: Parsing numérico seguro contra fallos NaN */}
                          <td style={{ padding: "12px 4px", textAlign: "right", fontWeight: 600 }}>
                            {(Number.parseFloat(p.peso_kg) || 0).toFixed(1)} kg
                          </td>
                          <td style={{ padding: "12px 4px", textAlign: "right", color: "var(--primary)", fontWeight: 700 }}>
                            S/. {(Number.parseFloat(p.total_pagado) || 0).toFixed(2)}
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
    </div>
  );
}