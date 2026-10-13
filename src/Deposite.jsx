import { useMemo, useState } from 'react'

const packages = [
  { amount: 100, income: 3, activity: 2, quota: 105 },
  { amount: 127, income: 3.81, activity: 2, quota: 132.81 },
  { amount: 188, income: 5.64, activity: 2, quota: 195.64 },
  { amount: 200, income: 6, activity: 2, quota: 208 },
  { amount: 201, income: 6.03, activity: 2, quota: 209.03 },
  { amount: 210, income: 6.3, activity: 2, quota: 218.3 },
  { amount: 400, income: 12, activity: 2, quota: 414 },
]

const filters = ['All', '100+', '3000+', '10000+', '20000+']

export default function Deposit({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('INR')
  const [filter, setFilter] = useState('All')
  const [usdtAmount, setUsdtAmount] = useState('50')
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const visiblePackages = useMemo(() => {
    if (filter === 'All') return packages
    const minimum = Number(filter.replace('+', ''))
    return packages.filter((item) => item.amount >= minimum)
  }, [filter])

  function handleBuy(pkg) {
    setSelectedPackage(pkg)
    setMessage(`₹${pkg.amount.toFixed(2)} package selected. Payment integration is pending.`)
    setError('')
  }

  function handleDeposit() {
    const amount = Number(usdtAmount)
    if (!amount || amount < 10) {
      setError('Minimum deposit 10 USDT hai.')
      setMessage('')
      return
    }
    setError('')
    setMessage(`${amount.toFixed(2)} USDT deposit request ready hai. Wallet transfer ke baad backend verification lagega.`)
  }

  return (
    <main className="deposit-page">
      <header className="deposit-header">
        <h1>Deposit</h1>
        <div className="header-actions"><span className="user-email">{user?.email}</span><button className="exchange-button" type="button" onClick={() => setActiveTab('USDT')}>₮ USDT Exchange</button><button className="info-button" type="button" onClick={() => setMessage('Quota ka use packages buy karne ke liye hota hai.')}>ⓘ</button><button className="logout-button" type="button" onClick={onLogout}>Logout</button></div>
      </header>
      <nav className="deposit-tabs" aria-label="Deposit currency">{['INR', 'USDT'].map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); setMessage(''); setError('') }} className={activeTab === tab ? 'tab active' : 'tab'}>{tab}</button>)}</nav>

      {message && <div className="feedback success" role="status">{message}<button type="button" onClick={() => setMessage('')}>×</button></div>}
      {error && <div className="feedback error" role="alert">{error}</div>}

      {activeTab === 'INR' ? <section className="deposit-content">
        <div className="quota-card"><div className="quota-card-top"><span>Quota ◉</span><button type="button" className="link-button" onClick={() => setMessage('Package select karke BUY dabayein. Payment ke baad quota update hoga.')}>How to Buy Quota</button></div><strong>0.81 INR</strong></div>
        <div className="filter-row">{filters.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={filter === item ? 'filter active' : 'filter'}>{item}</button>)}</div>
        <div className="package-list">{visiblePackages.length ? visiblePackages.map((pkg) => <article className={selectedPackage?.amount === pkg.amount ? 'package-card selected' : 'package-card'} key={pkg.amount}><div><div className="package-title">₹ {pkg.amount.toFixed(2)} INR <span>Bank</span></div><p>Income ₹ {pkg.income.toFixed(2)} ({pkg.income}%) ({pkg.activity.toFixed(2)}) (Activity)</p></div><div className="package-action"><button type="button" className="buy-button" onClick={() => handleBuy(pkg)}>{selectedPackage?.amount === pkg.amount ? 'SELECTED' : 'BUY'}</button><small>Quota +{pkg.quota.toFixed(2)}</small></div></article>) : <div className="empty-state">Is filter mein koi package available nahi hai.</div>}</div>
      </section> : <section className="deposit-content"><div className="usdt-card"><div className="quota-card-top"><div><small>Quota ID</small><p>••••••••</p></div><button type="button" className="link-button" onClick={() => setMessage('USDT ko sirf TRC20 network par transfer karein.')}>How to Buy Quota</button></div><strong className="usdt-balance">0.81 INR</strong><div className="qr-placeholder"><span>▦</span><small>QR Code</small></div><p className="wallet-address">TYgFjG8kL9mN2pQ4rS6tU8vW0xY1zA3bC5dE</p><p className="warning-text">Only supports TRC20 network</p><div className="amount-field"><input min="10" type="number" value={usdtAmount} onChange={(event) => { setUsdtAmount(event.target.value); setError(''); setMessage('') }} placeholder="Enter amount" /><span>USDT</span></div><p className="rate-text">1 USDT ≈ 83.00 INR</p><div className="notice">• Min deposit: 10 USDT<br />• Please wait 1-3 minutes after transfer<br />• Wrong network may cause permanent loss</div><button type="button" className="deposit-button" onClick={handleDeposit}>Deposit</button></div></section>}
    </main>
  )
}
