import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(cors());
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