export interface CreateProveedorDTO {
  id_empresa: string;
  nombre_completo: string;
  tipo_documento?: string;   // Opcional
  numero_documento?: string; // Opcional
  telefono?: string;         // Opcional
  es_anonimo?: boolean;      // Opcional, por defecto será false según tu base de datos
}

export interface UpdateProveedorDTO {
  nombre_completo?: string;
  tipo_documento?: string;
  numero_documento?: string;
  telefono?: string;
  activo?: boolean;
  es_anonimo?: boolean;
}