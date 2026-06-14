import { useState, useEffect } from "react";
import { Api } from "../services/api";

export default function AuditoriaPage({ app, showToast }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const user = Api.getUser();
    if (!user || !user.id_empresa) return;
    Api.auditoria(100).then((res) => {
      console.log('Datos de auditoría recibidos:', res);
      setLogs(res);
    }).catch(e => showToast("error", "Error cargando auditoría: " + e.message));
  }, []);

  const hoy = new Date();
  const logsHoy = logs.filter((log) => {
    if (!log?.fecha_creacion) return false;
    const f = new Date(log.fecha_creacion);
    return f.getFullYear() === hoy.getFullYear() &&
           f.getMonth() === hoy.getMonth() &&
           f.getDate() === hoy.getDate();
  });

const getBadgeStyle = (accion) => {
  switch (accion) {
    case 'CREAR':
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    case 'ACTUALIZAR':
      return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    case 'ELIMINAR':
      return 'bg-red-500/10 text-red-500 border border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
  }
};

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔍 Log de Auditoría</h1>
        <p className="page-sub">Registro inmutable de todas las modificaciones — RN-12</p>
      </div>
      <div className="grid-21">
        <div className="card">
          <div className="card-title">Historial de Cambios</div>
          {!logs
            ? <div style={{ textAlign: "center", padding: 24 }}><span className="spinner" style={{ width: 24, height: 24 }} /></div>
            : logs.length === 0
              ? <div style={{ textAlign: "center", padding: 24, color: "var(--text2)" }}>Aún no hay modificaciones registradas en el sistema</div>
              : <ul className="divide-y divide-slate-800/50">
                {logs.map((log) => (
                  <li 
                    key={log.id_auditoria} 
                    className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Lado Izquierdo: Badge y Textos */}
                    <div className="flex items-center gap-4">
                      {/* Badge de Acción */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wider ${getBadgeStyle(log.accion)}`}>
                        {log.accion}
                      </span>

                      {/* Información del Usuario y Entidad */}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">
                          {log.usuario?.nombres} {log.usuario?.apellidos}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          modificó el registro de <span className="font-semibold text-slate-400">{log.entidad}</span>
                        </span>
                      </div>
                    </div>

                    {/* Lado Derecho: Fecha y Hora */}
                    <div className="text-right flex flex-col">
                      <span className="text-sm text-slate-300">
                        {new Date(log.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {new Date(log.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>}
        </div>
        <div className="card">
          <div className="card-title">Resumen de Actividad</div>
          {logs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="stat-card">
                <div className="stat-label">TOTAL CAMBIOS</div>
                <div className="stat-value text-amber text-3xl font-bold">{logs?.length || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">HOY</div>
                <div className="stat-value">{logsHoy?.length || 0}</div>
              </div>
              <div style={{ background: "var(--amber-bg)", border: "1px solid var(--amber-border)", borderRadius: "var(--r)", padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)", marginBottom: 4 }}>RN-12 ACTIVO</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>Todo cambio realizado queda registrado en este log inmutable.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
