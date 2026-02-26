import express from 'express'
import { Review } from '../models/Review.js'
import { ok } from '../utils/response.js'
import { Op } from 'sequelize'
import { Hotel } from '../models/Hotel.js'

const router = express.Router()

/**
 * @route GET /reviews
 * @desc 获取评价列表
 * @access Private
 */
router.get('/reviews', async (req, res) => {
  const where = {}
  if (req.user?.role === 'merchant') {
    const hotels = await Hotel.findAll({ where: { owner_id: req.user.id }, attributes: ['id'], raw: true })
    where.hotel_id = { [Op.in]: hotels.map((h) => h.id) }
  }
  const data = await Review.findAll({ where, order: [['created_at', 'DESC']] })
  ok(res, data)
})

/**
 * @route PATCH /reviews/:id/reply
 * @desc 回复评价
 * @access Private
 */
router.patch('/reviews/:id/reply', async (req, res) => {
  const { reply } = req.body
  const review = await Review.findByPk(req.params.id)
  if (!review) return res.status(404).json({ code: 404, message: 'Not found' })
  if (req.user?.role === 'merchant') {
    const hotel = await Hotel.findByPk(review.hotel_id)
    if (!hotel || hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
  }
  await Review.update({ reply }, { where: { id: req.params.id } })
  ok(res, true)
})

/**
 * @route PATCH /reviews/:id/highlight
 * @desc 切换评价置顶状态
 * @access Private
 */
router.patch('/reviews/:id/highlight', async (req, res) => {
  const review = await Review.findByPk(req.params.id)
  if (review) {
    if (req.user?.role === 'merchant') {
      const hotel = await Hotel.findByPk(review.hotel_id)
      if (!hotel || hotel.owner_id !== req.user.id) return res.status(403).json({ code: 403, message: 'Forbidden' })
    }
    await review.update({ is_highlight: !review.is_highlight })
  }
  ok(res, true)
})

export default router
