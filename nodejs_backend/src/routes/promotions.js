import express from 'express'
import { ok, error } from '../utils/response.js'
import { Promotion } from '../models/index.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

router.use('/promotions', requireRole(['merchant']))

router.get('/promotions', async (req, res) => {
  const hotelId = req.query.hotelId ? Number(req.query.hotelId) : undefined
  const where = { merchant_id: req.user.id }
  if (hotelId) where.hotel_id = hotelId
  const data = await Promotion.findAll({ where, order: [['updatedAt', 'DESC']] })
  ok(res, data)
})

router.post('/promotions', async (req, res) => {
  const payload = req.body || {}
  if (!payload.title) return error(res, 400, 'title required')
  if (payload.discount_value === undefined || payload.discount_value === null) return error(res, 400, 'discount_value required')
  const data = await Promotion.create({
    merchant_id: req.user.id,
    hotel_id: payload.hotel_id || null,
    title: payload.title,
    description: payload.description || null,
    promo_type: payload.promo_type || 'coupon',
    discount_type: payload.discount_type || 'amount',
    discount_value: payload.discount_value,
    min_amount: payload.min_amount || 0,
    min_nights: payload.min_nights || 0,
    max_uses: payload.max_uses || 0,
    used_count: payload.used_count || 0,
    code: payload.code || null,
    start_at: payload.start_at || null,
    end_at: payload.end_at || null,
    status: payload.status || 'draft',
  })
  ok(res, data)
})

router.patch('/promotions/:id', async (req, res) => {
  const payload = req.body || {}
  const owned = await Promotion.findByPk(req.params.id)
  if (!owned || owned.merchant_id !== req.user.id) return error(res, 403, 'Forbidden')
  const update = {}
  ;[
    'hotel_id',
    'title',
    'description',
    'promo_type',
    'discount_type',
    'discount_value',
    'min_amount',
    'min_nights',
    'max_uses',
    'used_count',
    'code',
    'start_at',
    'end_at',
    'status',
  ].forEach((k) => {
    if (payload[k] !== undefined) update[k] = payload[k]
  })
  await Promotion.update(update, { where: { id: req.params.id, merchant_id: req.user.id } })
  const data = await Promotion.findByPk(req.params.id)
  ok(res, data)
})

router.delete('/promotions/:id', async (req, res) => {
  const owned = await Promotion.findByPk(req.params.id)
  if (!owned || owned.merchant_id !== req.user.id) return error(res, 403, 'Forbidden')
  await Promotion.destroy({ where: { id: req.params.id, merchant_id: req.user.id } })
  ok(res, true)
})

export default router
