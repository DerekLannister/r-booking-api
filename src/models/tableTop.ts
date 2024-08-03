import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Restaurant from './restaurant';
import Reservation from './reservation';

@Table({
  tableName: 'TableTops',
})
export default class TableTop extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Restaurant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  restaurantId!: string;

  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  capacity!: number;

  @HasMany(() => Reservation)
  reservations!: Reservation[];
}