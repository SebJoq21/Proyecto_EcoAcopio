import { useState, useEffect } from "react";
import "./index.css"; 

import { Api } from "./services/api";
import { useToast, ToastContainer } from "./hooks/useToast";
import { useClock } from "./hooks/useClock";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import PesajePage from "./pages/pesaje";
import InventarioPage from "./pages/inventario";
import ScannerPage from "./pages/scanner";
import CategoriasPage from "./pages/categorias";
import ProveedoresPage from "./pages/proveedores";
import ReportesPage from "./pages/reportes";
import MaterialesPage from "./pages/materiales";
import AuditoriaPage from "./pages/auditoria";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [app, setApp] = useState({ materiales: [], proveedores: [], role: null });
  const { toasts, show: showToast } = useToast();
  const clock = useClock();

  useEffect(() => {
    const token = Api.getToken();
    const u = Api.getUser();
    if (token && u) {
      Api.me().then(() => {
        setUser(u); setRole(u.rol);
        setApp(a => ({ ...a, role: u.rol }));
        cargarDatos();
      }).catch(() => Api.clearToken());
    }
  }, []);

  const cargarDatos = async () => {
    try {
      const [matsData, provsData, invData] = await Promise.all([
        Api.materiales(false), 
        Api.proveedores(), 
        Api.inventario()
      ]);
      
      const inv = {};
      (invData.items || invData || []).forEach(i => { 
        const idMat = i.id_material || i.id;
        inv[idMat] = parseFloat(i.stock_kg || i.cantidad || 0); 
      });

      const mats = (matsData || []).map(m => ({
        id_material: m.id_material, 
        id: m.id_material, 
        codigo: m.etiqueta || m.codigo, 
        nombre: m.nombre, 
        id_categoria: m.id_categoria,
        categoria: m.categoria || "—",
        precio: parseFloat(m.precio_referencial_kg || m.precio || 0), 
        activo: m.activo || m.active || false,
        emoji: m.emoji || "♻️", 
        stock_kg: inv[m.id_material] ?? 0,
      }));

      const provs = (provsData || []).map(p => ({
        id_proveedor: p.id_proveedor || p.id_provider || p.id,            
        nombre_completo: p.nombre_completo || "Anónimo", 
        numero_documento: p.numero_documento || "—",
        tipo_documento: p.tipo_documento || "—", 
        telefono: p.telefono || "—",
        es_anonimo: p.es_anonimo || false,
        total_transacciones: p.total_transacciones || 0,
      }));

      setApp({ materiales: mats, proveedores: provs, role: Api.getUser()?.rol });
    } catch (e) { 
      console.error("Error cargando datos relacionales en App.jsx:", e); 
    }
  };

  const handleLogin = (u) => {
    setUser(u); setRole(u.rol);
    setApp(a => ({ ...a, role: u.rol }));
    cargarDatos();
    showToast("success", "🔓 Sesión iniciada correctamente");
    setPage("dashboard");
  };

  const handleLogout = async () => {
    await Api.logout();
    setUser(null); setRole(null);
    setApp({ materiales: [], proveedores: [], role: null });
  };

  const isAdmin = role === "admin";
  
  // 🛡️ SOLUCIÓN EVITAR PANTALLA NEGRA: Forzar transformación estricta a Number
  const totalStock = (app.materiales || []).reduce((s, m) => s + Number(m.stock_kg || 0), 0);

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard", section: "Principal" },
    { id: "pesaje", icon: "⚖️", label: "Registro de Pesaje", section: "Principal" },
    { id: "inventario", icon: "📦", label: "Inventario", section: "Principal" },
    { id: "scanner", icon: "🤖", label: "Escáner IA", section: "Principal" },
    { id: "categorias", icon: "🏷️", label: "Categorías", section: "Gestión", adminOnly: true },
    { id: "proveedores", icon: "👥", label: "Proveedores", section: "Gestión" },
    { id: "reportes", icon: "📋", label: "Reportes", section: "Gestión", adminOnly: true },
    { id: "materiales", icon: "🏷️", label: "Lista Maestra", section: "Gestión", adminOnly: true },
    { id: "auditoria", icon: "🔍", label: "Auditoría", section: "Gestión", adminOnly: true, badge: true },
  ];

  const renderPage = () => {
    const props = { app, showToast, onRefresh: cargarDatos, onNav: setPage };
    switch (page) {
      case "dashboard": return <DashboardPage {...props} />;
      case "pesaje": return <PesajePage {...props} />;
      case "inventario": return <InventarioPage {...props} />;
      case "scanner": return <ScannerPage {...props} />;
      case "categorias": return <CategoriasPage showToast={showToast} />;
      case "proveedores": return <ProveedoresPage {...props} />;
      case "reportes": return <ReportesPage {...props} />;
      case "materiales": return <MaterialesPage {...props} />;
      case "auditoria": return <AuditoriaPage {...props} />;
      default: return null;
    }
  };

  return (
    <>
      {!user && <LoginPage onLogin={handleLogin} showToast={showToast} />}

      {user && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="topbar">
            <div className="logo">
              <div className="logo-icon">♻️</div>
              <div>
                <span className="logo-text">EcoAcopio</span>
                <span className="logo-sub">Centro de Acopio Digital</span>
              </div>
            </div>
            <div className="topbar-divider" />
            <span className="topbar-time">{clock}</span>
            <div className="notif-btn" style={{ marginLeft: "auto" }}>
              🔔<div className="notif-dot" />
            </div>
            <div className="user-badge" onClick={handleLogout} title="Cerrar sesión">
              <span style={{ fontSize: 13, color: "var(--text1)" }}>{user.nombre} {user.apellido}</span>
              <span className={`user-role-pill ${isAdmin ? "role-admin" : "role-operario"}`}>{isAdmin ? "Admin" : "Operario"}</span>
              <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 6 }}>↩</span>
            </div>
          </div>

          <div className="layout">
            <nav className="sidebar">
              {["Principal", "Gestión"].map(section => {
                const items = navItems.filter(n => n.section === section && (!n.adminOnly || isAdmin));
                if (items.length === 0) return null;
                return (
                  <div className="sidebar-section" key={section}>
                    <div className="sidebar-label">{section}</div>
                    {items.map(n => (
                      <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
                        <span className="nav-icon">{n.icon}</span>
                        {n.label}
                        {n.badge && <span className="nav-badge">!</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
              <div className="sidebar-footer">
                <div className="sidebar-stat">
                  <div className="sidebar-stat-label">STOCK TOTAL HOY</div>
                  <div className="sidebar-stat-value">{Number(totalStock || 0).toFixed(1)} kg</div>
                  <div className="sidebar-stat-sub">{app.materiales.filter(m => m.stock_kg > 0).length} materiales</div>
                </div>
              </div>
            </nav>

            <main className="main">{renderPage()}</main>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}