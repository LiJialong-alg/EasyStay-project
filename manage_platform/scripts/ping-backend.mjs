const base = 'http://localhost:3002/api'

const authLogin = async (username, password) => {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const json = await res.json()
  return { status: res.status, json }
}

const { status: loginStatus, json: loginJson } = await authLogin('merchant', '123456')
const token = loginJson?.data?.token

const endpoints = [
  `${base}/health`,
  `${base}/auth/me`,
  `${base}/dashboard/stats`,
  `${base}/hotels`,
  `${base}/orders?page=1&pageSize=3`,
  `${base}/announcements?role=merchant&status=published`,
  `${base}/chat/conversations`,
  `${base}/promotions`,
  `${base}/notifications/merchant`,
  `${base}/orders?page=1&pageSize=1&checkInStart=${new Date().toISOString().slice(0,10)}&checkInEnd=${new Date().toISOString().slice(0,10)}`,
]

console.log('login')
console.log(loginStatus)
console.log(JSON.stringify({ code: loginJson?.code, role: loginJson?.data?.user?.role }, null, 2))
console.log('---')

for (const url of endpoints) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(url, { headers })
    const text = await res.text()
    console.log(url)
    console.log(res.status)
    console.log(text.slice(0, 500))
    console.log('---')
  } catch (e) {
    console.log(url)
    console.log('FETCH_FAILED')
    console.log(String(e))
    console.log('---')
  }
}
