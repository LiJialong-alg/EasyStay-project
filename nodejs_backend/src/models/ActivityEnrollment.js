import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const ActivityEnrollment = sequelize.define('ActivityEnrollment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false },
  activity_code: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  start_at: { type: DataTypes.DATE, allowNull: true },
  end_at: { type: DataTypes.DATE, allowNull: true },
  pricing_mode: { type: DataTypes.STRING, allowNull: false, defaultValue: 'manual' },
  discount_type: { type: DataTypes.STRING, allowNull: true },
  discount_value: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
}, { tableName: 'activity_enrollments', timestamps: true })
