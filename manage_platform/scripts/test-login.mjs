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

const args = process.argv.slice(2)
const username = args[0] || 'admin'
const password = args[1] || '123456'

const { status: loginStatus, json: loginJson } = await authLogin(username, password)

console.log('login')
console.log('Status:', loginStatus)
console.log('Response:', JSON.stringify(loginJson, null, 2))
console.log('---')