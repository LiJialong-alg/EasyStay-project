import { DataTypes } from 'sequelize'
import { sequelize } from '../models/index.js'

export async function ensureSchema() {
  const qi = sequelize.getQueryInterface()

  const hotels = await qi.describeTable('hotels')
  if (!hotels.star_level) {
    await qi.addColumn('hotels', 'star_level', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  }
  if (!hotels.description) {
    await qi.addColumn('hotels', 'description', { type: DataTypes.TEXT, allowNull: true })
  }

  const regReq = await qi.describeTable('hotel_registration_requests').catch(() => null)
  if (!regReq) {
    await qi.createTable('hotel_registration_requests', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      merchant_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: true },
      latitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
      longitude: { type: DataTypes.DECIMAL(10, 6), allowNull: true },
      star_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      description: { type: DataTypes.TEXT, allowNull: true },
      image_urls: { type: DataTypes.TEXT, allowNull: true },
      room_types: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
      reason: { type: DataTypes.TEXT, allowNull: true },
      admin_comment: { type: DataTypes.TEXT, allowNull: true },
      reviewed_at: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
  } else {
    if (!regReq.room_types) {
      await qi.addColumn('hotel_registration_requests', 'room_types', { type: DataTypes.TEXT, allowNull: true })
    }
  }

  const enroll = await qi.describeTable('activity_enrollments').catch(() => null)
  if (!enroll) {
    await qi.createTable('activity_enrollments', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      merchant_id: { type: DataTypes.INTEGER, allowNull: false },
      hotel_id: { type: DataTypes.INTEGER, allowNull: false },
      activity_code: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
      start_at: { type: DataTypes.DATE, allowNull: true },
      end_at: { type: DataTypes.DATE, allowNull: true },
      pricing_mode: { type: DataTypes.STRING, allowNull: false, defaultValue: 'manual' },
      discount_type: { type: DataTypes.STRING, allowNull: true },
      discount_value: { type: DataTypes.DECIMAL(10, 4), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
  } else {
    if (!enroll.start_at) await qi.addColumn('activity_enrollments', 'start_at', { type: DataTypes.DATE, allowNull: true })
    if (!enroll.end_at) await qi.addColumn('activity_enrollments', 'end_at', { type: DataTypes.DATE, allowNull: true })
    if (!enroll.pricing_mode) await qi.addColumn('activity_enrollments', 'pricing_mode', { type: DataTypes.STRING, allowNull: false, defaultValue: 'manual' })
    if (!enroll.discount_type) await qi.addColumn('activity_enrollments', 'discount_type', { type: DataTypes.STRING, allowNull: true })
    if (!enroll.discount_value) await qi.addColumn('activity_enrollments', 'discount_value', { type: DataTypes.DECIMAL(10, 4), allowNull: true })
  }

  const roomPrices = await qi.describeTable('activity_room_prices').catch(() => null)
  if (!roomPrices) {
    await qi.createTable('activity_room_prices', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      activity_code: { type: DataTypes.STRING, allowNull: false },
      merchant_id: { type: DataTypes.INTEGER, allowNull: false },
      hotel_id: { type: DataTypes.INTEGER, allowNull: false },
      room_type_id: { type: DataTypes.INTEGER, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      start_at: { type: DataTypes.DATE, allowNull: true },
      end_at: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    })
  } else {
    if (!roomPrices.start_at) await qi.addColumn('activity_room_prices', 'start_at', { type: DataTypes.DATE, allowNull: true })
    if (!roomPrices.end_at) await qi.addColumn('activity_room_prices', 'end_at', { type: DataTypes.DATE, allowNull: true })
  }
}
