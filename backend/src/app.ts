import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Configuración estricta de CORS para pasar la auditoría de SonarQube
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://proyecto-eco-acopio.vercel.app' // URL de tu frontend en producción
    : ['http://localhost:5173', 'http://localhost:3000'], // Puertos de desarrollo local
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Ruta base de prueba
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. Le dices a Express que use tus rutas con el prefijo oficial
app.use('/api/v1', routes);

// 3. Registramos el manejador de errores global
app.use(errorHandler);

export default app;