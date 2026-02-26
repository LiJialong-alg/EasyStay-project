import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false }, // 用户名
  password_hash: { type: DataTypes.STRING, allowNull: false }, // 密码哈希
  name: { type: DataTypes.STRING }, // 显示昵称
  avatar_url: { type: DataTypes.STRING }, // 头像链接
  role: { type: DataTypes.STRING, defaultValue: 'merchant' }, // 角色: merchant(商家) | admin(管理员)
  status: { type: DataTypes.STRING, defaultValue: 'active' }, // active | banned
  ban_reason: { type: DataTypes.TEXT }, // 封禁原因（展示给商家）
}, { tableName: 'users', timestamps: true })
