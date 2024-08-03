import Reservation from '../models/reservation';
import database from '../config/database'
import { DatabaseError } from '../utils/errors';
import { CreationAttributes } from 'sequelize';

type ReservationCreationAttributes = CreationAttributes<Reservation>;


const sequelize = database.getSequelize();

export const createReservation = async (
  data: ReservationCreationAttributes
): Promise<Reservation> => {
  try {
    return await sequelize.transaction(async (t) => {
      return await Reservation.create(data, { transaction: t });
    });
  } catch (error) {
    console.error('Database error while creating reservation:', error);
    throw new DatabaseError('Failed to create reservation in database');
  }
};

export const deleteReservation = async (reservationId: string): Promise<number> => {
  try {
    return await sequelize.transaction(async (t) => {
      return Reservation.destroy({
        where: {
          id: reservationId,
        },
        transaction: t,
      });
    });
  } catch (error) {
    console.error('Database error while deleting reservation:', error);
    throw new DatabaseError('Failed to delete reservation from database');
  }
};