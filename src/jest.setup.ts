import { initializeDatabase } from './config/database';

export default async (): Promise<void> => {
  await initializeDatabase();
};