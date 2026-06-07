export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`\x1b[36m[INFO]\x1b[0m ${message}`, meta ? meta : '');
  },
  success: (message: string, meta?: any) => {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`, meta ? meta : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`, meta ? meta : '');
  },
  error: (message: string, error?: any) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, error ? error : '');
  }
};