export interface UsuarioInput {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: string;
}

export interface CreateEmpresaDTO {
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  logo_url?: string;
  usuario: UsuarioInput;
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