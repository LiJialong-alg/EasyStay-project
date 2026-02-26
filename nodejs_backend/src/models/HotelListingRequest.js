import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const HotelListingRequest = sequelize.define('HotelListingRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' }, // pending | approved | rejected
  reason: { type: DataTypes.TEXT },
  admin_comment: { type: DataTypes.TEXT },
  reviewed_at: { type: DataTypes.DATE },
}, { tableName: 'hotel_listing_requests', timestamps: true })

