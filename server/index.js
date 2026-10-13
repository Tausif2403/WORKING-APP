import { createServer } from 'node:http'
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const PORT = 4000
const userFile = new URL('./users.json', import.meta.url)
const users = new Map(existsSync(userFile) ? JSON.parse(readFileSync(userFile, 'utf8')).map((user) => [user.email, user]) : [])
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-production'

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5173', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' })
  response.end(JSON.stringify(body))
}

function tokenFor(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 86400000 })).toString('base64url')
  const signature = createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url')
  return `${header}.${payload}.${signature}`
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') }
}

function validPassword(password, user) {
  const hash = scryptSync(password, user.salt, 64)
  return timingSafeEqual(hash, Buffer.from(user.hash, 'hex'))
}

function saveUsers() {
  writeFileSync(userFile, JSON.stringify([...users.values()], null, 2))
}

async function body(request) {
  let raw = ''
  for await (const chunk of request) raw += chunk
  return JSON.parse(raw || '{}')
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {})
  if (request.method !== 'POST') return json(response, 404, { message: 'Route not found' })

  try {
    const data = await body(request)
    if (request.url === '/api/auth/register') {
      const email = String(data.email || '').trim().toLowerCase()
      const password = String(data.password || '')
      if (!/^\S+@\S+\.\S+$/.test(email)) return json(response, 400, { message: 'Valid email required' })
      if (password.length < 6) return json(response, 400, { message: 'Password must be at least 6 characters' })
      if (users.has(email)) return json(response, 409, { message: 'Account already exists' })
      const credentials = hashPassword(password)
      const user = { id: randomBytes(8).toString('hex'), email, ...credentials }
      users.set(email, user)
      saveUsers()
      return json(response, 201, { token: tokenFor(user), user: { id: user.id, email: user.email } })
    }

    if (request.url === '/api/auth/login') {
      const email = String(data.email || '').trim().toLowerCase()
      const password = String(data.password || '')
      const user = users.get(email)
      if (!user || !validPassword(password, user)) return json(response, 401, { message: 'Email ya password galat hai' })
      return json(response, 200, { token: tokenFor(user), user: { id: user.id, email: user.email } })
    }

    return json(response, 404, { message: 'Route not found' })
  } catch {
    return json(response, 400, { message: 'Invalid request' })
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`API running at http://localhost:${PORT}`))
