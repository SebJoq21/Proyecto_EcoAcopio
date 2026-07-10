const sanitize = (data: any): string => {
  if (data === undefined || data === null) return "";
  
  let str = "";
  // Extraemos la información útil dependiendo del tipo de dato
  if (data instanceof Error) {
    str = data.stack || data.message;
  } else if (typeof data === "object") {
    try {
      str = JSON.stringify(data);
    } catch {
      str = "[Objeto no serializable]";
    }
  } else {
    str = String(data);
  }
  
  // Elimina retornos de carro y saltos de línea para evitar inyección de logs falsos
  return str.replace(/[\r\n]+/g, " | ");
};

export const logger = {
  info: (message: string, meta?: any) => {
    // Solo agregamos el segundo argumento si existe, evitando el string vacío al final
    const extraArgs = meta !== undefined ? [sanitize(meta)] : [];
    console.log(`\x1b[36m[INFO]\x1b[0m ${sanitize(message)}`, ...extraArgs);
  },
  
  success: (message: string, meta?: any) => {
    const extraArgs = meta !== undefined ? [sanitize(meta)] : [];
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${sanitize(message)}`, ...extraArgs);
  },
  
  warn: (message: string, meta?: any) => {
    const extraArgs = meta !== undefined ? [sanitize(meta)] : [];
    console.warn(`\x1b[33m[WARN]\x1b[0m ${sanitize(message)}`, ...extraArgs);
  },
  
  error: (message: string, error?: any) => {
    const extraArgs = error !== undefined ? [sanitize(error)] : [];
    console.error(`\x1b[31m[ERROR]\x1b[0m ${sanitize(message)}`, ...extraArgs);
  }
};