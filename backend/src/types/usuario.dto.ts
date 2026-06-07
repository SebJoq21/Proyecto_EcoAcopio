export interface CreateUsuarioDTO {
  id_empresa: string;
  nombres: string;
  apellidos: string;
  email: string;
  contrasena: string;
  rol: string;      
  telefono?: string; 
}

export interface UpdateUsuarioDTO {
  nombres?: string;
  apellidos?: string;
  email?: string;
  contrasena?: string;
  rol?: string;
  telefono?: string;
  activo?: boolean;
}