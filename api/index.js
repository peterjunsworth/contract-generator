// In-memory database (resets on cold starts)
let db = {
  contracts: [],
  parts: [
    { id: 'non-compete', title: 'Non-Compete Clause', content: 'During the term, the Employee shall not...', style: 'numbered', subStyle: 'numbered' },
    { id: 'non-solicit', title: 'Non-Solicitation Clause', content: 'The Parties agree not to solicit...', style: 'numbered', subStyle: 'numbered' },
    { id: 'indemnity', title: 'Indemnification', content: 'Each party shall indemnify and hold harmless...', style: 'numbered', subStyle: 'numbered' }
  ]
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { url, method } = req
  const pathname = url.replace(/^\/api/, '')

  try {
    // GET /api/parts
    if (method === 'GET' && pathname === '/parts') {
      return res.json(db.parts || [])
    }

    // POST /api/parts
    if (method === 'POST' && pathname === '/parts') {
      const p = req.body
      if (!p.id) p.id = Date.now().toString()
      db.parts = db.parts || []
      db.parts.unshift(p)
      return res.json(p)
    }

    // DELETE /api/parts/:id
    if (method === 'DELETE' && pathname.startsWith('/parts/')) {
      const id = pathname.split('/')[2]
      db.parts = (db.parts || []).filter(p => p.id !== id)
      return res.json({ ok: true })
    }

    // GET /api/contracts
    if (method === 'GET' && pathname === '/contracts') {
      return res.json(db.contracts || [])
    }

    // POST /api/contracts
    if (method === 'POST' && pathname === '/contracts') {
      const c = req.body
      db.contracts = db.contracts || []
      db.contracts.unshift(c)
      return res.json(c)
    }

    // PUT /api/contracts/:id
    if (method === 'PUT' && pathname.startsWith('/contracts/') && !pathname.includes('/parts')) {
      const id = pathname.split('/')[2]
      db.contracts = db.contracts || []
      db.contracts = db.contracts.map(c => c.id === id ? req.body : c)
      return res.json(req.body)
    }

    // DELETE /api/contracts/:id
    if (method === 'DELETE' && pathname.startsWith('/contracts/')) {
      const id = pathname.split('/')[2]
      db.contracts = (db.contracts || []).filter(c => c.id !== id)
      return res.json({ ok: true })
    }

    // POST /api/contracts/:id/parts
    if (method === 'POST' && pathname.match(/\/contracts\/[^/]+\/parts$/)) {
      const id = pathname.split('/')[2]
      const { part } = req.body
      db.contracts = db.contracts || []
      db.contracts = db.contracts.map(c => c.id === id ? { ...c, parts: [...(c.parts || []), part] } : c)
      return res.json({ ok: true })
    }

    // POST /api/ai/generate
    if (method === 'POST' && pathname === '/ai/generate') {
      const { title, purpose } = req.body || {}
      await new Promise(r => setTimeout(r, 700))
      return res.json({
        title: title || 'AI Generated Section',
        content: `Generated section for ${title || purpose || 'agreement'}:\n\nThis is a mock AI-generated draft. Please review and edit.`
      })
    }

    // POST /api/ai/compose
    if (method === 'POST' && pathname === '/ai/compose') {
      const { parts } = req.body || {}
      await new Promise(r => setTimeout(r, 600))
      const composed = (parts || []).map((p, i) => ({
        id: `${Date.now()}-${i}`,
        title: p.title || `Part ${i + 1}`,
        content: p.content || `Auto-composed: ${p.title || 'part'}`
      }))
      return res.json(composed)
    }

    // Not found
    return res.status(404).json({ error: 'Not found' })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: error.message })
  }
}
