import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'notification' },
  content: { type: DataTypes.TEXT, allowNull: false },
  target_role: { type: DataTypes.STRING, defaultValue: 'merchant' },
  status: { type: DataTypes.STRING, defaultValue: 'published' },
  published_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'announcements', timestamps: true })

