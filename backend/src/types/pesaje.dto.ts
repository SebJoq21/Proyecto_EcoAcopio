export interface CreatePesajeDTO {
  id_empresa: string;
  id_usuario: string; // Quien registra el pesaje (lo sacaremos del Token)
  id_material: string;
  id_proveedor: string;
  tipo_movimiento: string; // Ej: "COMPRA" o "VENTA"
  peso_kg: number;
  precio_unitario: number;
  total_pagado: number;
  observaciones?: string;
  estado?: string; // Opcional, tu BD ya tiene "Completado" por defecto
}

// En transacciones contables normalmente NO se actualizan montos libremente,
// pero dejaremos la interfaz lista por si se necesita corregir alguna observación o estado (ej. "Anulado")
export interface UpdatePesajeDTO {
  id_material?: string;
  id_proveedor?: string;
  tipo_movimiento?: string;
  peso_kg?: number;
  precio_unitario?: number;
  total_pagado?: number;
  observaciones?: string;
  estado?: string;
}