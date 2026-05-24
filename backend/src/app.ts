import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes'; // <--- 1. Importas tus rutas

const app: Application = express();

app.use(cors());
app.use(express.json());

// Ruta base de prueba
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. Le dices a Express que use tus rutas con el prefijo oficial
app.use('/api/v1', routes);

export default app;