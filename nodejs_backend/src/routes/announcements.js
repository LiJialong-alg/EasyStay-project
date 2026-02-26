import express from 'express'
import { Op } from 'sequelize'
import { Announcement } from '../models/index.js'
import { ok } from '../utils/response.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

router.get('/announcements', async (req, res) => {
  const role = req.query.role || 'merchant'
  const status = req.query.status || 'published'

  const where = status === 'all' ? {} : { status }
  if (role) where.target_role = { [Op.in]: ['all', role] }

  const data = await Announcement.findAll({
    where,
    order: [['published_at', 'DESC'], ['createdAt', 'DESC']],
  })

  ok(res, data)
})

router.post('/announcements', requireRole(['admin']), async (req, res) => {
  const { title, type, content, target_role, status } = req.body || {}
  const nextStatus = status || 'published'
  const publishedAt = nextStatus === 'published' ? new Date() : null

  const data = await Announcement.create({
    title,
    type: type || 'notification',
    content,
    target_role: target_role || 'merchant',
    status: nextStatus,
    published_at: publishedAt,
  })

  ok(res, data)
})

router.patch('/announcements/:id', requireRole(['admin']), async (req, res) => {
  const id = req.params.id
  const update = { ...req.body }
  if (Object.prototype.hasOwnProperty.call(update, 'status')) {
    update.published_at = update.status === 'published' ? new Date() : null
  }
  await Announcement.update(update, { where: { id } })
  const data = await Announcement.findByPk(id)
  ok(res, data)
})

router.delete('/announcements/:id', requireRole(['admin']), async (req, res) => {
  await Announcement.destroy({ where: { id: req.params.id } })
  ok(res, true)
})

export default router
