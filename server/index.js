const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const DB = path.join(__dirname, '..', 'db.json')

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB)) }
  catch(e){ return { contracts: [], parts: [
    { id: 'non-compete', title: 'Non-Compete Clause', content: 'During the term, the Employee shall not...'},
    { id: 'non-solicit', title: 'Non-Solicitation Clause', content: 'The Parties agree not to solicit...'},
    { id: 'indemnity', title: 'Indemnification', content: 'Each party shall indemnify and hold harmless...'}
  ] } }

}

function writeDB(data){ fs.writeFileSync(DB, JSON.stringify(data, null, 2)) }

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/parts', (req, res)=>{
  const db = readDB()
  res.json(db.parts || [])
})

app.post('/api/parts', (req, res)=>{
  const db = readDB()
  db.parts = db.parts || []
  const p = req.body
  // ensure id
  if(!p.id) p.id = Date.now().toString()
  db.parts.unshift(p)
  writeDB(db)
  res.json(p)
})

app.delete('/api/parts/:id', (req, res)=>{
  const id = req.params.id
  const db = readDB()
  db.parts = (db.parts || []).filter(p=> p.id !== id)
  writeDB(db)
  res.json({ ok: true })
})

app.delete('/api/contracts/:id', (req, res)=>{
  const id = req.params.id
  const db = readDB()
  db.contracts = (db.contracts || []).filter(c=> c.id !== id)
  writeDB(db)
  res.json({ ok: true })
})

app.get('/api/contracts', (req, res)=>{
  const db = readDB()
  res.json(db.contracts || [])
})

app.post('/api/contracts', (req, res)=>{
  const db = readDB()
  const c = req.body
  db.contracts = db.contracts || []
  db.contracts.unshift(c)
  writeDB(db)
  res.json(c)
})

app.put('/api/contracts/:id', (req, res)=>{
  const id = req.params.id
  const db = readDB()
  db.contracts = db.contracts || []
  db.contracts = db.contracts.map(c=> c.id===id? req.body : c)
  writeDB(db)
  res.json(req.body)
})

app.post('/api/contracts/:id/parts', (req, res)=>{
  // add a part to contract
  const id = req.params.id
  const { part } = req.body
  const db = readDB()
  db.contracts = db.contracts || []
  db.contracts = db.contracts.map(c=> c.id===id? { ...c, parts: [...(c.parts||[]), part] } : c)
  writeDB(db)
  res.json({ ok: true })
})

app.post('/api/ai/generate', async (req, res)=>{
  const { title, purpose } = req.body || {}
  await new Promise(r=>setTimeout(r,700))
  const result = {
    title: title || `AI Generated Section`,
    content: `Generated section for ${title || purpose || 'agreement'}:\n\nThis is a mock AI-generated draft. Please review and edit.`
  }
  res.json(result)
})

app.post('/api/ai/compose', async (req, res)=>{
  const { parts } = req.body || {}
  await new Promise(r=>setTimeout(r,600))
  const composed = (parts||[]).map((p,i)=>({ id: `${Date.now()}-${i}`, title: p.title||`Part ${i+1}`, content: p.content||`Auto-composed: ${p.title||'part'}`}))
  res.json(composed)
})

const PORT = process.env.PORT || 4001
app.listen(PORT, ()=> console.log(`Mock API server running on http://localhost:${PORT}`))
