import { initApp } from './app';
import dotenv from 'dotenv';


dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const app = await initApp();
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs are available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();