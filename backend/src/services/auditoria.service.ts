import { Prisma } from '@prisma/client';
import { auditoriaRepository } from '../repositories/auditoria.repository';
import { CreateAuditoriaDTO } from '../types/auditoria.dto';

// ============================================================================
// 1. LÓGICA DE NEGOCIO (SERVICE CLÁSICO)
// ============================================================================
export class AuditoriaService {
  async registrar(data: CreateAuditoriaDTO) {
    return await auditoriaRepository.create(data);
  }

  async obtenerHistorial(id_empresa: string) {
    return await auditoriaRepository.findAllByEmpresa(id_empresa);
  }
}

export const auditoriaService = new AuditoriaService();

// ============================================================================
// 2. EXTENSIÓN DE PRISMA 7+ (AUDITORÍA AUTOMÁTICA)
// ============================================================================
const MODELOS_AUDITABLES = ['Pesaje', 'Material', 'Proveedor', 'Inventario', 'CierreMensual'];

// Helpers internos para la extensión
const extraerId = (data: any, model: string): string | null => {
  if (!data) return null;
  const ids: Record<string, string> = {
    Pesaje: data.id_pesaje,
    Material: data.id_material,
    Proveedor: data.id_provider,
    Inventario: data.id_inventario,
    CierreMensual: data.id_cierre
  };
  return ids[model] || null;
};

const extraerIdDesdeWhere = (where: any, model: string): string | null => {
  return extraerId(where, model);
};

const sanitizar = (val: any): Record<string, any> | undefined => {
  if (!val) return undefined;
  const obj = { ...val };
  delete obj.contrasena;
  delete obj.contraseña;
  return obj;
};

/**
 * Factory Pattern: Creamos la extensión recibiendo la instancia base de Prisma.
 * Esto evita el error de "Dependencia Circular" en Node.js al importar config/prisma.
 */
export const createAuditExtension = (prismaClient: any) => Prisma.defineExtension({
  name: 'AuditoriaGlobal',
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const result = await query(args); // Ejecuta la inserción normal

        if (MODELOS_AUDITABLES.includes(model)) {
          const id = extraerId(result, model);
          const id_usuario = (result as any).id_usuario || (args.data as any)?.id_usuario;
          const id_empresa = (result as any).id_empresa || (args.data as any)?.id_empresa;

          if (id && id_usuario && id_empresa) {
            // Guardamos el log asíncronamente (.catch evita que un error de auditoría tire el servidor)
            prismaClient.auditoria.create({
              data: {
                id_empresa,
                id_usuario,
                entidad: model,
                accion: 'CREAR',
                id_registro_afectado: id,
                valores_nuevos: sanitizar(args.data)
              }
            }).catch((e: any) => console.error('[Audit Log Error - CREATE]', e));
          }
        }
        return result;
      },

      async update({ model, args, query }) {
        let before: any = null;
        if (MODELOS_AUDITABLES.includes(model)) {
          before = await prismaClient[model].findUnique({ where: args.where });
        }

        const result = await query(args); // Ejecuta la actualización

        if (MODELOS_AUDITABLES.includes(model) && before) {
          const id = extraerIdDesdeWhere(args.where, model);
          const id_usuario = (result as any).id_usuario || before?.id_usuario || (args.data as any)?.id_usuario;
          const id_empresa = before?.id_empresa;

          if (id && id_usuario && id_empresa) {
            prismaClient.auditoria.create({
              data: {
                id_empresa,
                id_usuario,
                entidad: model,
                accion: 'ACTUALIZAR',
                id_registro_afectado: id,
                valores_anteriores: sanitizar(before),
                valores_nuevos: sanitizar(args.data)
              }
            }).catch((e: any) => console.error('[Audit Log Error - UPDATE]', e));
          }
        }
        return result;
      },

      async delete({ model, args, query }) {
        let before: any = null;
        if (MODELOS_AUDITABLES.includes(model)) {
          before = await prismaClient[model].findUnique({ where: args.where });
        }

        const result = await query(args); // Ejecuta la eliminación

        if (MODELOS_AUDITABLES.includes(model) && before) {
          const id = extraerIdDesdeWhere(args.where, model);
          const id_usuario = before?.id_usuario;
          const id_empresa = before?.id_empresa;

          if (id && id_usuario && id_empresa) {
            prismaClient.auditoria.create({
              data: {
                id_empresa,
                id_usuario,
                entidad: model,
                accion: 'ELIMINAR',
                id_registro_afectado: id,
                valores_anteriores: sanitizar(before)
              }
            }).catch((e: any) => console.error('[Audit Log Error - DELETE]', e));
          }
        }
        return result;
      }
    }
  }
});