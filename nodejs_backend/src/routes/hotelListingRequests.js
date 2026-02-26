import express from 'express'
import { Op } from 'sequelize'
import { ok, error } from '../utils/response.js'
import { Hotel, HotelListingRequest, Notification } from '../models/index.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

router.get('/hotel-listing-requests', requireRole(['merchant']), async (req, res) => {
  const data = await HotelListingRequest.findAll({
    where: { merchant_id: req.user.id },
    order: [['createdAt', 'DESC']],
  })
  ok(res, data)
})

router.post('/hotels/:id/listing-requests', requireRole(['merchant']), async (req, res) => {
  const hotelId = Number(req.params.id)
  const hotel = await Hotel.findByPk(hotelId)
  if (!hotel) return error(res, 404, 'Not found')
  if (hotel.owner_id !== req.user.id) return error(res, 403, 'Forbidden')
  if (hotel.listed) return error(res, 400, 'Hotel already listed')

  const exists = await HotelListingRequest.findOne({
    where: { hotel_id: hotelId, merchant_id: req.user.id, status: 'pending' },
  })
  if (exists) return error(res, 400, 'Request already pending')

  const reason = (req.body?.reason || '').trim()
  const data = await HotelListingRequest.create({
    hotel_id: hotelId,
    merchant_id: req.user.id,
    status: 'pending',
    reason: reason || null,
  })
  ok(res, data)
})

router.get('/admin/hotel-listing-requests', requireRole(['admin']), async (req, res) => {
  const status = (req.query.status || 'pending').toString()
  const where = status === 'all' ? {} : { status }
  const data = await HotelListingRequest.findAll({
    where,
    include: [
      { model: Hotel, attributes: ['id', 'name', 'listed', 'unlist_reason', 'owner_id'] },
    ],
    order: [['createdAt', 'DESC']],
  })
  ok(res, data)
})

router.patch('/admin/hotel-listing-requests/:id', requireRole(['admin']), async (req, res) => {
  const id = Number(req.params.id)
  const action = (req.body?.action || '').toString()
  const comment = (req.body?.comment || '').toString().trim()

  const reqRow = await HotelListingRequest.findByPk(id)
  if (!reqRow) return error(res, 404, 'Not found')
  if (reqRow.status !== 'pending') return error(res, 400, 'Request already processed')

  const hotel = await Hotel.findByPk(reqRow.hotel_id)
  if (!hotel) return error(res, 404, 'Not found')

  if (action === 'approve') {
    await Hotel.update({ listed: true, unlist_reason: null }, { where: { id: hotel.id } })
    await HotelListingRequest.update(
      { status: 'approved', admin_comment: comment || null, reviewed_at: new Date() },
      { where: { id } }
    )
    await Notification.create({
      user_id: reqRow.merchant_id,
      kind: 'system',
      title: '酒店上线审核通过',
      description: `${hotel.name || '酒店'} 已通过上线审核${comment ? `：${comment}` : ''}`,
      ref_type: 'hotel_listing_request',
      ref_id: reqRow.id,
      is_read: false,
    })
    ok(res, true)
    return
  }

  if (action === 'reject') {
    await HotelListingRequest.update(
      { status: 'rejected', admin_comment: comment || null, reviewed_at: new Date() },
      { where: { id } }
    )
    await Notification.create({
      user_id: reqRow.merchant_id,
      kind: 'system',
      title: '酒店上线审核未通过',
      description: `${hotel.name || '酒店'} 上线审核未通过${comment ? `：${comment}` : ''}`,
      ref_type: 'hotel_listing_request',
      ref_id: reqRow.id,
      is_read: false,
    })
    ok(res, true)
    return
  }

  error(res, 400, 'Invalid action')
})

export default router
