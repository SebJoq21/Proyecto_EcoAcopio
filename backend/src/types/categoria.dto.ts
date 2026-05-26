export interface CreateCategoriaDTO {
  id_empresa: string; // Obligatorio para saber de quién es la categoría
  nombre: string;
}

export interface UpdateCategoriaDTO {
  nombre?: string;
}