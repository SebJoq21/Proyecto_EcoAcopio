import 'dotenv/config'; // Carga tu archivo .env al instante
import app from './app';

const PORT = process.env.PORT || 3000;

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`[Servidor] 🟢 Corriendo en http://localhost:${PORT}`);
      console.log(`[Healthcheck] 🩺 http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('[Servidor] 🔴 Error al iniciar:', error);
    process.exit(1); // Detiene el proceso si algo falla gravemente
  }
};

startServer();