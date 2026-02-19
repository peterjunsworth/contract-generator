import React, {useState, useEffect} from 'react'
import ContractList from './components/ContractList'
import PartLibrary from './components/PartLibrary'
import ContractEditor from './components/ContractEditor'
import SidePanel from './components/SidePanel'

const API = process.env.REACT_APP_API_URL || ''

export default function App(){
  const [contracts, setContracts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [externalEditPart, setExternalEditPart] = useState(null)
  const [liveContract, setLiveContract] = useState(null)
  useEffect(()=>{
    async function load(){
      setLoading(true)
      try {
        const res = await fetch(`${API}/api/contracts`)
        if (!res.ok) {
          console.error('API fetch failed:', res.status, res.statusText)
          setContracts([])
          setSelected(null)
          setLoading(false)
          return
        }
        const data = await res.json()
        setContracts(data || [])
        setSelected((data||[])[0]||null)
      } catch(err) {
        console.error('Failed to load contracts:', err)
        setContracts([])
        setSelected(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  },[])

  useEffect(()=>{
    function onFull(){ setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFull)
    return ()=> document.removeEventListener('fullscreenchange', onFull)
  },[])

  async function handleNew(){
    const c = { id: Date.now().toString(), title: 'Untitled Agreement', parts: [] }
    const res = await fetch(`${API}/api/contracts`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(c)})
    const created = await res.json()
    setContracts(prev=>[created,...prev])
    setSelected(created)
  }

  async function handleUpload(data){
    const { action, title, sections } = data

    if(action === 'templates'){
      // Save each section as a template
      for(const section of sections){
        try {
          // Mock API call - in real implementation:
          // await fetch(`${API}/api/parts`, {
          //   method: 'POST',
          //   headers: {'Content-Type': 'application/json'},
          //   body: JSON.stringify({
          //     title: section.title,
          //     content: section.content,
          //     style: 'numbered',
          //     subStyle: 'numbered'
          //   })
          // })
          console.log('Saved template:', section.title)
        } catch(err) {
          console.warn('Failed to save template:', section.title, err)
        }
      }
    } else if(action === 'contract'){
      // Create a new contract with the selected sections
      const parts = sections.map(section => ({
        id: Date.now().toString() + Math.random(),
        type: 'custom',
        title: section.title,
        content: section.content,
        subsections: [],
        style: 'numbered',
        subStyle: 'numbered'
      }))

      const newContract = {
        id: Date.now().toString(),
        title: title || 'Uploaded Agreement',
        parts
      }

      const res = await fetch(`${API}/api/contracts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newContract)
      })

      const created = await res.json()
      setContracts(prev => [created, ...prev])
      setSelected(created)
    }
  }

  async function handleSave(updated){
    await fetch(`${API}/api/contracts/${updated.id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(updated)})
    setContracts(prev=> prev.map(p=> p.id===updated.id?updated:p))
    setSelected(updated)
  }

  async function handleAddPart(template){
    if(!selected) return alert('Open or create a contract first')
    const newPart = { id: Date.now().toString(), type: template.id, title: template.title, content: template.content }
    await fetch(`${API}/api/contracts/${selected.id}/parts`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ part: newPart })})
    const updated = { ...selected, parts: [...(selected.parts||[]), newPart] }
    setContracts(prev=> prev.map(c=> c.id===selected.id?updated:c))
    setSelected(updated)
  }

  // no-op: PartLibrary handles its own new-part form

  async function handleDeleteContract(id){
    if(!id) return
    try{
      await fetch(`${API}/api/contracts/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setContracts(prev=> prev.filter(c=> c.id !== id))
      if(selected?.id === id) setSelected(null)
    }catch(err){
      console.warn('Delete contract failed', err)
      alert('Failed to delete contract')
    }
  }

  function handleEditPartFromLibrary(part){
    setExternalEditPart(part)
  }

  function consumeExternalEdit(){ setExternalEditPart(null) }

  // wrapper to handle add-subsection from section or nested subsection
  function handleAddSub(...args){
    // args can be: (partId, style, title) for top-level subsection
    // or (partId, parentSubId, style, title) for nested under a subsection
    if(args.length===3){
      const [partId, style, title] = args
      // call editor-level handler by dispatching a custom event the editor listens for
      window.dispatchEvent(new CustomEvent('app:addSub', { detail: { partId, style, title } }))
    } else if(args.length===4){
      const [partId, parentSubId, style, title] = args
      window.dispatchEvent(new CustomEvent('app:addNestedSub', { detail: { partId, parentSubId, style, title } }))
    }
  }

  if(loading) return <div style={{padding:24}}>Loading...</div>

  return (
    <div className={"app" + (isFullscreen? ' is-fullscreen':'')}>
      <div className="grid left-focused">
        <div className="left-col">
          <ContractList contracts={contracts} onSelect={setSelected} onNew={handleNew} selectedId={selected?.id} onDelete={handleDeleteContract} onUpload={handleUpload} />
          <div style={{height:12}} />
          <PartLibrary onAdd={handleAddPart} onEdit={handleEditPartFromLibrary} />
        </div>

        <div className="editor-main">
          <ContractEditor contract={selected||{title:'',parts:[]}} onSave={handleSave} externalEditPart={externalEditPart} onExternalConsumed={consumeExternalEdit} onAppAddSub={handleAddSub} onLiveChange={setLiveContract} />
        </div>

        <div className="right-col">
            <SidePanel contract={liveContract || selected} />
        </div>
      </div>
    </div>
  )
}

