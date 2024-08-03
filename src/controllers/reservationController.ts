import { Request, Response, NextFunction } from 'express';
import { createNewReservation, removeReservation } from '../services/reservationService';
import { BusinessLogicError, DatabaseError, NotFoundError, ValidationError } from '../utils/errors';
import { isValidDate } from '../utils/dateUtils';

export const createReservationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { restaurantId, dinerIds, time, restaurantName } = req.body;

  if (!restaurantId || typeof restaurantId !== 'string') {
    return next(new ValidationError('Invalid or missing restaurantId'));
  }

  if (!dinerIds || !Array.isArray(dinerIds) || dinerIds.length === 0) {
    return next(new ValidationError('Invalid or missing dinerIds'));
  }

  if (!time || !isValidDate(time)) {
    if (new Date(time) < new Date()) {
      console.warn(`Attempted to create a reservation for a past time: ${time}`);
    }
    return next(new ValidationError('Invalid or missing time'));
  }

  try {
    const reservation = await createNewReservation(restaurantId, dinerIds, new Date(time), restaurantName);
    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof BusinessLogicError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof DatabaseError) {
      res.status(500).json({ error: 'An error occurred while creating the reservation' });
    } else {
      console.error('Unexpected error:', error);
      next(error);
    }
  }
};

export const deleteReservationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { reservationId } = req.params;

  try {
    await removeReservation(reservationId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ error: error.message });
    } else {
      next(error);
    }
  }
};