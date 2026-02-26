export function errorHandler(err, req, res, next) {
  const status = Number(err?.statusCode || err?.status || 500)
  const isProd = process.env.NODE_ENV === 'production'
  const message = isProd ? 'Internal Server Error' : (err?.message || 'Internal Server Error')
  console.error(err)
  res.status(status).json({ code: status, message })
}
