import Diner from '../models/diner';
import database from '../config/database';
import { DatabaseError } from '../utils/errors';


const sequelize = database.getSequelize();

export const getDinersByIds = async (dinerIds: string[]): Promise<Diner[]> => {
  const sequelize = database.getSequelize();
  try {
    return await Diner.findAll({
      where: {
        id: dinerIds,
      },
    });
  } catch (error) {
    console.error('Database error while fetching diners:', error);
    throw new DatabaseError('Failed to fetch diners from database');
  }
};

export const createDiner = async (name: string, dietaryRestrictions: string[]): Promise<Diner> => {
  try {
    return await sequelize.transaction(async (t) => {
      const diner = Diner.build({ name, dietaryRestrictions });
      return await diner.save({ transaction: t });
    });
  } catch (error) {
    console.error('Database error while creating diner:', error);
    throw new DatabaseError('Failed to create diner in database');
  }
};

export const updateDiner = async (
  id: string,
  name: string,
  dietaryRestrictions: string[]
): Promise<[number, Diner[]]> => {
  try {
    return await sequelize.transaction(async (t) => {
      return Diner.update(
        {
          name,
          dietaryRestrictions,
        },
        {
          where: { id },
          returning: true,
          transaction: t,
        }
      );
    });
  } catch (error) {
    console.error('Database error while updating diner:', error);
    throw new DatabaseError('Failed to update diner in database');
  }
};

export const deleteDiner = async (id: string): Promise<number> => {
  try {
    return await sequelize.transaction(async (t) => {
      return Diner.destroy({
        where: { id },
        transaction: t,
      });
    });
  } catch (error) {
    console.error('Database error while deleting diner:', error);
    throw new DatabaseError('Failed to delete diner from database');
  }
};