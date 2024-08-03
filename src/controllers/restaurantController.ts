import { Request, Response, NextFunction } from 'express';
import { getAvailableRestaurants } from '../services/restaurantService';
import { ValidationError } from '../utils/errors';
import { isValidDate } from '../utils/dateUtils';

export const getAvailableRestaurantsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { dinerIds, time } = req.query;

  if (!dinerIds || !time) {
    return next(new ValidationError('Missing or invalid parameters'));//todo: split this into individual checks for better error logs.
  }

  if (!isValidDate(time as string)) {
    if (new Date(time as string) < new Date()) {
      console.warn(`Attempted to query available restaurants for a past time: ${time}`);
    }
    return next(new ValidationError('Invalid or missing time'));
  }
  if( !Array.isArray(dinerIds) && typeof(dinerIds) === "string"){
    dinerIds = [dinerIds]
  }

  try {
    const availableRestaurants = await getAvailableRestaurants(dinerIds as string[], new Date(time as string));
    const response = availableRestaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      endorsements: restaurant.endorsements}))


    res.json(response);
  } catch (error) {
    next(error);
  }
};
