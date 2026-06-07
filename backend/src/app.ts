import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(cors());
app.use(express.json());


app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use('/api/v1', routes);
app.use(errorHandler);


export default app;