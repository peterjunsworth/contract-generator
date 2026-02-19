import React, {useEffect, useState} from 'react'

export default function PartLibrary({onAdd, onEdit}){
  const [parts, setParts] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(()=>{
    if(showNew){
      const el = document.querySelector('.editor-main')
      if(el){
        el.classList.add('highlight')
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(()=> el.classList.remove('highlight'), 900)
      }
    }
  },[showNew])

  useEffect(()=>{
    async function load(){
      try{
        const res = await fetch('/api/parts')
        const data = await res.json()
        setParts(data || [])
      } catch(e){
        console.warn('Failed to load parts', e)
      }
    }
    load()
  },[])

  async function createPart(e){
    e && e.preventDefault()
    if(!title.trim()) return alert('Title required')
    setSaving(true)
    try{
      const payload = { title: title.trim(), content: content }
      const res = await fetch('/api/parts', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      const created = await res.json()
      setParts(prev=>[created, ...prev])
      setTitle('')
      setContent('')
      setShowNew(false)
      // optionally insert into open contract
      if(onAdd){ onAdd(created) }
    }catch(err){
      console.warn('Create part failed', err)
      alert('Failed to create part')
    }finally{ setSaving(false) }
  }

  async function deletePart(id){
    if(!window.confirm('Delete this part from the library?')) return
    try{
      await fetch(`/api/parts/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setParts(prev=> prev.filter(p=> p.id !== id))
    }catch(err){
      console.warn('Delete failed', err)
      alert('Failed to delete part')
    }
  }

  return (
    <div className="card parts-list">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Part Library</h3>
        <button className="primary" onClick={()=>setShowNew(s=>!s)} style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 10px'}}>
          {!showNew ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 12h14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6l12 12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          {showNew? 'Cancel':'New Part'}
        </button>

      </div>

      {showNew && (
        <form onSubmit={createPart} style={{marginTop:8,display:'flex',flexDirection:'column',gap:8}}>
          <input placeholder="Part title" value={title} onChange={e=>setTitle(e.target.value)} />
          <div style={{display:'flex',gap:8}}>
            <button className="primary" type="submit" disabled={saving}>{saving? 'Saving...':'Create & Add'}</button>
            <button type="button" className="muted" onClick={()=>{ setShowNew(false); setTitle(''); setContent('') }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{marginTop:10}}>
        {parts.map(p=> (
          <div key={p.id} className="part">
            <div>
              <div style={{fontWeight:600}}>{p.title}</div>
              <div className="small">{(p.content||'').slice(0,80)}{(p.content||'').length>80? '…':''}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button className="muted" onClick={()=>onAdd && onAdd(p)}>Add</button>
              <button className="btn-icon" title="Delete part" onClick={()=>deletePart(p.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4H8l-1 2H4" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr />
      <div className="small">Create reusable parts and insert them into the open contract.</div>
    </div>
  )
}
