import express from 'express'
import { Transaction, Order, Hotel } from '../models/index.js'
import { ok } from '../utils/response.js'
import { Op } from 'sequelize'
import dayjs from 'dayjs'

const router = express.Router()

router.get('/finance/summary', async (req, res) => {
  const hotelIds = req.user?.role === 'merchant'
    ? (await Hotel.findAll({ where: { owner_id: req.user.id }, attributes: ['id'], raw: true })).map((h) => h.id)
    : null
  const orderInclude = hotelIds
    ? [{ model: Order, required: true, where: { hotel_id: { [Op.in]: hotelIds } }, attributes: [] }]
    : [{ model: Order, required: false, attributes: [] }]

  // Month Income
  const startOfMonth = dayjs().startOf('month').toDate()
  const endOfMonth = dayjs().endOf('month').toDate()
  const monthIncome = await Transaction.sum('amount', { 
    where: { 
      type: 'income', 
      status: 'success',
      timestamp: { [Op.between]: [startOfMonth, endOfMonth] }
    },
    include: orderInclude
  }) || 0

  // Unsettled (pending income)
  const unsettled = await Transaction.sum('amount', { 
    where: { 
      type: 'income', 
      status: 'pending' 
    },
    include: orderInclude
  }) || 0

  // Total Withdrawn
  const withdrawn = await Transaction.sum('amount', { 
    where: { 
      type: 'withdrawal', 
      status: 'success' 
    },
    include: orderInclude
  }) || 0

  // Balance Calculation (Total Income - Total Refund - Total Withdrawal)
  const allIncome = await Transaction.sum('amount', { where: { type: 'income', status: 'success' }, include: orderInclude }) || 0
  const allRefund = await Transaction.sum('amount', { where: { type: 'refund', status: 'success' }, include: orderInclude }) || 0
  const allWithdrawal = await Transaction.sum('amount', { where: { type: 'withdrawal', status: 'success' }, include: orderInclude }) || 0
  
  const balance = allIncome - allRefund - allWithdrawal

  ok(res, { monthIncome, unsettled, withdrawn, balance })
})

router.get('/finance/transactions', async (req, res) => {
  const { startDate, endDate, type, status } = req.query
  const where = {}
  const hotelIds = req.user?.role === 'merchant'
    ? (await Hotel.findAll({ where: { owner_id: req.user.id }, attributes: ['id'], raw: true })).map((h) => h.id)
    : null
  
  if (startDate && endDate) {
      where.timestamp = { [Op.between]: [new Date(startDate), new Date(endDate)] }
  }
  if (type && type !== 'all') where.type = type
  if (status && status !== 'all') where.status = status

  const include = hotelIds
    ? [{ model: Order, required: true, where: { hotel_id: { [Op.in]: hotelIds } }, attributes: [] }]
    : [{ model: Order, required: false, attributes: [] }]

  const list = await Transaction.findAll({ 
      where,
      include,
      order: [['timestamp','DESC']], 
      limit: 100 
  })
  ok(res, list)
})

export default router
