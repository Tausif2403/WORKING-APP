import { useState } from 'react'
import Deposit from './Deposite.jsx'
import Login from './Login.jsx'

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('quota_user')) } catch { return null }
  })

  if (!user) return <Login onLogin={setUser} />
  return <Deposit user={user} onLogout={() => { localStorage.removeItem('quota_token'); localStorage.removeItem('quota_user'); setUser(null) }} />
}

export default App
