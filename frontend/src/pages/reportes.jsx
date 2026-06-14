import { useState } from "react";
import { Api } from "../services/api";

export default function ReportesPage({ app, showToast }) {
  const isAdmin = app.role === "admin";
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const mesNum = { "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6, "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12 };

  const generar = async () => {
    setLoading(true);
    try {
      const m = Number(mes);
      const y = Number(year);
      const data = await Api.reporte(m, y);
      console.log("📊 Reporte API response:", data);
      setResult(data);
    } catch (e) { 
      showToast("error", "❌ " + e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const descargarCSV = async () => {
    try {
      const blob = await Api.exportarCSV(mes, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${String(mes).padStart(2, "0")}-${year}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      showToast("error", "❌ No se pudo descargar el archivo de exportación.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">📋 Reportes y Trazabilidad</h1>
        <p className="page-sub">Reportes de cierre mensual y exportación para entidades ambientales — RN-13</p>
      </div>
      
      <div className="card-relative card mb-16">
        {!isAdmin && (
          <div className="locked-overlay">
            <div style={{ fontSize: 36 }}>🔒</div>
            <div className="locked-text">Solo el Administrador puede acceder a los reportes — RN-10</div>
          </div>
        )}
        
        <div className="card-title">Generar Reporte de Período</div>
        
        <div className="grid-3 mb-16">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Mes</label>
            <select className="form-select" value={mes} onChange={e => setMes(Number(e.target.value))}>
              {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Año</label>
            <select className="form-select" value={year} onChange={e => setYear(Number(e.target.value))}>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <button className="btn btn-primary" onClick={generar} disabled={loading || !isAdmin}>
              {loading ? "Generando..." : "📊 Generar"}
            </button>
            <button className="btn btn-secondary" onClick={descargarCSV} disabled={!isAdmin}>
              ⬇️ CSV
            </button>
          </div>
        </div>
        
        {result && (
          <div>
            <div className="sep" />
            {result.alterado && (
              <div className="alert alert-warning mb-16">
                <span className="alert-icon">⚠️</span>
                Este reporte contiene transacciones que fueron modificadas post-registro. Verificar auditoría.
              </div>
            )}
            
            <div className="grid-4 mb-16">
              <div className="stat-card">
                <div className="stat-label">TOTAL ENTRADAS</div>
                <div className="stat-value text-green mono">{Number(result.total_entradas || 0).toFixed(2)} kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">TOTAL SALIDAS</div>
                <div className="stat-value text-red mono">{Number(result.total_salidas || 0).toFixed(2)} kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">TRANSACCIONES</div>
                <div className="stat-value mono">{result.transacciones || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">BALANCE NETO</div>
                <div className={`stat-value mono ${(result.balance_neto || 0) >= 0 ? "text-green" : "text-red"}`}>
                  {Number(result.balance_neto || 0).toFixed(2)} kg
                </div>
              </div>
            </div>
            
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Material</th>
                    <th>Proveedor</th>
                    <th>Peso (kg)</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {(!result.detalles || result.detalles.length === 0) ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "var(--text3)", padding: 24 }}>
                        Sin transacciones en este período
                      </td>
                    </tr>
                  ) : (
                    result.detalles.map((t, i) => {
                      const tipo = (t.tipo_movimiento || "").toUpperCase();
                      const esEntrada = tipo === "COMPRA" || tipo === "ENTRADA";
                      return (
                        <tr key={t.id_pesaje || i}>
                          <td className="mono">{new Date(t.fecha_creacion).toLocaleDateString("es-PE")}</td>
                          <td>♻️ {t.material?.nombre || "—"}</td>
                          <td>{t.proveedor?.nombre_completo || "—"}</td>
                          <td className={`mono ${esEntrada ? "text-green" : "text-red"}`}>
                            {esEntrada ? "+" : "−"}{Number(t.peso_kg || 0).toFixed(2)}
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
        )}
      </div>
    </div>
  );
}
