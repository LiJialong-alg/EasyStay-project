import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const ChatMessage = sequelize.define('ChatMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_role: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'chat_messages', timestamps: true })

