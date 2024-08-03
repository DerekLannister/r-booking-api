import { Sequelize } from 'sequelize-typescript';
import Diner from '../models/diner';
import Restaurant from '../models/restaurant';
import TableTop from '../models/tableTop';
import Reservation from '../models/reservation';

// test will run in memory, otherwise use permanent storage.
const storage = process.env.NODE_ENV === 'test' ? ':memory:' : './database.sqlite';

let sequelize: Sequelize | null = null;

export const initializeDatabase = async (): Promise<Sequelize> => {
  if (!sequelize) {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: false,
      models: [Diner, Restaurant, TableTop, Reservation],
    });
    await sequelize.sync({ force: true });
  }
  return sequelize;
};

export const getSequelize = (): Sequelize => {
  if (!sequelize) {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: false,
      models: [Diner, Restaurant, TableTop, Reservation],
    });
  }
  return sequelize;
};

export const closeDatabase = async (): Promise<void> => {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
  }
};

export default {
  initializeDatabase,
  getSequelize,
  closeDatabase,
};