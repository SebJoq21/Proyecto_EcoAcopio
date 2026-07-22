import { useState, useEffect } from "react";
import { Api } from "../services/api";

// 1. Estilos en línea puros en lugar de clases de Tailwind
const getBadgeStyle = (accion) => {
  const baseStyle = { 
    padding: '4px 12px', 
    borderRadius: '20px', 
    fontSize: '11px', 
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  };

  switch (accion) {
    case 'CREAR':
      return { ...baseStyle, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' };
    case 'ACTUALIZAR':
      return { ...baseStyle, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-border)' };
    case 'ELIMINAR':
      return { ...baseStyle, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' };
    default:
      return { ...baseStyle, background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' };
  }
};

export default function AuditoriaPage({ app, showToast }) {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = Api.getUser();
    if (!user || !user.id_empresa) {
      setCargando(false);
      return;
    }

    Api.auditoria(100)
      .then((res) => {
        setLogs(res);
      })
      .catch((e) => {
        showToast("error", "Error cargando auditoría: " + e.message);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  const hoy = new Date();
  const logsHoy = logs.filter((log) => {
    if (!log?.fecha_creacion) return false;
    const f = new Date(log.fecha_creacion);
    return (
      f.getFullYear() === hoy.getFullYear() &&
      f.getMonth() === hoy.getMonth() &&
      f.getDate() === hoy.getDate()
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔍 Log de Auditoría</h1>
        <p className="page-sub">Registro inmutable de todas las modificaciones — RN-12</p>
      </div>
      
      <div className="grid-21" style={{ alignItems: "flex-start" }}>
        {/* COLUMNA IZQUIERDA: HISTORIAL */}
        <div className="card" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--text3) transparent" }}>
          <div className="card-title">Historial de Cambios</div>
          
          {cargando ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "var(--text2)" }}>
              Aún no hay modificaciones registradas en el sistema
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {logs.map((log) => (
                <li 
                  key={log.id_auditoria} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  {/* Lado Izquierdo: Badge y Textos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={getBadgeStyle(log.accion)}>
                      {log.accion}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text1)' }}>
                        {log.usuario?.nombres} {log.usuario?.apellidos}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text2)' }}>
                        modificó el registro de <span style={{ fontWeight: '600', color: 'var(--text1)' }}>{log.entidad}</span>
                      </span>
                    </div>
                  </div>

                  {/* Lado Derecho: Fecha y Hora */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text2)' }}>
                      {new Date(log.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                      {new Date(log.fecha_creacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="card" style={{ position: "sticky", top: 24 }}>
          <div className="card-title">Resumen de Actividad</div>
          {!cargando && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="stat-card">
                <div className="stat-label">TOTAL CAMBIOS</div>
                <div className="stat-value text-amber" style={{ fontSize: '30px', fontWeight: 'bold' }}>{logs.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">HOY</div>
                <div className="stat-value" style={{ fontSize: '30px', fontWeight: 'bold' }}>{logsHoy.length}</div>
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