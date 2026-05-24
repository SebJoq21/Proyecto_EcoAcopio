// Datos obligatorios para crear una empresa nueva
export interface CreateEmpresaDTO {
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  logo_url?: string; // Opcional
}

// Datos opcionales para actualizar una empresa existente
export interface UpdateEmpresaDTO {
  razon_social?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  is_active?: boolean;
}