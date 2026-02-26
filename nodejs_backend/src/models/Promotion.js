import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  hotel_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  promo_type: { type: DataTypes.STRING, defaultValue: 'coupon' }, // coupon | flash | bundle
  discount_type: { type: DataTypes.STRING, defaultValue: 'amount' }, // amount | percent
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  min_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  min_nights: { type: DataTypes.INTEGER, defaultValue: 0 },
  max_uses: { type: DataTypes.INTEGER, defaultValue: 0 },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  code: { type: DataTypes.STRING },
  start_at: { type: DataTypes.DATE },
  end_at: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: 'draft' }, // draft | active | paused | ended
}, { tableName: 'promotions', timestamps: true })

