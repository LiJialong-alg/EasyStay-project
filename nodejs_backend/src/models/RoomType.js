import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const RoomType = sequelize.define('RoomType', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  hotel_id: { type: DataTypes.INTEGER, allowNull: false }, // 所属酒店ID
  name: { type: DataTypes.STRING, allowNull: false }, // 房型名称
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // 基础价格
  activity_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, //活动价格
  total_stock: { type: DataTypes.INTEGER, defaultValue: 0 }, // 总库存量
  description: { type: DataTypes.TEXT }, // 房型描述
  status: { type: DataTypes.STRING, defaultValue: 'available' }, // available(可售) | sold_out(售罄) | offline(下线)
  image_url: { type: DataTypes.STRING }, // 房型图片
  image_urls: { type: DataTypes.TEXT }, // 房型图片列表（JSON string）
  offline_reason: { type: DataTypes.TEXT }, // 下线原因（展示给商家）
  audit_status: { type: DataTypes.STRING, defaultValue: 'approved' }, // pending | approved | rejected
  audit_reason: { type: DataTypes.TEXT }, // 审核/驳回原因（展示给商家）
  bed_type: { type: DataTypes.STRING }, // 床型
  room_size_sqm: { type: DataTypes.DECIMAL(6, 1) }, // 房间大小（㎡）
  floor_info: { type: DataTypes.STRING }, // 层数/楼层信息
  has_wifi: { type: DataTypes.BOOLEAN, defaultValue: true },
  has_window: { type: DataTypes.BOOLEAN, defaultValue: true },
  has_housekeeping: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_non_smoking: { type: DataTypes.BOOLEAN, defaultValue: true },
  includes_breakfast: { type: DataTypes.BOOLEAN, defaultValue: false },
  guest_facilities: { type: DataTypes.TEXT }, // 客房设施（JSON string）
  food_drink: { type: DataTypes.TEXT }, // 饮品和食品（JSON string）
  furniture: { type: DataTypes.TEXT }, // 家具设施（JSON string）
  bathroom_facilities: { type: DataTypes.TEXT }, // 卫浴设施（JSON string）
}, { tableName: 'room_types', timestamps: true })
