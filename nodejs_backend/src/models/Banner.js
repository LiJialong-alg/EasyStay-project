import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Banner = sequelize.define(
  'Banner',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    image_url: { type: DataTypes.STRING, allowNull: false },
    link_url: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: false, defaultValue: 'home' },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  },
  { tableName: 'banners', timestamps: true }
)

