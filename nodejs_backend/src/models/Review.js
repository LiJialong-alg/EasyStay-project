import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  customer_name: { type: DataTypes.STRING, allowNull: false },
  room_type_name: { type: DataTypes.STRING }, // Snapshot of room type name
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  content: { type: DataTypes.TEXT },
  reply: { type: DataTypes.TEXT },
  is_highlight: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'reviews', timestamps: true })
