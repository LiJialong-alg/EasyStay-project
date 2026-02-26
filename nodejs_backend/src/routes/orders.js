import express from 'express'
import { Op } from 'sequelize'
import { Order, RoomType, Hotel } from '../models/index.js'
import { ok } from '../utils/response.js'

const router = express.Router()

/**
 * @route GET /orders
 * @desc 获取订单列表，支持分页和状态筛选
 * @param {number} page - 页码 (默认1)
 * @param {number} pageSize - 每页数量 (默认20)
 * @param {string} status - 订单状态筛选 (可选)
 * @access Private
 */
router.get('/orders', async (req, res) => {
  const { page = 1, pageSize = 20, status, q, checkInStart, checkInEnd, createdStart, createdEnd } = req.query
  const where = {}
  if (status) where.status = status
  if (checkInStart || checkInEnd) {
    where.check_in_date = {}
    if (checkInStart) where.check_in_date[Op.gte] = checkInStart
    if (checkInEnd) where.check_in_date[Op.lte] = checkInEnd
  }
  if (createdStart || createdEnd) {
    where.createdAt = {}
    if (createdStart) where.createdAt[Op.gte] = new Date(createdStart)
    if (createdEnd) where.createdAt[Op.lte] = new Date(createdEnd)
  }
  if (q) {
    where[Op.or] = [
      { customer_name: { [Op.like]: `%${q}%` } },
      { id: Number(q) || -1 },
    ]
  }
  const { rows, count } = await Order.findAndCountAll({
    where, 
    include: [
      req.user?.role === 'merchant'
        ? { model: Hotel, attributes: ['id', 'name', 'image_url', 'address'], where: { owner_id: req.user.id }, required: true }
        : { model: Hotel, attributes: ['id', 'name', 'image_url', 'address'] },
      {
        model: RoomType,
        attributes: ['id', 'name', 'image_url', 'bed_type', 'room_size_sqm', 'floor_info', 'has_wifi', 'has_window', 'has_housekeeping', 'is_non_smoking', 'includes_breakfast'],
      },
    ],
    offset: (page - 1) * pageSize, 
    limit: Number(pageSize), 
    order: [['createdAt','DESC']]
  })
  ok(res, { list: rows, total: count, page: Number(page), pageSize: Number(pageSize) })
})

/**
 * @route GET /orders/:id
 * @desc 获取单个订单详情
 * @access Private
 */
router.get('/orders/:id', async (req, res) => {
  const data = await Order.findByPk(req.params.id, { include: [{ model: Hotel, attributes: ['id', 'owner_id'] }] })
  if (!data) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && data.Hotel?.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  ok(res, data)
})

/**
 * @route PATCH /orders/:id/status
 * @desc 更新订单状态
 * @param {string} status - 新状态 (checked_in, completed, cancelled 等)
 * @access Private
 */
router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body
  const data = await Order.findByPk(req.params.id, { include: [{ model: Hotel, attributes: ['id', 'owner_id'] }] })
  if (!data) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && data.Hotel?.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  await Order.update({ status }, { where: { id: req.params.id } })
  ok(res, true)
})

/**
 * @route PUT /orders/settings
 * @desc 更新接单设置（目前为占位接口）
 * @access Private
 */
router.put('/orders/settings', async (req, res) => {
  // 简化为占位接口，前端可提交酒店/房型策略参数
  ok(res, true)
})

export default router
