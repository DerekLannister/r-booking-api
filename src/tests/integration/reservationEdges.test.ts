import request from 'supertest';
import { Sequelize } from 'sequelize-typescript';
import app from '../../app';
import { initializeDatabase, getSequelize } from '../../config/database';
import Diner from '../../models/diner';
import Restaurant from '../../models/restaurant';
import TableTop from '../../models/tableTop';
import Reservation from '../../models/reservation';
import { v4 as uuidv4 } from 'uuid';

describe('Reservation Edge Cases', () => {
  let sequelize: Sequelize;
  let restaurantId: string;
  let dinerIds: string[];
  let baseTime: Date;

  beforeAll(async () => {
    await initializeDatabase();
    sequelize = getSequelize();
    await sequelize.sync({ force: true });

    const restaurant = await Restaurant.create({
      id: uuidv4(),
      name: 'Test Restaurant',
      endorsements: JSON.stringify(['Nut-allergy-friendly', 'Gluten-free-friendly', 'Vegan-friendly']),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await TableTop.create({
      id: uuidv4(),
      restaurantId: restaurant.id,
      capacity: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (let i = 0; i < 10; i++) {
      await Diner.create({
        id: uuidv4(),
        name: `Diner ${i + 1}`,
        dietaryRestrictions: JSON.stringify(i % 2 === 0 ? [] : ['Vegan']),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Set baseTime to 2 hours from now
    baseTime = new Date();
    baseTime.setHours(baseTime.getHours() + 2);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Reservation System', () => {
    beforeAll(async () => {
      const restaurant = await Restaurant.findOne({ where: { name: 'Test Restaurant' } });
      restaurantId = restaurant!.id;

      const diners = await Diner.findAll();
      dinerIds = diners.map(diner => diner.id);
    });

    it('should allow a reservation at this restaurant (base case)', async () => {
      const reservationTime = new Date(baseTime);

      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[0], dinerIds[1]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should not allow booking a table that has an existing reservation in time window', async () => {
      const reservationTime = new Date(baseTime);
      reservationTime.setDate(baseTime.getDate() + 1);
      reservationTime.setHours(18, 0, 0, 0);

      await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[0], dinerIds[1]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      //try again for the next hour
      const overlappingTime = new Date(reservationTime);
      overlappingTime.setHours(19, 0, 0, 0);

      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[2], dinerIds[3]],
          time: overlappingTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No available table found for the given criteria');
    });

    it('should not allow booking a table that overlaps (near the edges of the reservation time window)', async () => {
      const reservationTime = new Date(baseTime);
      reservationTime.setDate(baseTime.getDate() + 2);
      reservationTime.setHours(20, 0, 0, 0);

      await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[4], dinerIds[5]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      const overlappingTime = new Date(reservationTime);
      overlappingTime.setHours(18, 30, 0, 0);

      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[6], dinerIds[7]],
          time: overlappingTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No available table found for the given criteria');
    });

    it('should allow booking a table that does not overlap with existing reservations (base)', async () => {
      const reservationTime = new Date(baseTime);
      reservationTime.setDate(baseTime.getDate() + 1); // just set somme valid future time
      reservationTime.setHours(20, 0, 0, 0); 

      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[8], dinerIds[9]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should not allow reservation with more diners than the table capacity', async () => {
      const reservationTime = new Date(baseTime);
      reservationTime.setDate(baseTime.getDate() + 4); //6pm in 4 days
      reservationTime.setHours(18, 0, 0, 0); 

      const response = await request(app)
        .post('/api/reservations')
        .send({
          restaurantId,
          dinerIds: [dinerIds[0], dinerIds[1], dinerIds[2], dinerIds[3], dinerIds[4]],
          time: reservationTime.toISOString(),
          restaurantName: 'Test Restaurant',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
