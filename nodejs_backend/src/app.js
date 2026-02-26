import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import { initDB } from './config/db.js'
import { sequelize } from './models/index.js'
import { errorHandler } from './middlewares/error.js'
import { auth } from './middlewares/auth.js'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import hotelsRoutes from './routes/hotels.js'
import roomsRoutes from './routes/rooms.js'
import ordersRoutes from './routes/orders.js'
import analyticsRoutes from './routes/analytics.js'
import financeRoutes from './routes/finance.js'
import reviewsRoutes from './routes/reviews.js'
import announcementsRoutes from './routes/announcements.js'
import chatRoutes from './routes/chat.js'
import adminMerchantsRoutes from './routes/adminMerchants.js'
import promotionsRoutes from './routes/promotions.js'
import notificationsRoutes from './routes/notifications.js'
import hotelListingRequestsRoutes from './routes/hotelListingRequests.js'
import publicHotelsRoutes from './routes/publicHotels.js'
import bannersRoutes from './routes/banners.js'
import { ensureSchema } from './config/ensureSchema.js'
import hotelRegistrationRequestsRoutes from './routes/hotelRegistrationRequests.js'
import activitiesRoutes from './routes/activities.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const resolveFrontendDist = () => {
  const candidates = [
    path.resolve(__dirname, '..', 'public'),
    path.resolve(__dirname, '..', '..', '..', 'front', 'dist'),
  ]
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, 'index.html'))) return dir
    } catch {
      // ignore
    }
  }
  return null
}

const frontendDist = resolveFrontendDist()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/', (req, res) => {
  if (frontendDist) {
    res.setHeader('Cache-Control', 'no-store')
    return res.sendFile(path.join(frontendDist, 'index.html'))
  }
  res.send('Hotelier API Server is running. Access endpoints via /api/...')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

if (frontendDist) {
  app.use(
    express.static(frontendDist, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store')
          return
        }
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      },
    })
  )
}

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api', publicHotelsRoutes)

app.use('/api', auth)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api', hotelsRoutes)
app.use('/api', roomsRoutes)
app.use('/api', ordersRoutes)
app.use('/api', analyticsRoutes)
app.use('/api', financeRoutes)
app.use('/api', reviewsRoutes)
app.use('/api', announcementsRoutes)
app.use('/api', chatRoutes)
app.use('/api', adminMerchantsRoutes)
app.use('/api', promotionsRoutes)
app.use('/api', notificationsRoutes)
app.use('/api', hotelListingRequestsRoutes)
app.use('/api', bannersRoutes)
app.use('/api', hotelRegistrationRequestsRoutes)
app.use('/api', activitiesRoutes)

if (frontendDist) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.setHeader('Cache-Control', 'no-store')
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.use(errorHandler)

async function start() {
  console.log('Starting API server...')
  await initDB()
  console.log('Database connected')
  await sequelize.sync()
  console.log('Database synced')
  await ensureSchema()
  console.log('Database schema ensured')
  if (frontendDist) console.log(`Frontend dist served from: ${frontendDist}`)
  const dbAbs = path.resolve(process.cwd(), env.DB_PATH)
  try {
    const s = fs.statSync(dbAbs)
    console.log(`Database file: ${dbAbs} (mtime: ${s.mtime.toISOString()})`)
  } catch {
    console.log(`Database file: ${dbAbs}`)
  }
  app.listen(env.PORT, () => {
    console.log(`API server running at http://localhost:${env.PORT}`)
  })
  process.stdin.resume()
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
