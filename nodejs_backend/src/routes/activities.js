import express from 'express'
import { Op } from 'sequelize'
import { ok, error } from '../utils/response.js'
import { requireRole } from '../middlewares/auth.js'
import { ActivityEnrollment, ActivityRoomPrice, Hotel, RoomType } from '../models/index.js'

const router = express.Router()

const CATALOG = [
  {
    code: 'new_merchant',
    title: '学生优惠',
    subtitle: '面向学生群体的专属优惠，支持设置活动价/折扣',
    tag: '推荐',
  },
  {
    code: 'weekend_flash',
    title: '连住优惠',
    subtitle: '连住更划算，支持按折扣或活动价配置',
    tag: '热门',
  },
  {
    code: 'offseason_sale',
    title: '淡季特惠',
    subtitle: '稳定订单量，建议设置更有竞争力的活动价',
    tag: '稳定',
  },
]

router.get('/activities/catalog', requireRole(['merchant']), async (req, res) => {
  ok(res, CATALOG)
})

router.get('/activities/enrollments', requireRole(['merchant']), async (req, res) => {
  const rows = await ActivityEnrollment.findAll({
    where: { merchant_id: req.user.id },
    order: [['updatedAt', 'DESC']],
  })
  ok(res, rows)
})

router.get('/activities/:code/pricing', requireRole(['merchant']), async (req, res) => {
  const code = (req.params.code || '').toString()
  const hotelId = Number(req.query.hotel_id)
  if (!hotelId) return error(res, 400, 'hotel_id required')
  const hotel = await Hotel.findByPk(hotelId)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const enrollment = await ActivityEnrollment.findOne({
    where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code },
  })
  const prices = await ActivityRoomPrice.findAll({
    where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code },
    order: [['room_type_id', 'ASC']],
  })
  ok(res, { enrollment, room_prices: prices })
})

async function applyActivity(req, res, code) {
  const hotelId = Number(req.body?.hotel_id)
  const roomPrices = Array.isArray(req.body?.room_prices) ? req.body.room_prices : []
  const startAtRaw = req.body?.start_at
  const endAtRaw = req.body?.end_at
  const pricingMode = (req.body?.pricing_mode || 'manual').toString()
  const discountType = req.body?.discount_type ? req.body.discount_type.toString() : null
  const discountValue = req.body?.discount_value !== undefined && req.body?.discount_value !== null ? Number(req.body.discount_value) : null
  if (!hotelId) return error(res, 400, 'hotel_id required')

  const hotel = await Hotel.findByPk(hotelId)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  const startAt = startAtRaw ? new Date(startAtRaw) : null
  const endAt = endAtRaw ? new Date(endAtRaw) : null
  if (!startAt || Number.isNaN(startAt.getTime())) return error(res, 400, 'start_at required')
  if (!endAt || Number.isNaN(endAt.getTime())) return error(res, 400, 'end_at required')
  if (startAt.getTime() > endAt.getTime()) return error(res, 400, 'invalid date range')

  const ownedRoomTypes = await RoomType.findAll({
    where: { hotel_id: hotelId },
    attributes: ['id', 'base_price'],
    raw: true,
  })
  if (ownedRoomTypes.length === 0) return error(res, 400, 'no room types')

  const baseMap = new Map(ownedRoomTypes.map((r) => [r.id, Number(r.base_price)]))
  let rows = []
  if (pricingMode === 'discount') {
    if (!discountType) return error(res, 400, 'discount_type required')
    if (!Number.isFinite(discountValue)) return error(res, 400, 'discount_value required')

    if (discountType === 'rate') {
      if (discountValue <= 0 || discountValue > 10) return error(res, 400, 'discount_value invalid')
      rows = ownedRoomTypes.map((rt) => {
        const base = baseMap.get(rt.id) || 0
        const price = Number((base * discountValue / 10).toFixed(2))
        return {
          activity_code: code,
          merchant_id: req.user.id,
          hotel_id: hotelId,
          room_type_id: Number(rt.id),
          price,
          start_at: startAt,
          end_at: endAt,
        }
      })
    } else if (discountType === 'amount') {
      if (discountValue < 0) return error(res, 400, 'discount_value invalid')
      rows = ownedRoomTypes.map((rt) => {
        const base = baseMap.get(rt.id) || 0
        const price = Number((base - discountValue).toFixed(2))
        return {
          activity_code: code,
          merchant_id: req.user.id,
          hotel_id: hotelId,
          room_type_id: Number(rt.id),
          price,
          start_at: startAt,
          end_at: endAt,
        }
      })
    } else {
      return error(res, 400, 'discount_type invalid')
    }
  } else {
    const roomTypeIds = roomPrices.map((r) => Number(r.room_type_id)).filter(Boolean)
    const uniqueRoomTypeIds = Array.from(new Set(roomTypeIds))
    if (uniqueRoomTypeIds.length === 0) return error(res, 400, 'room_prices required')
    if (uniqueRoomTypeIds.length !== ownedRoomTypes.length) return error(res, 400, 'room_prices must cover all room types')

    rows = roomPrices.map((r) => ({
      activity_code: code,
      merchant_id: req.user.id,
      hotel_id: hotelId,
      room_type_id: Number(r.room_type_id),
      price: Number(r.price),
      start_at: startAt,
      end_at: endAt,
    }))
  }

  for (const row of rows) {
    if (!Number.isFinite(row.price) || row.price <= 0) return error(res, 400, 'price invalid')
    const base = baseMap.get(row.room_type_id)
    if (Number.isFinite(base) && row.price > base) return error(res, 400, '活动价不能高于默认价')
  }

  const existingEnrollment = await ActivityEnrollment.findOne({
    where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code },
  })
  if (existingEnrollment) {
    await existingEnrollment.update({
      status: 'active',
      start_at: startAt,
      end_at: endAt,
      pricing_mode: pricingMode,
      discount_type: pricingMode === 'discount' ? discountType : null,
      discount_value: pricingMode === 'discount' ? discountValue : null,
    })
  } else {
    await ActivityEnrollment.create({
      merchant_id: req.user.id,
      hotel_id: hotelId,
      activity_code: code,
      status: 'active',
      start_at: startAt,
      end_at: endAt,
      pricing_mode: pricingMode,
      discount_type: pricingMode === 'discount' ? discountType : null,
      discount_value: pricingMode === 'discount' ? discountValue : null,
    })
  }

  await ActivityRoomPrice.destroy({ where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code } })
  await ActivityRoomPrice.bulkCreate(rows)
  ok(res, true)
}

async function cancelActivity(req, res, code) {
  const hotelId = Number(req.query.hotel_id)
  if (!hotelId) return error(res, 400, 'hotel_id required')
  const hotel = await Hotel.findByPk(hotelId)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')

  await ActivityEnrollment.destroy({ where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code } })
  await ActivityRoomPrice.destroy({ where: { merchant_id: req.user.id, hotel_id: hotelId, activity_code: code } })
  ok(res, true)
}

router.post('/activities/new_merchant/apply', requireRole(['merchant']), async (req, res) => applyActivity(req, res, 'new_merchant'))
router.post('/activities/weekend_flash/apply', requireRole(['merchant']), async (req, res) => applyActivity(req, res, 'weekend_flash'))
router.post('/activities/offseason_sale/apply', requireRole(['merchant']), async (req, res) => applyActivity(req, res, 'offseason_sale'))

router.delete('/activities/new_merchant/cancel', requireRole(['merchant']), async (req, res) => cancelActivity(req, res, 'new_merchant'))
router.delete('/activities/weekend_flash/cancel', requireRole(['merchant']), async (req, res) => cancelActivity(req, res, 'weekend_flash'))
router.delete('/activities/offseason_sale/cancel', requireRole(['merchant']), async (req, res) => cancelActivity(req, res, 'offseason_sale'))

export default router
