import express from 'express'
import { ok, error } from '../utils/response.js'
import { requireRole } from '../middlewares/auth.js'
import { Hotel, HotelRegistrationRequest, Notification, RoomType } from '../models/index.js'

const router = express.Router()

router.get('/hotel-registration-requests', requireRole(['merchant']), async (req, res) => {
  const data = await HotelRegistrationRequest.findAll({
    where: { merchant_id: req.user.id },
    order: [['createdAt', 'DESC']],
  })
  ok(res, data)
})

router.post('/hotel-registration-requests', requireRole(['merchant']), async (req, res) => {
  const payload = req.body || {}
  if (!payload.name) return error(res, 400, 'name required')
  const roomTypes = Array.isArray(payload.room_types) ? payload.room_types : []

  const data = await HotelRegistrationRequest.create({
    merchant_id: req.user.id,
    name: payload.name,
    address: payload.address || null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    star_level: payload.star_level ?? 0,
    description: payload.description || null,
    image_urls: payload.image_urls ? JSON.stringify(payload.image_urls) : null,
    room_types: roomTypes.length > 0 ? JSON.stringify(roomTypes) : null,
    reason: payload.reason || null,
    status: 'pending',
  })
  ok(res, data)
})

router.get('/admin/hotel-registration-requests', requireRole(['admin']), async (req, res) => {
  const status = (req.query.status || 'pending').toString()
  const where = status === 'all' ? {} : { status }
  const data = await HotelRegistrationRequest.findAll({ where, order: [['createdAt', 'DESC']] })
  ok(res, data)
})

router.patch('/admin/hotel-registration-requests/:id', requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id)
  const action = (req.body?.action || '').toString()
  const comment = (req.body?.comment || '').toString().trim()

  const row = await HotelRegistrationRequest.findByPk(id)
  if (!row) return error(res, 404, 'Not found')
  if (row.status !== 'pending') return error(res, 400, 'Request already processed')

  if (action === 'approve') {
    const created = await Hotel.create({
      owner_id: row.merchant_id,
      name: row.name,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      listed: true,
      unlist_reason: null,
      status: 'operating',
      star_level: row.star_level || 0,
      description: row.description || null,
      image_urls: row.image_urls || null,
      image_url: (() => {
        try {
          const parsed = row.image_urls ? JSON.parse(row.image_urls) : []
          return parsed && parsed.length > 0 ? parsed[0] : null
        } catch {
          return null
        }
      })(),
    })
    const roomTypes = (() => {
      try {
        return row.room_types ? JSON.parse(row.room_types) : []
      } catch {
        return []
      }
    })()
    if (Array.isArray(roomTypes) && roomTypes.length > 0) {
      const rows = roomTypes
        .map((rt) => ({
          hotel_id: created.id,
          name: (rt?.name || '').toString().trim(),
          base_price: Number(rt?.base_price),
          total_stock: Number(rt?.total_stock),
          bed_type: rt?.bed_type !== undefined ? (rt.bed_type || null) : null,
          room_size_sqm: rt?.room_size_sqm !== undefined && rt.room_size_sqm !== null ? Number(rt.room_size_sqm) : null,
          floor_info: rt?.floor_info !== undefined ? (rt.floor_info || null) : null,
          has_wifi: rt?.has_wifi !== undefined ? Boolean(rt.has_wifi) : true,
          has_window: rt?.has_window !== undefined ? Boolean(rt.has_window) : true,
          has_housekeeping: rt?.has_housekeeping !== undefined ? Boolean(rt.has_housekeeping) : true,
          is_non_smoking: rt?.is_non_smoking !== undefined ? Boolean(rt.is_non_smoking) : true,
          includes_breakfast: rt?.includes_breakfast !== undefined ? Boolean(rt.includes_breakfast) : false,
          description: rt?.description !== undefined ? (rt.description || null) : null,
          status: 'available',
          audit_status: 'approved',
          audit_reason: null,
          offline_reason: null,
        }))
        .filter((rt) => rt.name && Number.isFinite(rt.base_price) && rt.base_price > 0 && Number.isFinite(rt.total_stock) && rt.total_stock > 0)
      if (rows.length > 0) await RoomType.bulkCreate(rows)
    }

    await HotelRegistrationRequest.update(
      { status: 'approved', admin_comment: comment || null, reviewed_at: new Date() },
      { where: { id } }
    )

    await Notification.create({
      user_id: row.merchant_id,
      kind: 'system',
      title: '酒店注册审核通过',
      description: `${row.name || '酒店'} 已通过注册审核${comment ? `：${comment}` : ''}`,
      ref_type: 'hotel_registration_request',
      ref_id: row.id,
      is_read: false,
    })

    ok(res, { createdHotelId: created.id })
    return
  }

  if (action === 'reject') {
    await HotelRegistrationRequest.update(
      { status: 'rejected', admin_comment: comment || null, reviewed_at: new Date() },
      { where: { id } }
    )
    await Notification.create({
      user_id: row.merchant_id,
      kind: 'system',
      title: '酒店注册审核未通过',
      description: `${row.name || '酒店'} 注册审核未通过${comment ? `：${comment}` : ''}`,
      ref_type: 'hotel_registration_request',
      ref_id: row.id,
      is_read: false,
    })
    ok(res, true)
    return
  }

  error(res, 400, 'Invalid action')
})

export default router
