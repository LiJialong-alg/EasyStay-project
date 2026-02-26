import express from 'express'
import { ok } from '../utils/response.js'
import { User, Hotel } from '../models/index.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

router.use('/admin', requireRole(['admin']))

router.get('/admin/merchants', async (req, res) => {
  const merchants = await User.findAll({ where: { role: 'merchant' }, order: [['createdAt', 'DESC']] })
  const hotelCounts = await Hotel.findAll({
    attributes: ['owner_id'],
    raw: true,
  })
  const map = new Map()
  hotelCounts.forEach((h) => map.set(h.owner_id, (map.get(h.owner_id) || 0) + 1))

  ok(res, merchants.map((m) => ({
    id: m.id,
    name: m.name,
    username: m.username,
    status: m.status,
    ban_reason: m.ban_reason,
    joinDate: m.createdAt,
    hotelCount: map.get(m.id) || 0,
  })))
})

router.patch('/admin/merchants/:id/status', async (req, res) => {
  const { status, reason } = req.body || {}
  const nextStatus = status || 'active'
  await User.update(
    { status: nextStatus, ban_reason: nextStatus === 'banned' ? (reason || null) : null },
    { where: { id: req.params.id } }
  )
  ok(res, true)
})

export default router
