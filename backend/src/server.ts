import app from './app';
import { ENV } from './config/env';
import { logger } from './config/logger';

const PORT = ENV.PORT;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      // Usamos tu formato con emojis, pero pasados por nuestro logger de colores
      logger.success(`🟢 Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`🩺 Healthcheck disponible en http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('🔴 Error crítico al iniciar el servidor:', error);
    process.exit(1); // Detiene el proceso si algo falla gravemente
  }
};

startServer();