import express from 'express'
import { Op } from 'sequelize'
import { ok } from '../utils/response.js'
import { Announcement, Hotel, Notification, Review } from '../models/index.js'

const router = express.Router()

router.get('/notifications/merchant', async (req, res) => {
  const userId = req.user.id

  const reviews = await Review.findAll({
    include: [{ model: Hotel, attributes: ['id', 'name', 'owner_id'] }],
    order: [['created_at', 'DESC']],
  })

  const ownReviews = reviews.filter((r) => r.Hotel && r.Hotel.owner_id === userId)
  const reviewIds = ownReviews.map((r) => r.id)

  const existing = await Notification.findAll({
    where: { user_id: userId, kind: 'interaction', ref_type: 'review', ref_id: { [Op.in]: reviewIds } },
    attributes: ['ref_id'],
  })
  const existingIds = new Set(existing.map((n) => n.ref_id))

  const missing = ownReviews
    .filter((r) => !existingIds.has(r.id))
    .map((r) => ({
      user_id: userId,
      kind: 'interaction',
      title: '收到新的评价',
      description: `${r.Hotel?.name || ''} · ${r.customer_name || ''} · ${r.rating || 0}分`,
      ref_type: 'review',
      ref_id: r.id,
      is_read: false,
      createdAt: r.created_at || new Date(),
      updatedAt: r.created_at || new Date(),
    }))
  if (missing.length > 0) await Notification.bulkCreate(missing)

  const interaction = await Notification.findAll({
    where: { user_id: userId, kind: 'interaction', is_read: false },
    order: [['createdAt', 'DESC']],
    limit: 50,
  })

  const unreadInteractionCount = await Notification.count({
    where: { user_id: userId, kind: 'interaction', is_read: false },
  })

  const announcements = await Announcement.findAll({
    where: { status: 'published', target_role: { [Op.in]: ['merchant', 'all'] } },
    order: [['published_at', 'DESC']],
    limit: 200,
  })

  const systemNotifs = await Notification.findAll({
    where: { user_id: userId, kind: 'system' },
    order: [['createdAt', 'DESC']],
    limit: 200,
  })

  const system = [
    ...announcements.map((a) => {
      const plain = a.get({ plain: true })
      return {
        id: `ann-${plain.id}`,
        title: plain.title,
        content: plain.content,
        published_at: plain.published_at,
        createdAt: plain.published_at,
        _type: 'announcement',
      }
    }),
    ...systemNotifs.map((n) => {
      const plain = n.get({ plain: true })
      return {
        id: `sys-${plain.id}`,
        title: plain.title,
        content: plain.description || '',
        published_at: plain.createdAt,
        createdAt: plain.createdAt,
        _type: 'system',
      }
    }),
  ]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 200)

  ok(res, {
    counts: { system: system.length, interaction: unreadInteractionCount },
    system,
    interaction,
  })
})

router.patch('/notifications/:id/read', async (req, res) => {
  await Notification.update({ is_read: true }, { where: { id: req.params.id } })
  ok(res, true)
})

router.patch('/notifications/read-all', async (req, res) => {
  const userId = req.user.id
  const kind = req.body?.kind
  const where = { user_id: userId }
  if (kind) where.kind = kind
  await Notification.update({ is_read: true }, { where })
  ok(res, true)
})

export default router
