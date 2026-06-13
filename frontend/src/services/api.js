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
    
    const conector = path.includes("?") ? "&" : "?";
    return `${path}${conector}id_empresa=${idEmpresa}`;
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
    // ✅ BYPASS DE CONTINGENCIA: Si la app pide el dashboard pero Express no tiene la ruta,
    // devolvemos un objeto seguro simulado inmediatamente para que React pinte la interfaz limpia.
    if (path === "/dashboard" || path.startsWith("/dashboard?")) {
      console.warn("♻️ Interceptado /dashboard inexistente en Express. Retornando cascarón seguro.");
      return {
        total_stock: 0,
        transacciones_mes: 0,
        alertas: [],
        items: [] // Añade aquí llaves vacías que use tu dashboard si es necesario
      };
    }

    // El resto de la función se queda exactamente igual:
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
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales),
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || data.error || data.detail || "Credenciales incorrectas");
    }
    
    const token = data.accessToken || data.token || data.access_token;
    Api.setToken(token, data.usuario || data.user);
    return data;
  },
  
  register: async (data) => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || "Error al registrar");
    return json;
  },

  logout: async () => {
    try { await Api.req("POST", "/auth/logout"); } catch (e) { console.error(e); }
    Api.clearToken();
  },

  




  // ✅ NUEVO: Endpoints para enlazar con la tabla categorias_materiales
  categorias: () => Api.req("GET", "/categorias"),
  crearCategoria: (body) => Api.req("POST", "/categorias", body),

  // ✅ REVISADO: Envío limpio para la tabla materiales (espera id_categoria como UUID)
  materiales: (soloActivos = true) => Api.req("GET", `/materiales${soloActivos ? "?activos=true" : ""}`),
  crearMaterial: (body) => Api.req("POST", "/materiales", body), // body ya llevará id_categoria
  actualizarMaterial: (id, body) => Api.req("PUT", `/materiales/${id}`, body),
  toggleMaterial: (id) => Api.req("POST", `/materiales/${id}/toggle`),

  // ✅ REVISADO: Envío limpio para la tabla pesajes
  pesajes: (qs = "") => Api.req("GET", `/pesajes${qs}`),
  registrarPesaje: (body) => Api.req("POST", "/pesajes", body),

  categorias: () => Api.req("GET", "/categorias"),
  crearCategoria: (body) => Api.req("POST", "/categorias", body),

  materiales: (soloActivos = true) => Api.req("GET", `/materiales${soloActivos ? "?activos=true" : ""}`),
  crearMaterial: (body) => Api.req("POST", "/materiales", body),

  crearPesaje: (body) => Api.req("POST", "/pesajes", body),




  me: () => Api.req("GET", "/auth/me"),
  
  // Rutas adaptadas automáticamente gracias a Api.req y appendEmpresa
  proveedores: () => Api.req("GET", "/proveedores"),
  crearProveedor: (body) => Api.req("POST", "/proveedores", body),
  actualizarProveedor: (id, body) => Api.req("PUT", `/proveedores/${id}`, body),
  inventario: (buscar = "") => Api.req("GET", `/inventario${buscar ? `?search=${buscar}` : ""}`),
  
  // ✅ CONTINGENCIA PARA EL DASHBOARD INEXISTENTE (Evita el error HTML 404)
  dashboard: async () => {
    try {
      return await Api.req("GET", "/dashboard");
    } catch (e) {
      console.warn("⚠️ Mapeo de contingencia: El endpoint /dashboard no existe en Express. Devolviendo cascarón seguro.");
      return { total_stock: 0, transacciones_mes: 0, alertas: [], items: [] };
    }
  },
  
  reporte: (mes, year) => Api.req("GET", `/reportes?mes=${mes}&year=${year}`),
  exportarCSV: (mes, year) => `${BASE}/reportes/export?mes=${mes}&year=${year}&token=${Api.getToken()}`,
  auditoria: (limit = 100) => Api.req("GET", `/auditoria?limit=${limit}`),
  analizarIA: (body) => Api.req("POST", "/scanner/analizar", body),
};