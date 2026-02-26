import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const ActivityRoomPrice = sequelize.define('ActivityRoomPrice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  activity_code: { type: DataTypes.STRING, allowNull: false },
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  room_type_id: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  start_at: { type: DataTypes.DATE, allowNull: true },
  end_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'activity_room_prices', timestamps: true })
