import { Router } from 'express';
import { getAvailableRestaurantsHandler } from '../controllers/restaurantController';
import { createReservationHandler, deleteReservationHandler } from '../controllers/reservationController';

const router = Router();

router.get('/restaurants/available', getAvailableRestaurantsHandler);
router.post('/reservations', createReservationHandler);
router.delete('/reservations/:reservationId', deleteReservationHandler);

export default router;