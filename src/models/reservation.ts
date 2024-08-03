import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import TableTop from './tableTop';
import Restaurant from './restaurant';

@Table
export default class Reservation extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => TableTop)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  tableTopId!: string;

  @BelongsTo(() => TableTop)
  tableTop!: TableTop;

  @ForeignKey(() => Restaurant)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  restaurantId!: string;

  @BelongsTo(() => Restaurant)
  restaurant!: Restaurant;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  restaurantName?: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
    get() {
      return JSON.parse(this.getDataValue('dinerIds'));
    },
    set(val: string[]) {
      this.setDataValue('dinerIds', JSON.stringify(val));
    },
  })
  dinerIds!: string[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startTime!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endTime!: Date;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}