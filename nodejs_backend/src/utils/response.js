export function ok(res, data = null, message = 'success') {
  res.json({ code: 200, message, data })
}

export function error(res, code = 500, message = 'error', detail = null) {
  res.status(code).json({ code, message, detail })
}
