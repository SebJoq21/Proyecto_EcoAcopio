export type AccionAuditoria = 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR';

export interface CreateAuditoriaDTO {
  id_empresa: string;
  id_usuario: string;
  entidad: string;
  accion: AccionAuditoria;
  id_registro_afectado: string;
  valores_anteriores?: Record<string, any>;
  valores_nuevos?: Record<string, any>;
}