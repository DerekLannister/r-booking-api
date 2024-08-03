import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import app from '../../app';
import { initializeDatabase, getSequelize } from '../../config/database';
import Diner from '../../models/diner';
import Restaurant from '../../models/restaurant';
import TableTop from '../../models/tableTop';
import Reservation from '../../models/reservation';

process.env.NODE_ENV = 'test';

describe('Reservation API', () => {
  let sequelize: Sequelize;
  let restaurantId: string;
  let dinerIds: string[];
  let baseTime: Date; // use a dynamic time

  beforeAll(async () => {
    await initializeDatabase();
    sequelize = getSequelize();
    await sequelize.sync({ force: true });
    
    try {
      const diners = await Diner.bulkCreate([
        { name: 'John', dietaryRestrictions: ['Vegan'] },
        { name: 'Jane', dietaryRestrictions: ['Vegetarian'] },
        { name: 'Bob', dietaryRestrictions: ['Gluten-free'] },
        { name: 'Alice', dietaryRestrictions: ['Nut-allergy'] },
        { name: 'Charlie', dietaryRestrictions: ['Vegan'] },
        { name: 'Diana', dietaryRestrictions: ['Vegetarian'] },
        { name: 'Eve', dietaryRestrictions: ['Gluten-free'] },
        { name: 'Frank', dietaryRestrictions: ['Nut-allergy'] }
      ]);
      dinerIds = diners.map(diner => diner.id);
      
      const restaurant = await Restaurant.create({ 
        name: 'Test Restaurant', 
        endorsements: ['Vegan-friendly', 'Vegetarian-friendly', 'Gluten-free-friendly', 'Allergy-aware'] 
      });
      restaurantId = restaurant.id;
      
      await TableTop.bulkCreate([
        { restaurantId: restaurant.id, capacity: 2 },
        { restaurantId: restaurant.id, capacity: 2 },
        { restaurantId: restaurant.id, capacity: 4 },
        { restaurantId: restaurant.id, capacity: 4 },
        { restaurantId: restaurant.id, capacity: 5 },
        { restaurantId: restaurant.id, capacity: 6 },
        { restaurantId: restaurant.id, capacity: 8 },
        { restaurantId: restaurant.id, capacity: 10 }
      ]);

      baseTime = new Date();
      baseTime.setHours(baseTime.getHours() + 2);

      console.log('Test data created');
    } catch (error) {
      console.error('Error setting up test data:', error);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a reservation', async () => {
    const reservationTime = new Date(baseTime);
    reservationTime.setDate(baseTime.getDate() + 1);

    const response = await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: [dinerIds[0], dinerIds[1]],
        time: reservationTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });

    console.log('Create reservation response:', response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.restaurantId).toBe(restaurantId);
    expect(response.body.dinerIds).toEqual(expect.arrayContaining([dinerIds[0], dinerIds[1]]));
  });

  it('should not allow double booking for a diner', async () => {
    const firstReservationTime = new Date(baseTime);
    firstReservationTime.setDate(baseTime.getDate() + 2);
    firstReservationTime.setHours(19, 0, 0, 0);

    await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: [dinerIds[2]],
        time: firstReservationTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });

    const secondReservationTime = new Date(firstReservationTime);
    secondReservationTime.setHours(firstReservationTime.getHours() + 1);

    const response = await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: [dinerIds[2]],
        time: secondReservationTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('One or more diners already have a reservation during this time');
  });

  it('should book at the smallest available table that fits the party size', async () => {
    const reservationTime = new Date(baseTime);
    reservationTime.setDate(baseTime.getDate() + 3);
    reservationTime.setHours(19, 0, 0, 0);

    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[i]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant'
        });
    }
  
    const response = await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: dinerIds.slice(4, 8), 
        time: reservationTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    
    const reservation = await Reservation.findByPk(response.body.id, {
      include: [TableTop]
    });
    expect(reservation?.tableTop.capacity).toBe(5); // smallest table with capacity >= 4 that isn't booked
  });

  it('should not allow reservations to be created for past times', async () => {
    const pastTime = new Date(); // now is now past
  
    const response = await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: [dinerIds[0], dinerIds[1]],
        time: pastTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid or missing time');
  });

  it('should not allow querying available restaurants for past times', async () => {
    const pastTime = new Date(); // same reason, now is past
  
    const response = await request(app)
      .get('/api/restaurants/available')
      .query({
        dinerIds: dinerIds.slice(0, 2), 
        time: pastTime.toISOString()
      });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Invalid or missing time');
  });
  
  it('should delete a reservation', async () => {
    const reservationTime = new Date(baseTime);
    reservationTime.setDate(baseTime.getDate() + 1); 
    reservationTime.setHours(19, 0, 0, 0);

    const createResponse = await request(app)
      .post('/api/reservations')
      .send({
        restaurantId,
        dinerIds: [dinerIds[0]],
        time: reservationTime.toISOString(),
        restaurantName: 'Test Restaurant'
      });

    const reservationId = createResponse.body.id;

    const deleteResponse = await request(app)
      .delete(`/api/reservations/${reservationId}`);

    expect(deleteResponse.status).toBe(204);

    const deletedReservation = await Reservation.findByPk(reservationId);
    expect(deletedReservation).toBeNull();
  });
});
