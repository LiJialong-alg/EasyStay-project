import express from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Op } from 'sequelize'
import { Hotel, RoomType, RoomDailyInventory, User, Order, Review, Promotion, HotelListingRequest, ActivityRoomPrice } from '../models/index.js'
import { ok, error } from '../utils/response.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

const uploadDir = path.join(process.cwd(), 'uploads', 'hotels')
fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg'
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!okTypes.includes(file.mimetype)) return cb(new Error('仅支持 JPG/PNG/WebP 图片'))
    cb(null, true)
  },
})

/**
 * @route GET /hotels
 * @desc 获取商家名下的所有酒店列表
 * @desc 包含酒店的房型概览（用于计算最低价），但不包含详细库存
 * @access Private
 */
router.get('/hotels', async (req, res) => {
  const whereHotel = req.user?.role === 'merchant' ? { owner_id: req.user.id } : {}
  const data = await Hotel.findAll({ 
    where: whereHotel,
    include: [
      { 
        model: RoomType, 
        attributes: [
          'id',
          'name',
          'base_price',
          'total_stock',
          'status',
          'image_url',
          'image_urls',
          'offline_reason',
          'audit_status',
          'audit_reason',
          'bed_type',
          'room_size_sqm',
          'floor_info',
          'has_wifi',
          'has_window',
          'has_housekeeping',
          'is_non_smoking',
          'includes_breakfast',
          'guest_facilities',
          'food_drink',
          'furniture',
          'bathroom_facilities',
          'description',
          'createdAt',
          'updatedAt',
        ] 
      },
      {
        model: User,
        as: 'Owner',
        attributes: ['name', 'username']
      }
    ],
    order: [['id','ASC']] 
  })
  const today = new Date().toISOString().split('T')[0]
  const roomTypeIds = data.flatMap((h) => (h.RoomTypes || []).map((rt) => rt.id))
  const todayInv = roomTypeIds.length > 0
    ? await RoomDailyInventory.findAll({
      where: { room_type_id: { [Op.in]: roomTypeIds }, date: today },
      attributes: ['room_type_id', 'status'],
      raw: true,
    })
    : []
  const todayStatusMap = new Map(todayInv.map((i) => [i.room_type_id, i.status]))
  // Calculate min price for each hotel
  const result = data.map(h => {
    const plain = h.get({ plain: true })
    const prices = (plain.RoomTypes || []).map(rt => rt.base_price)
    plain.minPrice = prices.length > 0 ? Math.min(...prices) : 0
    // Keep RoomTypes for frontend use
    plain.image_urls = plain.image_urls ? (() => { try { return JSON.parse(plain.image_urls) } catch { return plain.image_urls } })() : null
    plain.RoomTypes = (plain.RoomTypes || []).map((rt) => {
      const dayStatus = todayStatusMap.get(rt.id)
      const nextStatus = plain.listed
        ? (rt.status === 'offline' ? 'offline' : (dayStatus || (rt.status === 'sold_out' ? 'available' : rt.status)))
        : 'offline'
      return {
        ...rt,
        status: nextStatus,
        offline_reason: plain.listed ? rt.offline_reason : (rt.offline_reason || plain.unlist_reason || '酒店已下线'),
        image_urls: rt.image_urls ? (() => { try { return JSON.parse(rt.image_urls) } catch { return rt.image_urls } })() : null,
      }
    })
    return plain
  })
  ok(res, result)
})

router.post('/uploads/hotel-image', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到图片文件' })
  const imageUrl = `/uploads/hotels/${req.file.filename}`
  ok(res, { url: imageUrl })
})

router.post('/hotels/:id/image', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到图片文件' })
  const hotel = await Hotel.findByPk(req.params.id)
  if (!hotel) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  const imageUrl = `/uploads/hotels/${req.file.filename}`
  await Hotel.update({ image_url: imageUrl }, { where: { id: req.params.id } })
  const data = await Hotel.findByPk(req.params.id)
  ok(res, data)
})

router.patch('/hotels/:id', async (req, res) => {
  const { name, address, status, latitude, longitude, image_urls, star_level, description } = req.body || {}
  const hotel = await Hotel.findByPk(req.params.id)
  if (!hotel) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  const update = {}
  if (name !== undefined) update.name = name
  if (address !== undefined) update.address = address
  if (latitude !== undefined) update.latitude = latitude
  if (longitude !== undefined) update.longitude = longitude
  if (status !== undefined) update.status = status
  if (star_level !== undefined) update.star_level = star_level
  if (description !== undefined) update.description = description
  if (image_urls !== undefined) {
    const urls = Array.isArray(image_urls) ? image_urls : []
    update.image_urls = JSON.stringify(urls)
    update.image_url = urls.length > 0 ? urls[0] : null
  }
  await Hotel.update(update, { where: { id: req.params.id } })
  const data = await Hotel.findByPk(req.params.id)
  ok(res, data)
})

router.delete('/hotels/:id', requireRole(['merchant', 'admin']), async (req, res) => {
  const id = Number(req.params.id)
  const hotel = await Hotel.findByPk(id)
  if (!hotel) return error(res, 404, 'Not found')
  if (req.user?.role === 'merchant' && hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const orderCount = await Order.count({ where: { hotel_id: id } })
  if (orderCount > 0) return error(res, 400, '酒店存在订单，无法删除')

  const roomTypeRows = await RoomType.findAll({ where: { hotel_id: id }, attributes: ['id'], raw: true })
  const roomTypeIds = roomTypeRows.map((r) => r.id)

  if (roomTypeIds.length > 0) {
    await RoomDailyInventory.destroy({ where: { room_type_id: { [Op.in]: roomTypeIds } } })
  }
  await RoomType.destroy({ where: { hotel_id: id } })
  await Review.destroy({ where: { hotel_id: id } })
  await Promotion.destroy({ where: { hotel_id: id } })
  await HotelListingRequest.destroy({ where: { hotel_id: id } })
  await Hotel.destroy({ where: { id } })
  ok(res, true)
})

router.patch('/hotels/:id/listing', requireRole(['admin']), async (req, res) => {
  const { listed, reason } = req.body
  const hotel = await Hotel.findByPk(req.params.id)
  if (!hotel) return res.status(404).json({ code: 404, message: 'Not found' })
  const nextListed = Boolean(listed)
  if (nextListed) {
    return res.status(400).json({ code: 400, message: 'Use listing request approval to list hotel' })
  }
  await Hotel.update(
    { listed: nextListed, unlist_reason: nextListed ? null : (reason || null) },
    { where: { id: req.params.id } }
  )
  if (!nextListed) {
    await RoomType.update(
      { status: 'offline', offline_reason: '平台已下线' },
      { where: { hotel_id: req.params.id } }
    )
  }
  ok(res, true)
})

router.patch('/hotels/:id/self-listing', requireRole(['merchant']), async (req, res) => {
  const id = Number(req.params.id)
  const hotel = await Hotel.findByPk(id)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const nextListed = Boolean(req.body?.listed)
  const reason = (req.body?.reason || '').toString().trim()

  if (!nextListed) {
    await Hotel.update(
      { listed: false, unlist_reason: `商家自主下线${reason ? `：${reason}` : ''}` },
      { where: { id } }
    )
    await RoomType.update(
      { status: 'offline', offline_reason: '商家自主下线' },
      { where: { hotel_id: id } }
    )
    ok(res, true)
    return
  }

  const unlistReason = (hotel.unlist_reason || '').toString()
  if (!unlistReason.startsWith('商家自主下线')) {
    return error(res, 400, '平台下线酒店不可由商家自主上线')
  }
  await Hotel.update({ listed: true, unlist_reason: null }, { where: { id } })
  await RoomType.update(
    { status: 'available', offline_reason: null },
    { where: { hotel_id: id, status: 'offline', offline_reason: '商家自主下线', audit_status: 'approved' } }
  )
  ok(res, true)
})

/**
 * @route PATCH /hotels/:id/status
 * @desc 修改酒店的营业状态
 * @param {string} status - 'operating' (营业中) | 'closed' (休息中)
 * @access Private
 */
router.patch('/hotels/:id/status', async (req, res) => {
  const { status } = req.body // operating|closed
  const hotel = await Hotel.findByPk(req.params.id)
  if (!hotel) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  await Hotel.update({ status }, { where: { id: req.params.id } })
  ok(res, true)
})

/**
 * @route GET /hotels/:id/room-types
 * @desc 获取指定酒店的所有房型列表
 * @access Private
 */
router.get('/hotels/:id/room-types', async (req, res) => {
  const hotel = await Hotel.findByPk(req.params.id)
  if (!hotel) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant' && hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  const data = await RoomType.findAll({ where: { hotel_id: req.params.id } })
  ok(res, data)
})

router.post('/hotels/:id/room-types', requireRole(['merchant']), async (req, res) => {
  const hotelId = Number(req.params.id)
  const hotel = await Hotel.findByPk(hotelId)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const payload = req.body || {}
  const name = (payload.name || '').toString().trim()
  const basePrice = Number(payload.base_price)
  const totalStock = Number(payload.total_stock)
  if (!name) return error(res, 400, 'name required')
  if (!Number.isFinite(basePrice) || basePrice <= 0) return error(res, 400, 'base_price invalid')
  if (!Number.isFinite(totalStock) || totalStock <= 0) return error(res, 400, 'total_stock invalid')

  const data = await RoomType.create({
    hotel_id: hotelId,
    name,
    base_price: basePrice,
    total_stock: totalStock,
    status: 'offline',
    audit_status: 'pending',
    audit_reason: null,
    offline_reason: '待平台审核',
    description: payload.description !== undefined ? (payload.description || null) : null,
    bed_type: payload.bed_type !== undefined ? (payload.bed_type || null) : null,
    room_size_sqm: payload.room_size_sqm !== undefined && payload.room_size_sqm !== null ? Number(payload.room_size_sqm) : null,
    floor_info: payload.floor_info !== undefined ? (payload.floor_info || null) : null,
    has_wifi: payload.has_wifi !== undefined ? Boolean(payload.has_wifi) : true,
    has_window: payload.has_window !== undefined ? Boolean(payload.has_window) : true,
    has_housekeeping: payload.has_housekeeping !== undefined ? Boolean(payload.has_housekeeping) : true,
    is_non_smoking: payload.is_non_smoking !== undefined ? Boolean(payload.is_non_smoking) : true,
    includes_breakfast: payload.includes_breakfast !== undefined ? Boolean(payload.includes_breakfast) : false,
    guest_facilities: payload.guest_facilities !== undefined ? (Array.isArray(payload.guest_facilities) ? JSON.stringify(payload.guest_facilities) : payload.guest_facilities) : null,
    food_drink: payload.food_drink !== undefined ? (Array.isArray(payload.food_drink) ? JSON.stringify(payload.food_drink) : payload.food_drink) : null,
    furniture: payload.furniture !== undefined ? (Array.isArray(payload.furniture) ? JSON.stringify(payload.furniture) : payload.furniture) : null,
    bathroom_facilities: payload.bathroom_facilities !== undefined ? (Array.isArray(payload.bathroom_facilities) ? JSON.stringify(payload.bathroom_facilities) : payload.bathroom_facilities) : null,
    image_urls: payload.image_urls ? JSON.stringify(Array.isArray(payload.image_urls) ? payload.image_urls : []) : null,
    image_url: payload.image_urls && Array.isArray(payload.image_urls) && payload.image_urls.length > 0 ? payload.image_urls[0] : null,
  })
  ok(res, data)
})

router.delete('/hotels/room-types/:id', requireRole(['merchant']), async (req, res) => {
  const id = Number(req.params.id)
  const room = await RoomType.findByPk(id)
  if (!room) return error(res, 404, 'Not found')

  const hotel = await Hotel.findByPk(room.hotel_id)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const orderCount = await Order.count({ where: { room_type_id: id } })
  if (orderCount > 0) return error(res, 400, '房型存在订单，无法删除')

  await RoomDailyInventory.destroy({ where: { room_type_id: id } })
  await ActivityRoomPrice.destroy({ where: { room_type_id: id } })
  await RoomType.destroy({ where: { id } })
  ok(res, true)
})

/**
 * @route PATCH /hotels/room-types/:id
 * @desc 修改房型基本信息（如默认价格、状态）
 * @access Private
 */
router.patch('/hotels/room-types/:id', async (req, res) => {
  const {
    base_price,
    name,
    total_stock,
    description,
    status,
    audit_status,
    audit_reason,
    bed_type,
    room_size_sqm,
    floor_info,
    has_wifi,
    has_window,
    has_housekeeping,
    is_non_smoking,
    includes_breakfast,
    guest_facilities,
    food_drink,
    furniture,
    bathroom_facilities,
    image_urls,
  } = req.body || {}

  if (req.user?.role === 'merchant' && (audit_status !== undefined || audit_reason !== undefined)) {
    return res.status(403).json({ code: 403, message: 'Forbidden' })
  }

  const update = {}
  const existing = await RoomType.findByPk(req.params.id)
  if (!existing) return res.status(404).json({ code: 404, message: 'Not found' })
  const parentHotel = await Hotel.findByPk(existing.hotel_id)
  if (!parentHotel) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant') {
    if (parentHotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  }
  if (!parentHotel.listed && status !== undefined && status !== 'offline') {
    return res.status(400).json({ code: 400, message: 'Hotel is unlisted; room type must stay offline' })
  }
  const oldBase = existing ? Number(existing.base_price) : null
  if (base_price !== undefined) update.base_price = base_price
  if (name !== undefined) update.name = name
  if (total_stock !== undefined) update.total_stock = total_stock
  if (description !== undefined) update.description = description
  if (status !== undefined) update.status = status
  if (audit_status !== undefined) update.audit_status = audit_status
  if (audit_reason !== undefined) update.audit_reason = audit_reason
  if (bed_type !== undefined) update.bed_type = bed_type
  if (room_size_sqm !== undefined) update.room_size_sqm = room_size_sqm
  if (floor_info !== undefined) update.floor_info = floor_info
  if (has_wifi !== undefined) update.has_wifi = has_wifi
  if (has_window !== undefined) update.has_window = has_window
  if (has_housekeeping !== undefined) update.has_housekeeping = has_housekeeping
  if (is_non_smoking !== undefined) update.is_non_smoking = is_non_smoking
  if (includes_breakfast !== undefined) update.includes_breakfast = includes_breakfast
  if (guest_facilities !== undefined) update.guest_facilities = Array.isArray(guest_facilities) ? JSON.stringify(guest_facilities) : guest_facilities
  if (food_drink !== undefined) update.food_drink = Array.isArray(food_drink) ? JSON.stringify(food_drink) : food_drink
  if (furniture !== undefined) update.furniture = Array.isArray(furniture) ? JSON.stringify(furniture) : furniture
  if (bathroom_facilities !== undefined) update.bathroom_facilities = Array.isArray(bathroom_facilities) ? JSON.stringify(bathroom_facilities) : bathroom_facilities
  if (image_urls !== undefined) {
    const urls = Array.isArray(image_urls) ? image_urls : []
    update.image_urls = JSON.stringify(urls)
    update.image_url = urls.length > 0 ? urls[0] : null
  }
  await RoomType.update(update, { where: { id: req.params.id } })

  if (base_price !== undefined && oldBase !== null) {
    const today = new Date().toISOString().split('T')[0]
    await RoomDailyInventory.update(
      { price: base_price },
      {
        where: {
          room_type_id: req.params.id,
          date: { [Op.gte]: today },
          price: oldBase,
        },
      }
    )
  }
  ok(res, true)
})

export default router
