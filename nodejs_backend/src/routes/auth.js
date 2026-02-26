import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { ok } from '../utils/response.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

const toSafeUser = (u) => {
  if (!u) return null
  const plain = u.get ? u.get({ plain: true }) : u
  return {
    id: plain.id,
    username: plain.username,
    name: plain.name,
    avatar_url: plain.avatar_url,
    role: plain.role,
    status: plain.status,
    ban_reason: plain.ban_reason,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ where: { username } })
  if (!user) return res.status(401).json({ code: 401, message: 'Invalid credentials' })
  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) return res.status(401).json({ code: 401, message: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  ok(res, { token, user: toSafeUser(user) })
})

router.post('/register', async (req, res) => {
  const { username, password, name } = req.body || {}
  if (!username || !password) return res.status(400).json({ code: 400, message: 'username/password required' })
  const exists = await User.findOne({ where: { username } })
  if (exists) return res.status(409).json({ code: 409, message: '用户名已存在' })
  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ username, password_hash: hash, name: name || username, role: 'merchant' })
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' })
  ok(res, { token, user: toSafeUser(user) })
})

router.get('/me', auth, async (req, res) => {
  const user = await User.findByPk(req.user?.id)
  if (!user) return res.status(401).json({ code: 401, message: 'Invalid credentials' })
  ok(res, { user: toSafeUser(user) })
})

export default router
