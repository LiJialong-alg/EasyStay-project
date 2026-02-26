import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false }, // 关联用户ID
  event_content: { type: DataTypes.STRING, allowNull: false }, // 日程内容
  event_time: { type: DataTypes.STRING, allowNull: false }, // 时间 (HH:mm)
  location: { type: DataTypes.STRING }, // 地点
  type: { type: DataTypes.STRING, allowNull: false }, // 类型: meeting(会议) | task(任务)
}, { tableName: 'schedules', timestamps: true })
