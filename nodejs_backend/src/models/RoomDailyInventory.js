import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const RoomDailyInventory = sequelize.define('RoomDailyInventory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  room_type_id: { type: DataTypes.INTEGER, allowNull: false }, // 房型ID
  date: { type: DataTypes.DATEONLY, allowNull: false }, // 具体日期 (YYYY-MM-DD)
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // 当日价格
  available_stock: { type: DataTypes.INTEGER, allowNull: false }, // 当日剩余库存
  status: { type: DataTypes.STRING, defaultValue: 'available' }, // available(可售) | sold_out(售罄) | closed(关房)
}, { tableName: 'room_daily_inventory', timestamps: false })
