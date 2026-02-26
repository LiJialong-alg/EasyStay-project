import express from 'express'
import { ok } from '../utils/response.js'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import { User, Hotel, RoomType, Order, Transaction } from '../models/index.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

/**
 * @route GET /analytics/overview
 * @desc 获取“数据中心”页面的所有图表数据
 * @desc 包括性别比例、年龄分布、新老客分布、来源地排行等10个维度的数据
 * @access Private
 */
router.get('/analytics/overview', async (req, res) => {
  // 为前端 10 图表提供统一数据结构（示例数据）
  ok(res, {
    gender: { male: 1048, female: 735 },
    age: { buckets: ['18-25','26-35','36-45','46-55','55+'], values: [120,200,150,80,70] },
    newOld: { new: 1048, old: 735 },
    originTop3: [{ city: '杭州', value: 820 }, { city: '深圳', value: 932 }, { city: '上海', value: 1290 }],
    localVsRemote: { local: 400, remote: 600 },
    travelTimePref: { workday: 600, holiday: 400 },
    advanceBooking: { buckets: ['当天','1天','2天','3-5天','5-7天','7天+'], values: [320,210,310,410,220,1320] },
    stayDuration: { buckets: ['1晚','2晚','3晚+'], values: [800,400,230] },
    orderTime24h: Array.from({ length: 24 }, (_, i) => ({ hour: i, value: [5,2,1,0,0,1,5,12,25,45,60,55,40,45,50,65,80,120,150,140,110,80,40,20][i] })),
    roomsPerOrder: { one: 800, two: 150, many: 50 },
  })
})

/**
 * @route GET /admin/analytics/overview
 * @desc 获取管理端数据中心概览数据 (Admin)
 * @access Private (Admin only)
 */
router.get('/admin/analytics/overview', requireRole(['admin']), async (req, res) => {
  // For Admin, we aggregate data across ALL merchants/hotels
  // Currently returning same mock structure but with scaled up numbers to represent platform-wide data
  ok(res, {
    gender: { male: 10480, female: 7350 },
    age: { buckets: ['18-25','26-35','36-45','46-55','55+'], values: [1200,2000,1500,800,700] },
    newOld: { new: 10480, old: 7350 },
    originTop3: [{ city: '杭州', value: 8200 }, { city: '深圳', value: 9320 }, { city: '上海', value: 12900 }],
    localVsRemote: { local: 4000, remote: 6000 },
    travelTimePref: { workday: 6000, holiday: 4000 },
    advanceBooking: { buckets: ['当天','1天','2天','3-5天','5-7天','7天+'], values: [3200,2100,3100,4100,2200,13200] },
    stayDuration: { buckets: ['1晚','2晚','3晚+'], values: [8000,4000,2300] },
    orderTime24h: Array.from({ length: 24 }, (_, i) => ({ hour: i, value: [50,20,10,0,0,10,50,120,250,450,600,550,400,450,500,650,800,1200,1500,1400,1100,800,400,200][i] })),
    roomsPerOrder: { one: 8000, two: 1500, many: 500 },
  })
})

router.get('/admin/analytics/platform', requireRole(['admin']), async (req, res) => {
  const todayStart = dayjs().startOf('day').toDate()
  const todayEnd = dayjs().endOf('day').toDate()

  const usersTotal = await User.count()
  const merchantsTotal = await User.count({ where: { role: 'merchant' } })
  const hotelsTotal = await Hotel.count()
  const listedHotels = await Hotel.count({ where: { listed: true } })
  const roomTypesTotal = await RoomType.count()
  const ordersTotal = await Order.count()
  const pendingOrders = await Order.count({ where: { status: 'pending' } })

  const revenueTotal = (await Transaction.sum('amount', { where: { type: 'income', status: 'success' } })) || 0
  const revenueToday =
    (await Transaction.sum('amount', {
      where: { type: 'income', status: 'success', timestamp: { [Op.between]: [todayStart, todayEnd] } },
    })) || 0

  const start7d = dayjs().subtract(6, 'day').startOf('day').toDate()
  const tx7d =
    (await Transaction.findAll({
      where: { type: 'income', status: 'success', timestamp: { [Op.gte]: start7d } },
      attributes: ['amount', 'timestamp'],
      order: [['timestamp', 'ASC']],
    })) || []

  const revenueByDay = new Map()
  for (let i = 0; i < 7; i++) {
    const k = dayjs().subtract(6 - i, 'day').format('MM-DD')
    revenueByDay.set(k, 0)
  }
  tx7d.forEach((t) => {
    const k = dayjs(t.timestamp).format('MM-DD')
    if (revenueByDay.has(k)) revenueByDay.set(k, Number(revenueByDay.get(k)) + Number(t.amount))
  })

  const orders24h = await Order.findAll({ attributes: ['createdAt'], order: [['createdAt', 'DESC']] })
  const orderHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, value: 0 }))
  const last24hStart = dayjs().subtract(24, 'hour')
  orders24h.forEach((o) => {
    const d = dayjs(o.createdAt)
    if (d.isBefore(last24hStart)) return
    orderHour[d.hour()].value += 1
  })

  ok(res, {
    kpis: {
      usersTotal,
      merchantsTotal,
      hotelsTotal,
      listedHotels,
      roomTypesTotal,
      ordersTotal,
      pendingOrders,
      revenueTotal,
      revenueToday,
    },
    revenue7d: { x: Array.from(revenueByDay.keys()), y: Array.from(revenueByDay.values()) },
    orders24h: orderHour,
  })
})

export default router
