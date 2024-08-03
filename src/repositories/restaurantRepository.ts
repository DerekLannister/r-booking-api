import { Op } from 'sequelize';
import Restaurant from '../models/restaurant';
import TableTop from '../models/tableTop';
import Reservation from '../models/reservation';
import database from '../config/database';
import { DatabaseError } from '../utils/errors';


const sequelize = database.getSequelize();
export const getRestaurantsWithAvailableTables = async (
  requiredCapacity: number,
  startTime: Date,
  endTime: Date
): Promise<Restaurant[]> => {
  try {
    return await Restaurant.findAll({
      include: [
        {
          model: TableTop,
          required: true,
          where: {
            capacity: {
              [Op.gte]: requiredCapacity,
            },
          },
          include: [
            {
              model: Reservation,
              required: false,
              where: {
                [Op.or]: [
                  {
                    startTime: {
                      [Op.lt]: endTime,
                    },
                    endTime: {
                      [Op.gt]: startTime,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
      where: {
        '$TableTops.Reservations.id$': null,
      },
    });
  } catch (error) {
    console.error('Database error while fetching restaurants:', error);
    throw new DatabaseError('Failed to fetch restaurants from database');
  }
};

export const createRestaurant = async (
  name: string,
  endorsements: string[]
): Promise<Restaurant> => {
  try {
    return await sequelize.transaction(async (t) => {
      const restaurant = Restaurant.build({ name, endorsements });
      return await restaurant.save({ transaction: t });
    });
  } catch (error) {
    console.error('Database error while creating restaurant:', error);
    throw new DatabaseError('Failed to create restaurant in database');
  }
};

export const updateRestaurant = async (
  id: string,
  name: string,
  endorsements: string[]
): Promise<[number, Restaurant[]]> => {
  try {
    return await sequelize.transaction(async (t) => {
      return Restaurant.update(
        {
          name,
          endorsements,
        },
        {
          where: { id },
          returning: true,
          transaction: t,
        }
      );
    });
  } catch (error) {
    console.error('Database error while updating restaurant:', error);
    throw new DatabaseError('Failed to update restaurant in database');
  }
};

export const deleteRestaurant = async (id: string): Promise<number> => {
  try {
    return await sequelize.transaction(async (t) => {
      return Restaurant.destroy({
        where: { id },
        transaction: t,
      });
    });
  } catch (error) {
    console.error('Database error while deleting restaurant:', error);
    throw new DatabaseError('Failed to delete restaurant from database');
  }
};


export const findAvailableTable = async (
  restaurantId: string,
  partySize: number,
  startTime: Date,
  endTime: Date
): Promise<TableTop | null> => {
  try {
    const availableTables = await TableTop.findAll({
      where: {
        restaurantId,
        capacity: {
          [Op.gte]: partySize
        },
      },
      include: [
        {
          model: Reservation,
          required: false,
          where: {
            [Op.or]: [
              {
                startTime: { [Op.lt]: endTime },
                endTime: { [Op.gt]: startTime },
              },
            ],
          },
        },
      ],
      order: [['capacity', 'ASC']],
    });

    console.log('Available tables:', availableTables);

    // get smallest, nonreserved table
    const suitableTable = availableTables.find(table => 
      table.capacity >= partySize && table.reservations.length === 0
    );
    
    return suitableTable || null;
  } catch (error) {
    console.error('Database error while finding available table:', error);
    throw new DatabaseError('Failed to find available table');
  }
};
