// Devuelve la fecha actual en formato ISO estandarizado
export const getCurrentIsoDate = (): string => {
  return new Date().toISOString();
};