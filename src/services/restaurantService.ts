import { getDinersByIds } from '../repositories/dinerRepository';
import { getRestaurantsWithAvailableTables } from '../repositories/restaurantRepository';
import { addHours } from '../utils/dateUtils';
import { BusinessLogicError } from '../utils/errors';
import Restaurant from '../models/restaurant';
import database from '../config/database';
import { parseStringArray } from '../utils/sanitizers';

//todo: normally i would set these up as classes and use DI. might refactor but these were simple requirements. (in a distributed systen, services are cattle not pets)

export const getAvailableRestaurants = async (dinerIds: string[], time: Date): Promise<Restaurant[]> => {
  const sequelize = database.getSequelize();
  try {
    const diners = await getDinersByIds(dinerIds);
    console.log('Diners:', diners);

    const dietaryRestrictions = diners.flatMap((diner) => parseStringArray(diner.dietaryRestrictions));
    console.log('Dietary Restrictions:', dietaryRestrictions);

    const uniqueDietaryRestrictions = [...new Set(dietaryRestrictions)];
    console.log('Unique Dietary Restrictions:', uniqueDietaryRestrictions);

    const endTime = addHours(time, 2);
    const restaurants = await getRestaurantsWithAvailableTables(diners.length, time, endTime);
    console.log('Restaurants with available tables:', restaurants);

    const filteredRestaurants = restaurants.filter((restaurant) => {
      const restaurantEndorsements = parseStringArray(restaurant.endorsements)
    
      console.log(`Restaurant: ${restaurant.name}, Endorsements: ${restaurantEndorsements}`);
    
      return uniqueDietaryRestrictions.every((restriction) =>
        restaurantEndorsements.some((endorsement) =>
          endorsement.toLowerCase() === `${restriction.toLowerCase()}-friendly`
        )
      );
    });

    return filteredRestaurants;
  } catch (error) {
    console.error('Error finding available restaurants:', error);
    throw new BusinessLogicError('Failed to find available restaurants');
  }
};
