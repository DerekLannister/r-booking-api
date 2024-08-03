import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import apiRoutes from './routes/api';
import errorHandler from './middlewares/errorHandler';
import database from './config/database';

const app = express();

app.use(express.json());

const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRoutes);

app.use(errorHandler);

export const initApp = async () => {
  await database.initializeDatabase();
  return app;
};

export default app;