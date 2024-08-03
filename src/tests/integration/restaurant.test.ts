import request from 'supertest';
import app from '../../app';
import Diner from '../../models/diner';
import Restaurant from '../../models/restaurant';
import TableTop from '../../models/tableTop';
import { Sequelize } from 'sequelize-typescript';
import { getSequelize, closeDatabase } from '../../config/database';


process.env.NODE_ENV = 'test';

describe('Restaurant API', () => {
  let sequelize: Sequelize;
  beforeAll(async () => {
    sequelize = getSequelize();
    await sequelize.sync({ force: true });
    
    
    
    await Diner.bulkCreate([
      { name: 'John', dietaryRestrictions: ['Vegan'] },
      { name: 'Jane', dietaryRestrictions: ['Vegetarian'] }
    ]);
    
    const restaurants = await Restaurant.bulkCreate([
      { name: 'Vegan Place', endorsements: ['Vegan-friendly', 'Vegetarian-friendly'] },
      { name: 'Meat Lovers', endorsements: [] }
    ]);
    
    await TableTop.bulkCreate([
      { restaurantId: restaurants[0].id, capacity: 4 },
      { restaurantId: restaurants[1].id, capacity: 2 }
    ]);

    console.log('Test data created successfully');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should find available restaurants', async () => {
    const diners = await Diner.findAll();
    const dinerIds = diners.map(diner => diner.id);
    let baseTime = new Date();
    baseTime.setHours(baseTime.getHours() + 2);
    
    const response = await request(app)
      .get('/api/restaurants/available')
      .query({
        dinerIds: dinerIds,
        time: baseTime
      });

    console.log('Response body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Vegan Place');
  });
});