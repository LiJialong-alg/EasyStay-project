import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER }, // 下单用户ID（可选）
  customer_name: { type: DataTypes.STRING, allowNull: false }, // 入住人姓名
  contact_phone: { type: DataTypes.STRING }, // 联系电话
  hotel_id: { type: DataTypes.INTEGER, allowNull: false }, // 酒店ID
  room_type_id: { type: DataTypes.INTEGER, allowNull: false }, // 房型ID
  check_in_date: { type: DataTypes.DATEONLY, allowNull: false }, // 入住日期
  check_out_date: { type: DataTypes.DATEONLY, allowNull: false }, // 离店日期
  room_count: { type: DataTypes.INTEGER, defaultValue: 1 }, // 预订房间数
  total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // 订单总金额
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending(待支付/待处理) | confirmed(已确认) | checked_in(在住) | completed(已离店) | cancelled(已取消)
}, { tableName: 'orders', timestamps: true })
