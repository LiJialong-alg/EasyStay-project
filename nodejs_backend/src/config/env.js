import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  DB_PATH: process.env.DB_PATH || './database.sqlite',
}
