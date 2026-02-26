import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Hotel = sequelize.define('Hotel', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  owner_id: { type: DataTypes.INTEGER, allowNull: false }, // 酒店所属商家的ID
  name: { type: DataTypes.STRING, allowNull: false }, // 酒店名称
  hotelNameEn: { type: DataTypes.STRING, allowNull: true }, //酒店英文名，可为空
  address: { type: DataTypes.STRING }, // 酒店地址
  latitude: { type: DataTypes.DECIMAL(10, 6) }, // 纬度
  longitude: { type: DataTypes.DECIMAL(10, 6) }, // 经度
  listed: { type: DataTypes.BOOLEAN, defaultValue: true }, // 平台是否上架展示（平台下线则为 false）
  unlist_reason: { type: DataTypes.TEXT }, // 平台下线原因（展示给商家）
  status: { type: DataTypes.STRING, defaultValue: 'operating' }, // operating(营业中) | closed(休息中)
  rating: { type: DataTypes.FLOAT, defaultValue: 4.5 }, // 评分
  star_level: { type: DataTypes.INTEGER, defaultValue: 0 }, // 星级（0-5）
  description: { type: DataTypes.TEXT }, // 酒店简介
  image_url: { type: DataTypes.STRING }, // 封面图片
  image_urls: { type: DataTypes.TEXT }, // 封面图片列表（JSON string）
}, { tableName: 'hotels', timestamps: true })
