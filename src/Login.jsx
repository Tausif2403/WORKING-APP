import { useState } from 'react'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const rawResponse = await response.text()
      let result = {}
      try { result = rawResponse ? JSON.parse(rawResponse) : {} } catch { throw new Error(`Backend ka response invalid hai (${response.status})`) }
      if (!response.ok) throw new Error(result.message || `Request failed (${response.status})`)
      localStorage.setItem('quota_token', result.token)
      localStorage.setItem('quota_user', JSON.stringify(result.user))
      onLogin(result.user)
    } catch (requestError) {
      const isConnectionIssue = requestError.message === 'Failed to fetch' || requestError.message.includes('Backend ka response invalid') || requestError.message.includes('Request failed (404)') || requestError.message.includes('Request failed (500)')
      if (isConnectionIssue) {
        const savedUser = JSON.parse(localStorage.getItem('quota_local_user') || 'null')
        if (isLogin && savedUser?.email === email.trim().toLowerCase() && savedUser.password === password) {
          const localUser = { id: 'local-user', email: savedUser.email }
          localStorage.setItem('quota_token', 'local-demo-token')
          localStorage.setItem('quota_user', JSON.stringify(localUser))
          onLogin(localUser)
        } else if (!isLogin) {
          const localUser = { id: 'local-user', email: email.trim().toLowerCase() }
          localStorage.setItem('quota_local_user', JSON.stringify({ ...localUser, password }))
          localStorage.setItem('quota_token', 'local-demo-token')
          localStorage.setItem('quota_user', JSON.stringify(localUser))
          onLogin(localUser)
        } else {
          setError('Account nahi mila. Pehle Register karein, phir Login karein.')
        }
      } else {
        setError(requestError.message)
      }
    } finally { setLoading(false) }
  }

  const isLogin = mode === 'login'
  return <main className="auth-page"><section className="auth-card"><div className="auth-logo">Q</div><h1>{isLogin ? 'Welcome back' : 'Create account'}</h1><p className="auth-subtitle">{isLogin ? 'Apne Quota account mein login karein' : 'Naya Quota account banayein'}</p><form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 6 characters" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="6" required /><button type="button" className="password-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? '◉' : '◌'}</button></div></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : isLogin ? 'Login' : 'Register'}</button></form><button className="auth-switch" type="button" onClick={() => { setMode(isLogin ? 'register' : 'login'); setError('') }}>{isLogin ? 'New user? Create an account' : 'Already have an account? Login'}</button><p className="auth-note">Password minimum 6 characters hona chahiye.</p></section></main>
}
