import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const HotelRegistrationRequest = sequelize.define('HotelRegistrationRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: true },
  latitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
  star_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  description: { type: DataTypes.TEXT, allowNull: true },
  image_urls: { type: DataTypes.TEXT, allowNull: true },
  room_types: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' }, // pending | approved | rejected
  reason: { type: DataTypes.TEXT, allowNull: true },
  admin_comment: { type: DataTypes.TEXT, allowNull: true },
  reviewed_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'hotel_registration_requests', timestamps: true })
