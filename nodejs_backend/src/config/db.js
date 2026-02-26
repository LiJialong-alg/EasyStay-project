import { Sequelize } from 'sequelize'
import { env } from './env.js'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.DB_PATH,
  logging: false,
})

export async function initDB() {
  try {
    await sequelize.authenticate()
  } catch (err) {
    console.error('Database connection error:', err)
    throw err
  }
}
