import { TipoMovimientoFinanciero } from '@prisma/client';

export interface CreateMovimientoDTO {
  id_empresa: string;
  id_proveedor: string;
  id_usuario: string;
  id_pesaje?: string; // Opcional, solo si el movimiento viene de un pesaje
  tipo_movimiento: TipoMovimientoFinanciero; // 'CARGO' o 'ABONO'
  monto: number;
  concepto: string;
}