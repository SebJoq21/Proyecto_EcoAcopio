export interface CreateMaterialDTO {
  id_empresa: string;
  id_categoria: string;
  etiqueta: string; // Ej: "PET", "CARTON-1"
  nombre: string;   // Ej: "Plástico PET Transparente"
  precio_referencial_kg: number;
  emoji?: string;
}

export interface UpdateMaterialDTO {
  id_categoria?: string;
  etiqueta?: string;
  nombre?: string;
  precio_referencial_kg?: number;
  activo?: boolean;
  emoji?: string;
}