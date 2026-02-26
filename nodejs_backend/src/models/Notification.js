import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  kind: { type: DataTypes.STRING, allowNull: false }, // system | interaction
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  ref_type: { type: DataTypes.STRING }, // review | order | ...
  ref_id: { type: DataTypes.INTEGER },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications', timestamps: true })

