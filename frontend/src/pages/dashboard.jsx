import { useState, useEffect } from "react";
import { Api } from "../services/api";

export default function DashboardPage({ app, onNav, showToast }) {
  const [dash, setDash] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      Api.dashboard().catch(() => null),
      Api.pesajes("?limit=8").catch(() => null)
    ]).then(([dashData, pesajesData]) => {
      if (dashData) setDash(dashData);
      
      // Extraemos el array nativo de forma segura
      const lista = Array.isArray(pesajesData) 
        ? pesajesData 
        : (pesajesData?.items || pesajesData?.data || []);
      setTxs(lista);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const date = new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
  const mats = app.materiales.filter(m => m.stock_kg > 0).slice(0, 6);
  const totalStock = app.materiales.reduce((s, m) => s + (m.stock_kg || 0), 0);
  const chartData = app.materiales.filter(m => m.stock_kg > 0).slice(0, 7);
  const maxKg = Math.max(...chartData.map(m => m.stock_kg), 1);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard Operativo</h1>
        <p className="page-sub">{date}</p>
      </div>
      
      <div className="grid-4 mb-16">
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-label">PESAJES HOY</div>
          {/* Mapea cualquier variante: snake_case, camelCase o fallback directo a los registros del turno */}
          <div className="stat-value text-green">
            {dash?.pesajes_hoy ?? 
             dash?.pesajesHoy ?? 
             dash?.total_pesajes ?? 
             dash?.totalRegistros ?? 
             txs.length}
          </div>
          <div className="stat-trend stat-neutral">registros</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">KG INGRESADOS HOY</div>
          {/* Valida todas las variantes de sumatoria acumulada o calcula dinámicamente sobre el flujo activo */}
          <div className="stat-value text-blue">
            {dash?.kg_hoy ?? dash?.kgHoy ?? dash?.total_kg ?? dash?.totalKg 
              ? Number(dash?.kg_hoy ?? dash?.kgHoy ?? dash?.total_kg ?? dash?.totalKg).toFixed(1)
              : Number(txs.reduce((acc, t) => {
                  const tipoMov = (t.tipo_movimiento || t.tipo || "Entrada").toUpperCase();
                  return acc + (tipoMov === "ENTRADA" || tipoMov === "COMPRA" ? parseFloat(t.peso_kg || 0) : 0);
                }, 0)).toFixed(1)
            }
          </div>
          <div className="stat-trend stat-neutral">kg acumulados</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">PROVEEDORES ACTIVOS</div>
          <div className="stat-value text-amber">{app.proveedores.length}</div>
          <div className="stat-trend stat-neutral">registrados</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-label">MATERIALES EN STOCK</div>
          <div className="stat-value">{app.materiales.filter(m => m.activo).length}</div>
          <div className="stat-trend stat-neutral">categorías activas</div>
        </div>
      </div>

      <div className="grid-21 mb-16">
        <div className="card">
          <div className="flex-between mb-16">
            <span className="card-title" style={{ marginBottom: 0 }}>Últimos Registros</span>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav("pesaje")}>+ Nuevo</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Proveedor</th>
                  <th>Peso</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>
                      {loading ? "Sincronizando..." : "Sin registros aún"}
                    </td>
                  </tr>
                ) : (
                  txs.map((t, idx) => {
                    if (!t) return null;

                    // Extracción segura del proveedor (si viene como objeto o string)
                    let nombreProveedor = "Anónimo";
                    if (t.proveedor) {
                      nombreProveedor = typeof t.proveedor === "object" 
                        ? (t.proveedor.nombre_completo || "Anónimo") 
                        : String(t.proveedor);
                    } else if (t.proveedores) {
                      nombreProveedor = t.proveedores.nombre_completo || "Anónimo";
                    }

                    // Extracción segura del material
                    let nombreMaterial = "Material Desconocido";
                    let emojiMaterial = "♻️";
                    if (t.material) {
                      if (typeof t.material === "object") {
                        nombreMaterial = t.material.nombre || "Material Desconocido";
                        emojiMaterial = t.material.emoji || "♻️";
                      } else {
                        nombreMaterial = String(t.material);
                      }
                    } else if (t.materiales) {
                      nombreMaterial = t.materiales.nombre || "Material Desconocido";
                      emojiMaterial = t.materiales.emoji || "♻️";
                    }

                    // Identificación del tipo de movimiento ('Entrada' / 'Salida')
                    const tipoMov = (t.tipo_movimiento || t.tipo || "Entrada").toUpperCase();
                    const esEntrada = tipoMov === "ENTRADA" || tipoMov === "COMPRA";
                    const horaFecha = t.fecha_creacion || t.registrado_en || new Date();

                    return (
                      <tr key={t.id_pesaje || t.id || `row-${idx}`}>
                        <td>
                          <span className="main-cell">{emojiMaterial} {nombreMaterial}</span>
                        </td>
                        <td>{nombreProveedor}</td>
                        <td className="mono" style={{ color: esEntrada ? "var(--green)" : "var(--red)" }}>
                          {esEntrada ? "+" : "−"}{parseFloat(t.peso_kg || 0).toFixed(2)} kg
                        </td>
                        <td className="mono" style={{ fontSize: 12 }}>
                          {new Date(horaFecha).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td>
                          <span className={`badge badge-${esEntrada ? "green" : "red"}`}>
                            {esEntrada ? "Entrada" : "Salida"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Stock por Material</div>
          <div className="chart-container">
            {chartData.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text3)", margin: "auto" }}>Sin datos</p>
            ) : (
              chartData.map((m, i) => {
                const pct = (m.stock_kg / maxKg) * 100;
                const colors = ["var(--green)", "var(--blue)", "var(--amber)", "var(--teal)", "var(--red)"];
                return (
                  <div className="chart-bar-wrap" key={m.id_material || m.id || `bar-${i}`}>
                    <div className="chart-bar-val">{m.stock_kg.toFixed(0)}</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                      <div className="chart-bar" style={{ height: `${pct}%`, background: colors[i % colors.length], width: "100%" }} />
                    </div>
                    <div className="chart-bar-label" title={m.nombre}>{m.emoji || "♻️"}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="sep" />
          <div className="card-title">Alertas del Sistema</div>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ️</span>Sistema iniciado correctamente. Todos los módulos operativos.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-16">
          <span className="card-title" style={{ marginBottom: 0 }}>Resumen de Inventario</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("inventario")}>Ver todo</button>
        </div>
        {mats.length === 0 ? (
          <p style={{ color: "var(--text3)", fontSize: 13 }}>Sin materiales en stock</p>
        ) : (
          <div className="grid-3">
            {mats.map((m, idx) => {
              const pct = totalStock > 0 ? (m.stock_kg / totalStock) * 100 : 0;
              return (
                <div className="inv-item" key={m.id_material || m.id || `inv-${idx}`}>
                  <div className="inv-icon">{m.emoji}</div>
                  <div className="inv-info">
                    <div className="inv-name">{m.nombre}</div>
                    <div className="inv-meta">{m.codigo}</div>
                    <div className="progress-bar">
                      <div className="progress-fill fill-green" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="inv-kg">
                    {m.stock_kg.toFixed(1)}
                    <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text3)" }}> kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}