import { Sequelize, DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

class Diner extends Model {}
Diner.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    dietaryRestrictions: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Diner' }
);

class Restaurant extends Model {}
Restaurant.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    endorsements: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Restaurant' }
);

class TableTop extends Model {}
TableTop.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    restaurantId: DataTypes.STRING,
    capacity: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'TableTop' }
);

class Reservation extends Model {}
Reservation.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tableTopId: DataTypes.STRING,
    restaurantId: DataTypes.STRING,
    restaurantName: DataTypes.STRING,
    dinerIds: DataTypes.STRING,
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'Reservation' }
);

const dietaryOptions = [
  [],
  ['Nut-allergy'],
  ['Gluten-free'],
  ['Vegan'],
  ['Vegetarian'],
  ['Lactose-intolerant'],
];

async function seed() {
  await sequelize.sync({ force: true });

  const diners = Array.from({ length: 20 }).map((_, i) => ({
    id: uuidv4(),
    name: `Diner ${i + 1}`,
    dietaryRestrictions: JSON.stringify(
      i < 4 ? dietaryOptions[0] : dietaryOptions[Math.floor(Math.random() * dietaryOptions.length)]
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await Diner.bulkCreate(diners);

  const restaurantEndorsements = [
    ['Nut-allergy-friendly', 'Gluten-free-friendly', 'Vegetarian-friendly', 'Allergy-aware', 'Vegan-friendly'],
    ['Nut-allergy-friendly'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly', 'Allergy-aware'],
    ['Nut-allergy-friendly', 'Vegan-friendly'],
    ['Vegetarian-friendly', 'Allergy-aware', 'Gluten-free-friendly', 'Vegan-friendly', 'Nut-allergy-friendly'],
    ['Vegan-friendly', 'Vegetarian-friendly', 'Gluten-free-friendly'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly', 'Vegan-friendly', 'Vegetarian-friendly', 'Allergy-aware'],
    ['Vegetarian-friendly', 'Nut-allergy-friendly', 'Allergy-aware', 'Vegan-friendly'],
    ['Allergy-aware', 'Nut-allergy-friendly', 'Vegan-friendly', 'Vegetarian-friendly'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly'],
    ['Allergy-aware'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly', 'Vegetarian-friendly'],
    ['Nut-allergy-friendly'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly', 'Vegetarian-friendly', 'Allergy-aware', 'Vegan-friendly'],
    ['Gluten-free-friendly', 'Nut-allergy-friendly', 'Vegetarian-friendly', 'Allergy-aware', 'Vegan-friendly'],
    ['Vegetarian-friendly'],
    ['Allergy-aware', 'Nut-allergy-friendly', 'Gluten-free-friendly', 'Vegetarian-friendly', 'Vegan-friendly'],
    ['Nut-allergy-friendly', 'Allergy-aware', 'Vegan-friendly', 'Vegetarian-friendly'],
    ['Gluten-free-friendly', 'Allergy-aware', 'Nut-allergy-friendly', 'Vegetarian-friendly', 'Vegan-friendly'],
    ['Allergy-aware', 'Vegetarian-friendly'],
  ];

  const restaurants = restaurantEndorsements.map((endorsements, i) => ({
    id: uuidv4(),
    name: `Restaurant ${i + 1}`,
    endorsements: JSON.stringify(endorsements),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  restaurants.push({
    id: uuidv4(),
    name: 'Chrissys Pizza',
    endorsements: JSON.stringify(['Nut-allergy-friendly', 'Gluten-free-friendly', 'Vegetarian-friendly', 'Allergy-aware', 'Vegan-friendly']),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await Restaurant.bulkCreate(restaurants);

  const tableTops = restaurants.flatMap((restaurant, i) => {
    const numberOfTables = restaurant.name === 'Chrissys Pizza' ? 1 : 20;
    const capacity = restaurant.name === 'Chrissys Pizza' ? 4 : undefined;
    return Array.from({ length: numberOfTables }).map(() => ({
      id: uuidv4(),
      restaurantId: restaurant.id,
      capacity: capacity || Math.floor(Math.random() * 6) + 2, // Random capacity between 2 and 7
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  await TableTop.bulkCreate(tableTops);

  console.log('Seeding completed successfully.');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
});
