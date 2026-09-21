import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header) return res.status(401).json({ error: 'Unauthorized' })

    const token = header.replace('Bearer ', '')
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    req.user = user
    req.userId = user._id
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

export const adminRequired = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
  next()
}

// Optional auth: attaches user when a valid token is present, never rejects
export const optionalAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization
    if (!header) return next()
    const payload = jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET)
    req.user = await User.findById(payload.sub)
    if (req.user) req.userId = req.user._id
  } catch {
    // ignore invalid tokens
  }
  next()
}
