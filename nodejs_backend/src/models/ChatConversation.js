import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const ChatConversation = sequelize.define('ChatConversation', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, defaultValue: '平台客服' },
  status: { type: DataTypes.STRING, defaultValue: 'open' },
}, { tableName: 'chat_conversations', timestamps: true })

