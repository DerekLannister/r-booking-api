import { Op } from 'sequelize';
import { createReservation } from '../repositories/reservationRepository';
import { findAvailableTable } from '../repositories/restaurantRepository';
import { addHours } from '../utils/dateUtils';
import { BusinessLogicError, DatabaseError, NotFoundError } from '../utils/errors';
import Reservation from '../models/reservation';
import { parseStringArray } from '../utils/sanitizers';

// for now i am leaving the restaurant name as option since i dont need it for anything but easy logging but might want it.
export const createNewReservation = async (
  restaurantId: string,
  dinerIds: string[],
  time: Date,
  restaurantName?: string
): Promise<Reservation> => {
  const startTime = new Date(time);
  const endTime = addHours(startTime, 2);

  try {
    const existingReservations = await Reservation.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: dinerIds.map(dinerId => ({
              dinerIds: {
                [Op.like]: `%${dinerId}%`
              }
            }))
          },
          {
            [Op.or]: [
              {
                startTime: {
                  [Op.lt]: endTime
                },
                endTime: {
                  [Op.gt]: startTime
                }
              }
            ]
          }
        ]
      }
    });

    //  check conflicts
    const conflictingReservations = existingReservations.filter(reservation => 
      parseStringArray(reservation.dinerIds).some(id => dinerIds.includes(id))
    );

    if (conflictingReservations.length > 0) {
      throw new BusinessLogicError('One or more diners already have a reservation during this time');
    }
    
    const availableTable = await findAvailableTable(restaurantId, dinerIds.length, startTime, endTime);
    
    if (!availableTable) {
      throw new BusinessLogicError(`No available table found for the given criteria`); 
      //todo: in actual production you would split out all of the reasons and return the right log (otherwise you are in for a headache later)
    }

    console.log('Creating reservation with dinerIds:', dinerIds);
const reservation = await createReservation({
  tableTopId: availableTable.id,
  dinerIds,
  startTime,
  endTime,
  restaurantId,
  restaurantName
});
console.log('Created reservation:', reservation);
return reservation;;
  } catch (error) {
    console.error('Error creating reservation:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    if (error instanceof BusinessLogicError) {
      throw error;
    }
    throw new DatabaseError('Failed to create reservation');
  }
};

export const removeReservation = async (reservationId: string): Promise<void> => {
  const deletedCount = await Reservation.destroy({ where: { id: reservationId } });
  if (deletedCount === 0) {
    throw new NotFoundError('Reservation not found');
  }
};
