import express from 'express'
import { ok, error } from '../utils/response.js'
import { ChatConversation, ChatMessage } from '../models/index.js'

const router = express.Router()

router.get('/chat/conversations', async (req, res) => {
  const userId = req.user.id
  const data = await ChatConversation.findAll({ where: { user_id: userId }, order: [['updatedAt', 'DESC']] })
  ok(res, data)
})

router.post('/chat/conversations', async (req, res) => {
  const userId = req.user.id
  const title = req.body.title || '平台客服'
  const data = await ChatConversation.create({ user_id: userId, title, status: 'open' })
  ok(res, data)
})

router.get('/chat/conversations/:id/messages', async (req, res) => {
  const id = req.params.id
  const conv = await ChatConversation.findByPk(id)
  if (!conv || conv.user_id !== req.user.id) return error(res, 403, 'Forbidden')
  const data = await ChatMessage.findAll({ where: { conversation_id: id }, order: [['createdAt', 'ASC']] })
  ok(res, data)
})

router.post('/chat/conversations/:id/messages', async (req, res) => {
  const id = req.params.id
  const conv = await ChatConversation.findByPk(id)
  if (!conv || conv.user_id !== req.user.id) return error(res, 403, 'Forbidden')
  const { sender_role, content } = req.body || {}
  if (!sender_role) return error(res, 400, 'sender_role required')
  if (!content) return error(res, 400, 'content required')
  const data = await ChatMessage.create({ conversation_id: id, sender_role, content })
  await ChatConversation.update({ updatedAt: new Date() }, { where: { id } })
  ok(res, data)
})

export default router
