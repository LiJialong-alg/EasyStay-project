import express from 'express'
import { Schedule, Order, Transaction, RoomType, Hotel } from '../models/index.js'
import { ok } from '../utils/response.js'
import dayjs from 'dayjs'
import { Op } from 'sequelize'

const router = express.Router()

/**
 * @route GET /stats
 * @desc 获取首页顶部核心经营指标（营收、浏览量PV、入住率、待处理订单）
 * @access Private
 */
router.get('/stats', async (req, res) => {
  const todayStart = dayjs().startOf('day').toDate()
  const todayEnd = dayjs().endOf('day').toDate()
  const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').toDate()
  const yesterdayEnd = dayjs().subtract(1, 'day').endOf('day').toDate()

  try {
    const hotelIds = req.user?.role === 'merchant'
      ? (await Hotel.findAll({ where: { owner_id: req.user.id }, attributes: ['id'], raw: true })).map((h) => h.id)
      : null

    // 1. Pending Orders
    const ordersPending = await Order.count({ where: { status: 'pending', ...(hotelIds ? { hotel_id: { [Op.in]: hotelIds } } : {}) } })

    // 2. Revenue (Today vs Yesterday)
    const txWhereToday = {
      type: 'income',
      status: 'success',
      timestamp: { [Op.between]: [todayStart, todayEnd] }
    }
    const txWhereYesterday = {
      type: 'income',
      status: 'success',
      timestamp: { [Op.between]: [yesterdayStart, yesterdayEnd] }
    }

    const txIncludeOrder = hotelIds
      ? [{ model: Order, required: true, where: { hotel_id: { [Op.in]: hotelIds } }, attributes: [] }]
      : [{ model: Order, required: false, attributes: [] }]

    const todayRevenue = await Transaction.sum('amount', { where: txWhereToday, include: txIncludeOrder }) || 0
    const yesterdayRevenue = await Transaction.sum('amount', { where: txWhereYesterday, include: txIncludeOrder }) || 0

    // Calculate Growth Rate
    let growthRate = 0
    if (yesterdayRevenue > 0) {
        growthRate = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    } else if (todayRevenue > 0) {
        growthRate = 100
    }

    // 3. Occupancy
    const totalStock = await RoomType.sum('total_stock', { where: hotelIds ? { hotel_id: { [Op.in]: hotelIds } } : {} }) || 100
    const activeOrdersRooms = await Order.sum('room_count', { where: { status: 'checked_in', ...(hotelIds ? { hotel_id: { [Op.in]: hotelIds } } : {}) } }) || 0
    const occupancy = Math.min(Math.round((activeOrdersRooms / totalStock) * 100), 100)

    // 4. PV
    const pv = await Order.count({ where: { ...(hotelIds ? { hotel_id: { [Op.in]: hotelIds } } : {}) } })

    ok(res, { 
        revenue: todayRevenue, 
        revenueGrowth: growthRate.toFixed(1),
        pv, 
        occupancy, 
        pendingOrders: ordersPending 
    })
  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route GET /chart/revenue
 * @desc 获取首页营收趋势图表数据（支持按周/月/年筛选）
 * @access Private
 */
router.get('/chart/revenue', async (req, res) => {
  const { period } = req.query // week | month | year
  // TODO: Implement real aggregation based on period
  // For now, return different mock data to show it's working
  let series = []
  let x = []
  
  if (period === 'month') {
      series = [12000, 15000, 18000, 11000, 14000, 25000, 22000, 20000, 19000, 23000] // Mock
      x = Array.from({length: 10}, (_, i) => `${i+1}日`)
  } else if (period === 'year') {
      series = [120000, 130000, 110000, 140000, 150000, 180000, 200000, 190000, 160000, 150000, 210000, 250000]
      x = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  } else {
      // week
      series = [12000, 13200, 10100, 13400, 9000, 23000, 21000]
      x = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  }
  
  ok(res, { x, y: series })
})

/**
 * @route GET /schedules
 * @desc 获取商家的今日日程列表
 * @access Private
 */
router.get('/schedules', async (req, res) => {
  const data = await Schedule.findAll({ where: { user_id: req.user.id }, order: [['event_time','ASC']] })
  ok(res, data)
})

/**
 * @route POST /schedules
 * @desc 创建新的日程安排
 * @access Private
 */
router.post('/schedules', async (req, res) => {
  const item = await Schedule.create({
    user_id: req.user.id,
    event_content: req.body.event,
    event_time: req.body.time,
    location: req.body.loc,
    type: req.body.type || 'task',
  })
  ok(res, item)
})

/**
 * @route PUT /schedules/:id
 * @desc 更新指定日程详情
 * @access Private
 */
router.put('/schedules/:id', async (req, res) => {
  const id = req.params.id
  const updateData = {
    event_content: req.body.event,
    event_time: req.body.time,
    location: req.body.loc,
    type: req.body.type,
  }
  await Schedule.update(updateData, { where: { id, user_id: req.user.id } })
  ok(res, { id, ...updateData })
})

/**
 * @route DELETE /schedules/:id
 * @desc 删除指定日程
 * @access Private
 */
router.delete('/schedules/:id', async (req, res) => {
  await Schedule.destroy({ where: { id: req.params.id, user_id: req.user.id } })
  ok(res, true)
})

export default router
