import express from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Banner } from '../models/index.js'
import { ok } from '../utils/response.js'
import { requireRole } from '../middlewares/auth.js'

const router = express.Router()

router.use('/banners', requireRole(['admin']))

const uploadDir = path.join(process.cwd(), 'uploads', 'banners')
fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg'
      cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!okTypes.includes(file.mimetype)) return cb(new Error('仅支持 JPG/PNG/WebP 图片'))
    cb(null, true)
  },
})

router.get('/banners', async (req, res) => {
  const { position } = req.query
  const where = {}
  if (position) where.position = position
  const list = await Banner.findAll({ where, order: [['sort_order', 'ASC'], ['id', 'DESC']] })
  ok(res, list)
})

router.post('/banners/upload-image', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, message: '未收到图片文件' })
  const imageUrl = `/uploads/banners/${req.file.filename}`
  ok(res, { url: imageUrl })
})

router.post('/banners', async (req, res) => {
  const { title, image_url, link_url, position, sort_order, status } = req.body || {}
  if (!image_url) return res.status(400).json({ code: 400, message: 'image_url required' })
  const created = await Banner.create({
    title: title || '',
    image_url,
    link_url: link_url || null,
    position: position || 'home',
    sort_order: Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
    status: status || 'active',
  })
  ok(res, created)
})

router.patch('/banners/:id', async (req, res) => {
  const { title, image_url, link_url, position, sort_order, status } = req.body || {}
  const existing = await Banner.findByPk(req.params.id)
  if (!existing) return res.status(404).json({ code: 404, message: 'Not found' })
  const update = {}
  if (title !== undefined) update.title = title
  if (image_url !== undefined) update.image_url = image_url
  if (link_url !== undefined) update.link_url = link_url
  if (position !== undefined) update.position = position
  if (sort_order !== undefined) update.sort_order = Number(sort_order) || 0
  if (status !== undefined) update.status = status
  await Banner.update(update, { where: { id: req.params.id } })
  const data = await Banner.findByPk(req.params.id)
  ok(res, data)
})

router.delete('/banners/:id', async (req, res) => {
  await Banner.destroy({ where: { id: req.params.id } })
  ok(res, true)
})

export default router
