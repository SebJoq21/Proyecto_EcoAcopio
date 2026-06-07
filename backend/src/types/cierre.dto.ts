export interface CreateCierreDTO {
  id_empresa: string;
  id_usuario: string; // El gerente que realiza el cierre
  mes: number;
  anio: number;
}