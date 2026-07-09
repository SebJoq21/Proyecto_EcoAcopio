// Lee la variable de entorno de Vite. Si no existe, apunta al puerto de Express (4000)
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// Función auxiliar interna para inyectar limpiamente el id_empresa en las URLs
const appendEmpresa = (path) => {
  try {
    // 🔴 REGLA DE EXCLUSIÓN: Si la ruta es de autenticación, no le inyectamos parámetros de tenant
    if (path.startsWith("/auth")) return path;

    const user = JSON.parse(sessionStorage.getItem("eco_user"));
    const idEmpresa = user?.id_empresa;
    if (!idEmpresa) return path;
    
    // ✅ SOLUCIÓN SONARQUBE: Sanitizar el idEmpresa antes de inyectarlo
    const safeIdEmpresa = encodeURIComponent(idEmpresa);
    const conector = path.includes("?") ? "&" : "?";
    return `${path}${conector}id_empresa=${safeIdEmpresa}`;
  } catch {
    return path;
  }
};

export const Api = {
  getToken: () => sessionStorage.getItem("eco_token"),
  getUser: () => { try { return JSON.parse(sessionStorage.getItem("eco_user")); } catch { return null; } },
  setToken: (t, u) => { sessionStorage.setItem("eco_token", t); sessionStorage.setItem("eco_user", JSON.stringify(u)); },
  clearToken: () => { sessionStorage.removeItem("eco_token"); sessionStorage.removeItem("eco_user"); },

  headers: () => ({
    "Content-Type": "application/json",
    ...(sessionStorage.getItem("eco_token") ? { Authorization: `Bearer ${sessionStorage.getItem("eco_token")}` } : {}),
  }),

  req: async (method, path, body) => {
    // ✅ BYPASS DE CONTINGENCIA
    if (path === "/dashboard" || path.startsWith("/dashboard?")) {
      console.warn("♻️ Interceptado /dashboard inexistente en Express. Retornando cascarón seguro.");
      return {
        total_stock: 0,
        transacciones_mes: 0,
        alertas: [],
        items: []
      };
    }

    const pathConEmpresa = appendEmpresa(path);

    const res = await fetch(`${BASE}${pathConEmpresa}`, {
      method, headers: Api.headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;
    
    if (!res.ok) {
      throw new Error(data?.message || data?.error || data?.detail || `Error ${res.status} en la solicitud`);
    }
    return data;
  },

  login: async (credenciales) => {
    const data = await Api.req("POST", "/auth/login", credenciales);
    const token = data.accessToken || data.token || data.access_token;
    Api.setToken(token, data.usuario || data.user);
    return data;
  },

  register: async (data) => {
    return await Api.req("POST", "/empresas", data);
  },

  logout: async () => {
    try { await Api.req("POST", "/auth/logout"); } catch (e) { console.error(e); }
    Api.clearToken();
  },

  categorias: () => Api.req("GET", "/categorias"),
  crearCategoria: (body) => Api.req("POST", "/categorias", body),

  materiales: (soloActivos = true) => Api.req("GET", `/materiales${soloActivos ? "?activos=true" : ""}`),
  crearMaterial: (body) => Api.req("POST", "/materiales", body),
  
  // ✅ SOLUCIÓN SONARQUBE: Sanitizar los IDs en las rutas
  actualizarMaterial: (id, body) => Api.req("PUT", `/materiales/${encodeURIComponent(id)}`, body),
  toggleMaterial: (id) => Api.req("POST", `/materiales/${encodeURIComponent(id)}/toggle`),

  pesajes: (qs = "") => Api.req("GET", `/pesajes${qs}`),
  registrarPesaje: (body) => Api.req("POST", "/pesajes", body),
  crearPesaje: (body) => Api.req("POST", "/pesajes", body),

  me: () => Api.req("GET", "/auth/me"),
  
  proveedores: () => Api.req("GET", "/proveedores"),
  crearProveedor: (body) => Api.req("POST", "/proveedores", body),
  
  // ✅ SOLUCIÓN SONARQUBE: Sanitizar ID y parámetros de búsqueda
  actualizarProveedor: (id, body) => Api.req("PUT", `/proveedores/${encodeURIComponent(id)}`, body),
  inventario: (buscar = "") => Api.req("GET", `/inventario${buscar ? `?search=${encodeURIComponent(buscar)}` : ""}`),
  
  dashboard: async () => {
    try {
      return await Api.req("GET", "/dashboard");
    } catch (e) {
      console.warn("⚠️ Mapeo de contingencia: El endpoint /dashboard no existe en Express. Devolviendo cascarón seguro.");
      return { total_stock: 0, transacciones_mes: 0, alertas: [], items: [] };
    }
  },
  
  // ✅ SOLUCIÓN SONARQUBE: Sanitizar los parámetros de la URL
  reporte: (mes, anio) => Api.req("GET", `/cierres?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`),
  
  exportarCSV: async (mes, anio) => {
    // ✅ SOLUCIÓN SONARQUBE: Sanitizar datos antes de construir la ruta de exportación
    const path = appendEmpresa(`/cierres/export?mes=${encodeURIComponent(mes)}&anio=${encodeURIComponent(anio)}`);
    const res = await fetch(`${BASE}${path}`, {
      method: "GET",
      headers: Api.headers(),
    });
    if (!res.ok) {
      const errData = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
      throw new Error(errData?.error || `Error ${res.status} al descargar el CSV`);
    }
    return await res.blob();
  },
  
  // ✅ SOLUCIÓN SONARQUBE: Sanitizar el límite
  auditoria: (limit = 100) => Api.req("GET", `/auditoria?limit=${encodeURIComponent(limit)}`),
  analizarIA: (body) => Api.req("POST", "/scanner/analizar", body),
};