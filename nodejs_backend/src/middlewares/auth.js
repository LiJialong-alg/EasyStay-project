import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function auth(req, res, next) {
  const header = req.headers['authorization']
  if (!header || typeof header !== 'string') return res.status(401).json({ code: 401, message: 'No token' })
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : header.trim()
  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ code: 401, message: 'Invalid token' })
  }
}

export function requireRole(roles = []) {
  const allow = Array.isArray(roles) ? roles : [roles]
  return (req, res, next) => {
    const role = req.user?.role
    if (!role || (allow.length > 0 && !allow.includes(role))) {
      return res.status(403).json({ code: 403, message: 'Forbidden' })
    }
    next()
  }
}
