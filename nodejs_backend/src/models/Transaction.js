import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false }, // 关联订单ID
  type: { type: DataTypes.STRING, allowNull: false }, // 类型: income(收入) | refund(退款) | withdrawal(提现)
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // 交易金额
  status: { type: DataTypes.STRING, defaultValue: 'success' }, // success(成功) | failed(失败) | pending(处理中)
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // 交易时间
}, { tableName: 'transactions', timestamps: false })
