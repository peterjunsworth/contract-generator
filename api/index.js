const express = require('express')
const fs = require('fs')
const path = require('path')

// In Vercel, we need to handle file storage differently
// For now, we'll use an in-memory store (resets on each cold start)
let db = {
  contracts: [],
  parts: [
    { id: 'non-compete', title: 'Non-Compete Clause', content: 'During the term, the Employee shall not...', style: 'numbered', subStyle: 'numbered' },
    { id: 'non-solicit', title: 'Non-Solicitation Clause', content: 'The Parties agree not to solicit...', style: 'numbered', subStyle: 'numbered' },
    { id: 'indemnity', title: 'Indemnification', content: 'Each party shall indemnify and hold harmless...', style: 'numbered', subStyle: 'numbered' }
  ]
}

const app = express()
app.use(express.json())

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.get('/api/parts', (req, res) => {
  res.json(db.parts || [])
})

app.post('/api/parts', (req, res) => {
  db.parts = db.parts || []
  const p = req.body
  if (!p.id) p.id = Date.now().toString()
  db.parts.unshift(p)
  res.json(p)
})

app.delete('/api/parts/:id', (req, res) => {
  const id = req.params.id
  db.parts = (db.parts || []).filter(p => p.id !== id)
  res.json({ ok: true })
})

app.delete('/api/contracts/:id', (req, res) => {
  const id = req.params.id
  db.contracts = (db.contracts || []).filter(c => c.id !== id)
  res.json({ ok: true })
})

app.get('/api/contracts', (req, res) => {
  res.json(db.contracts || [])
})

app.post('/api/contracts', (req, res) => {
  const c = req.body
  db.contracts = db.contracts || []
  db.contracts.unshift(c)
  res.json(c)
})

app.put('/api/contracts/:id', (req, res) => {
  const id = req.params.id
  db.contracts = db.contracts || []
  db.contracts = db.contracts.map(c => c.id === id ? req.body : c)
  res.json(req.body)
})

app.post('/api/contracts/:id/parts', (req, res) => {
  const id = req.params.id
  const { part } = req.body
  db.contracts = db.contracts || []
  db.contracts = db.contracts.map(c => c.id === id ? { ...c, parts: [...(c.parts || []), part] } : c)
  res.json({ ok: true })
})

app.post('/api/ai/generate', async (req, res) => {
  const { title, purpose } = req.body || {}
  await new Promise(r => setTimeout(r, 700))
  const result = {
    title: title || `AI Generated Section`,
    content: `Generated section for ${title || purpose || 'agreement'}:\n\nThis is a mock AI-generated draft. Please review and edit.`
  }
  res.json(result)
})

app.post('/api/ai/compose', async (req, res) => {
  const { parts } = req.body || {}
  await new Promise(r => setTimeout(r, 600))
  const composed = (parts || []).map((p, i) => ({ id: `${Date.now()}-${i}`, title: p.title || `Part ${i + 1}`, content: p.content || `Auto-composed: ${p.title || 'part'}` }))
  res.json(composed)
})

// Export for Vercel serverless
module.exports = app
