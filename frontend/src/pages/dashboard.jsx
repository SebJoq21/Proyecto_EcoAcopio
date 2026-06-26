import { useState, useEffect } from "react";
import { Api } from "../services/api";
import { obtenerEmojiPorDefecto } from "../utils/emojis";

export default function DashboardPage({ app, onNav, showToast }) {
  const [allTxs, setAllTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Api.pesajes().then((pesajesData) => {
      const lista = Array.isArray(pesajesData) 
        ? pesajesData 
        : (pesajesData?.items || pesajesData?.data || []);
      setAllTxs(lista);
    }).catch(() => null).finally(() => {
      setLoading(false);
    });
  }, []);

  const date = new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
  const hoyStr = new Date().toDateString();
  const pesajesHoyArray = allTxs.filter(t => {
    const tDate = new Date(t.fecha_creacion || t.registrado_en || t.fecha);
    return tDate.toDateString() === hoyStr;
  });

  const pesajesHoyCount = pesajesHoyArray.length;
  const kgHoyVal = pesajesHoyArray.reduce((acc, t) => {
    const tipoMov = (t.tipo_movimiento || t.tipo || "Entrada").toUpperCase();
    return acc + (tipoMov === "ENTRADA" || tipoMov === "COMPRA" ? parseFloat(t.peso_kg || 0) : 0);
  }, 0);

  const txs = allTxs.slice(0, 8);
  
  const mats = app.materiales.filter(m => m.stock_kg > 0).slice(0, 6);
  const totalStock = app.materiales.reduce((s, m) => s + (m.stock_kg || 0), 0);

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
          <div className="stat-value text-green">
            {pesajesHoyCount}
          </div>
          <div className="stat-trend stat-neutral">registros</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">KG INGRESADOS HOY</div>
          <div className="stat-value text-blue">
            {Number(kgHoyVal).toFixed(1)}
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

      <div className="card mb-16">
        <div className="flex-between mb-16">
          <span className="card-title" style={{ marginBottom: 0 }}>Últimos Registros</span>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav("pesaje")}>+ Nuevo</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Material</th>
                <th>Proveedor</th>
                <th>Peso</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>
                    {loading ? "Sincronizando..." : "Sin registros aún"}
                  </td>
                </tr>
              ) : (
                txs.map((t, idx) => {
                  if (!t) return null;

                  let nombreProveedor = "Anónimo";
                  if (t.proveedor) {
                    nombreProveedor = typeof t.proveedor === "object" 
                      ? (t.proveedor.nombre_completo || "Anónimo") 
                      : String(t.proveedor);
                  } else if (t.proveedores) {
                    nombreProveedor = t.proveedores.nombre_completo || "Anónimo";
                  }

                  let nombreMaterial = "Material Desconocido";
                  let emojiMaterial = "♻️";
                  if (t.material) {
                    if (typeof t.material === "object") {
                      nombreMaterial = t.material.nombre || "Material Desconocido";
                      const catName = t.material.categoria?.nombre;
                      emojiMaterial = t.material.emoji || obtenerEmojiPorDefecto(catName);
                    } else {
                      nombreMaterial = String(t.material);
                    }
                  } else if (t.materiales) {
                    nombreMaterial = t.materiales.nombre || "Material Desconocido";
                    const catName = t.materiales.categoria?.nombre;
                    emojiMaterial = t.materiales.emoji || obtenerEmojiPorDefecto(catName);
                  }

                  const tipoMov = (t.tipo_movimiento || t.tipo || "Entrada").toUpperCase();
                  const esEntrada = tipoMov === "ENTRADA" || tipoMov === "COMPRA";
                  const horaFecha = t.fecha_creacion || t.registrado_en || new Date();

                  return (
                    <tr key={t.id_pesaje || t.id || `row-${idx}`}>
                      <td style={{ textAlign: "center", fontSize: 20 }}>{emojiMaterial}</td>
                      <td>
                        <span className="main-cell">{nombreMaterial}</span>
                      </td>
                      <td>{nombreProveedor}</td>
                      <td className="mono" style={{ color: esEntrada ? "var(--green)" : "var(--red)" }}>
                        {esEntrada ? "+" : "−"}{parseFloat(t.peso_kg || 0).toFixed(2)} kg
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        {new Date(horaFecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")}
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