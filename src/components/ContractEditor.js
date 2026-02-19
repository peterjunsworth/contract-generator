import React, {useState, useEffect} from 'react'
import { v4 as uuid } from 'uuid'

function SectionItem({p, index, total, onMoveUp, onMoveDown, onDelete, onChange, editing, onAddSubToPart, onAddSubToParent, onSubChange, onDeleteSub, templates, onUpdatePart, onAIGenerate, onSaveToTemplate, isModified, onResetToTemplate, onSaveAsTemplate}){
  const [expanded, setExpanded] = useState(!(p.content && p.content.toString().trim().length > 0))
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [pendingStyle, setPendingStyle] = useState(null)
  const [customTitle, setCustomTitle] = useState('')

  useEffect(()=>{
    setExpanded(!(p.content && p.content.toString().trim().length > 0))
  },[p.id])

  useEffect(()=>{
    if(editing) setExpanded(true)
  },[editing])

  function promptAndAdd(style){
    setShowAddOptions(false)
    // show inline chooser: templates + custom title
    // we'll show a small chooser by using a window.prompt for custom, or allow choosing from templates listed below
    const useTemplate = window.confirm('Use a template for this subsection? (Cancel to enter custom)')
    if(useTemplate && templates && templates.length>0){
      const t = templates[0] // default to first if none selected; in future could show picker
      onAddSubToPart && onAddSubToPart(p.id, style, t.title, t.content)
    } else {
      const title = window.prompt('Subsection title') || 'Subsection'
      onAddSubToPart && onAddSubToPart(p.id, style, title, '')
    }
    setExpanded(true)
  }

  const [showSectionStyleMenu, setShowSectionStyleMenu] = useState(false)

  return (
    <div className="section" data-part-id={p.id}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,position:'relative'}}>
          <button className="muted" onClick={e=>{ e.stopPropagation(); setExpanded(x=>!x) }} aria-label="Toggle section">{expanded? '▾':'▸'}</button>
          <strong>{p.title}</strong>
          <div style={{marginLeft:8,position:'relative'}}>
            <button className="muted" onClick={e=>{ e.stopPropagation(); setShowSectionStyleMenu(s=>!s) }} title="Section heading format">{(p.style||'numbered')}</button>
            {showSectionStyleMenu && (
              <div className="popover" style={{left:0,top:28,background:'#fff',border:'1px solid #e6eefc',borderRadius:6,padding:6,boxShadow:'0 6px 18px rgba(2,6,23,0.06)'}}>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onUpdatePart && onUpdatePart(p.id,'style','numbered'); setShowSectionStyleMenu(false) }}>Numbered</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onUpdatePart && onUpdatePart(p.id,'style','bulleted'); setShowSectionStyleMenu(false) }}>Bulleted</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onUpdatePart && onUpdatePart(p.id,'style','letters'); setShowSectionStyleMenu(false) }}>Letters</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onUpdatePart && onUpdatePart(p.id,'style','roman'); setShowSectionStyleMenu(false) }}>Roman</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {p.type && p.type !== 'custom' && p.type !== 'ai' && (
            <>
              <button
                className={isModified ? "primary" : "muted"}
                onClick={()=> onSaveToTemplate && onSaveToTemplate(p)}
                title={isModified ? "Save changes to template" : "No changes to save"}
                disabled={!isModified}
              >
                Save to Template
              </button>
              {isModified && (
                <button
                  className="muted"
                  onClick={()=> onResetToTemplate && onResetToTemplate(p)}
                  title="Revert to template version"
                >
                  Reset
                </button>
              )}
            </>
          )}
          {(p.type === 'custom' || p.type === 'ai') && (
            <button
              className="muted"
              onClick={()=> onSaveAsTemplate && onSaveAsTemplate(p)}
              title="Save this section as a reusable template"
            >
              Save as Template
            </button>
          )}
          <div style={{position:'relative'}}>
            <button className="muted" onClick={e=>{ e.stopPropagation(); setShowAddOptions(s=>!s) }} title="Add subsection">Add subsection</button>
            {showAddOptions && (
              <div className="popover" style={{right:0,top:28,width:320,background:'#fff',border:'1px solid #e6eefc',borderRadius:6,padding:8,boxShadow:'0 6px 18px rgba(2,6,23,0.06)'}}>
                {!pendingStyle ? (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <div style={{fontWeight:600}}>Choose format</div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('numbered') }}>Numbered</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('bulleted') }}>Bulleted</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('letters') }}>Letters</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('roman') }}>Roman</button>
                    </div>
                    <div className="small">Or choose a template below</div>
                    <div style={{maxHeight:160,overflow:'auto',display:'flex',flexDirection:'column',gap:6}}>
                      {(templates||[]).map(t=> (
                        <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600}}>{t.title}</div>
                            <div className="small">{(t.content||'').slice(0,80)}</div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('numbered'); onAddSubToPart && onAddSubToPart(p.id,'numbered', t.title, t.content); setShowAddOptions(false); setPendingStyle(null) }}>Use</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <div style={{display:'flex',gap:8,justifyContent:'space-between'}}>
                      <div style={{fontWeight:600}}>Add {pendingStyle} subsection</div>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle(null) }}>Back</button>
                    </div>
                    <input placeholder="Subsection title" value={customTitle} onChange={e=>setCustomTitle(e.target.value)} />
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button className="primary" onClick={e=>{ e.stopPropagation(); onAddSubToPart && onAddSubToPart(p.id, pendingStyle, customTitle||'Subsection', ''); setShowAddOptions(false); setPendingStyle(null); setCustomTitle('') }}>Add</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle(null) }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="muted" onClick={()=>onMoveUp(index)} disabled={index===0}>↑</button>
          <button className="muted" onClick={()=>onMoveDown(index)} disabled={index===total-1}>↓</button>
          <button className="muted" onClick={()=>onDelete(index)}>Delete</button>
        </div>
      </div>

      {expanded && (
        <div>
          <div style={{position:'relative'}}>
            <textarea style={{width:'100%',minHeight:120,padding:8,outline: editing? '2px solid rgba(37,99,235,0.18)':'none'}} value={p.content||''} onChange={(e)=> onChange(p.id, e.target.value)} />
            <button
              className="muted"
              onClick={()=> onAIGenerate && onAIGenerate(p.id, p.title, 'section')}
              style={{position:'absolute',top:8,right:8,fontSize:12,padding:'4px 8px',background:'rgba(255,255,255,0.95)',border:'1px solid #e6eefc'}}
              title="Generate content with AI"
            >
              ✨ AI
            </button>
          </div>

          <div style={{marginTop:12,marginLeft:18,borderLeft:'2px solid rgba(2,6,23,0.03)',paddingLeft:12,display:'flex',flexDirection:'column',gap:10}}>
            {(p.subsections||[]).map((s)=> (
              <SubsectionItem key={s.id} partId={p.id} sub={s} onSubChange={onSubChange} onDeleteSub={onDeleteSub} onAddSubToParent={onAddSubToParent} templates={templates} onAIGenerate={onAIGenerate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContractEditor({contract, onSave, externalEditPart, onExternalConsumed, onAppAddSub, onLiveChange}){
  const [title, setTitle] = useState(contract?.title||'')
  const [parts, setParts] = useState(contract?.parts||[])
  const [newHeader, setNewHeader] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [templates, setTemplates] = useState([])
  const [originalTemplates, setOriginalTemplates] = useState({})

  useEffect(()=>{
    setTitle(contract?.title||'')
    setParts(contract?.parts||[])
  },[contract])

  function updatePart(partId, field, value){
    setParts(prev=> prev.map(p=> p.id===partId? { ...p, [field]: value } : p))
  }

  useEffect(()=>{
    async function loadTemplates(){
      try{
        const res = await fetch('/api/parts')
        const data = await res.json()
        setTemplates(data || [])
        // Store original template data for comparison
        const originals = {}
        ;(data || []).forEach(t => {
          originals[t.id] = {
            title: t.title,
            content: t.content,
            style: t.style || 'numbered',
            subStyle: t.subStyle || 'numbered'
          }
        })
        setOriginalTemplates(originals)
      }catch(e){ console.warn('Failed to load templates', e) }
    }
    loadTemplates()
  },[])

  useEffect(()=>{
    onLiveChange && onLiveChange({ ...contract, title, parts })
  },[title, parts])

  useEffect(()=>{
    // handle external request to add/edit a library part in the main editor
    if(externalEditPart){
      // add to parts and focus its textarea
      const id = uuid()
      const newPart = { id, type: externalEditPart.id || externalEditPart.type, title: externalEditPart.title, content: externalEditPart.content, subsections: [], style: externalEditPart.style || 'numbered', subStyle: externalEditPart.subStyle || 'numbered' }
      setParts(prev=>[...prev, newPart])
      setEditingId(id)
      // allow DOM to update then focus
      setTimeout(()=>{
        const el = document.querySelector(`[data-part-id="${id}"] textarea`)
        if(el){ el.focus(); el.scrollIntoView({behavior:'smooth', block:'center'}) }
        onExternalConsumed && onExternalConsumed()
      }, 120)
    }
  },[externalEditPart, onExternalConsumed])

  // handler used by SectionItem/SubsectionItem to add subs (can be called with 3 or 4 args)
  function handleAddSubFromUI(...args){
    if(args.length===3){
      const [partId, style, title] = args
      addSubToPart(partId, style, title)
    } else if(args.length===4){
      const [partId, parentSubId, style, title] = args
      addSubToParent(partId, parentSubId, style, title)
    }
  }

  // listen for app-level events (from App) to add subsections
  useEffect(()=>{
    function onAdd(e){ const { partId, style, title } = e.detail || {}; if(partId) addSubToPart(partId, style, title) }
    function onAddNested(e){ const { partId, parentSubId, style, title } = e.detail || {}; if(partId && parentSubId) addSubToParent(partId, parentSubId, style, title) }
    window.addEventListener('app:addSub', onAdd)
    window.addEventListener('app:addNestedSub', onAddNested)
    return ()=>{ window.removeEventListener('app:addSub', onAdd); window.removeEventListener('app:addNestedSub', onAddNested) }
  },[])

  function addPartFromTemplate(template){
    setParts(prev=>[...prev, { id: uuid(), type: template.id, title: template.title, content: template.content, subsections: [], style: template.style || 'numbered', subStyle: template.subStyle || 'numbered' }])
  }

  function addCustomSection(){
    setParts(prev=>[...prev, { id: uuid(), type: 'custom', title: newHeader||'New Section', content: '', subsections: [], style: 'numbered', subStyle: 'numbered' }])
    setNewHeader('')
  }

  function isPartModified(part){
    if(!part.type || part.type === 'custom' || part.type === 'ai') return false
    const original = originalTemplates[part.type]
    if(!original) return false

    return (
      part.title !== original.title ||
      part.content !== original.content ||
      (part.style || 'numbered') !== (original.style || 'numbered') ||
      (part.subStyle || 'numbered') !== (original.subStyle || 'numbered')
    )
  }

  async function handleAIGenerateContent(id, titleText, type){
    // Mock AI generation
    const mockContent = `[AI Generated] This is sample content for "${titleText}". In a real implementation, this would call an AI API to generate relevant content based on the section title and context.`

    if(type === 'section'){
      setParts(prev=> prev.map(p=> p.id===id? {...p, content: mockContent} : p))
    } else if(type === 'subsection'){
      // For subsections, we need to update nested structure
      setParts(prev=> prev.map(p=> {
        function updateSubContent(list){
          return (list||[]).map(s=>{
            if(s.id===id) return {...s, content: mockContent}
            if(s.subsections) return {...s, subsections: updateSubContent(s.subsections)}
            return s
          })
        }
        return {...p, subsections: updateSubContent(p.subsections)}
      }))
    }
  }

  async function handleSaveToTemplate(part){
    const confirmed = window.confirm(
      `Save "${part.title}" to template?\n\n` +
      `This will update the template for all future contracts.\n\n` +
      `⚠️ Important: Only contracts using the unchanged template will reflect these updates. ` +
      `Contracts where this section has been customized will NOT be affected.\n\n` +
      `Do you want to continue?`
    )

    if(!confirmed) return

    // Mock API call to save template
    try {
      // In real implementation, this would call:
      // await fetch(`/api/parts/${part.type}`, {
      //   method: 'PUT',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify({
      //     title: part.title,
      //     content: part.content,
      //     style: part.style,
      //     subStyle: part.subStyle
      //   })
      // })

      alert(`✓ Template "${part.title}" saved successfully!\n\nAll new contracts and contracts using the unchanged template will now include these updates.`)
    } catch(e) {
      alert(`Failed to save template: ${e.message}`)
    }
  }

  function handleResetToTemplate(part){
    const confirmed = window.confirm(
      `Reset "${part.title}" to template version?\n\n` +
      `⚠️ Warning: This will discard all your changes to this section and restore the original template content.\n\n` +
      `This action cannot be undone.\n\n` +
      `Do you want to continue?`
    )

    if(!confirmed) return

    const original = originalTemplates[part.type]
    if(!original) {
      alert('Original template not found')
      return
    }

    // Reset the part to original template values
    setParts(prev=> prev.map(p=>
      p.id === part.id
        ? {
            ...p,
            title: original.title,
            content: original.content,
            style: original.style,
            subStyle: original.subStyle
          }
        : p
    ))
  }

  async function handleSaveAsTemplate(part){
    const templateName = window.prompt(
      `Save "${part.title}" as a template?\n\n` +
      `Enter a name for this template (leave blank to use current title):`,
      part.title
    )

    if(templateName === null) return // User cancelled

    const finalName = templateName.trim() || part.title

    const confirmed = window.confirm(
      `Create new template "${finalName}"?\n\n` +
      `This will save this section to the template library so you can reuse it in other contracts.\n\n` +
      `Do you want to continue?`
    )

    if(!confirmed) return

    // Mock API call to create new template
    try {
      // In real implementation, this would call:
      // const res = await fetch('/api/parts', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify({
      //     title: finalName,
      //     content: part.content,
      //     style: part.style || 'numbered',
      //     subStyle: part.subStyle || 'numbered'
      //   })
      // })
      // const newTemplate = await res.json()

      alert(`✓ Template "${finalName}" created successfully!\n\nYou can now use this template in any contract.`)

      // Optionally update the part to reference the new template instead of being "custom"
      // This would require getting the new template ID from the API response
    } catch(e) {
      alert(`Failed to create template: ${e.message}`)
    }
  }

  async function handleAutoCompose(){
    const res = await fetch('/api/ai/compose', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ parts })})
    const composed = await res.json()
    setParts(composed.map(p=>({ ...p, id: uuid() })))
  }

  function moveUp(index){
    if(index<=0) return
    setParts(prev=>{
      const copy = [...prev]
      const tmp = copy[index-1]
      copy[index-1] = copy[index]
      copy[index] = tmp
      return copy
    })
  }

  function moveDown(index){
    setParts(prev=>{
      if(index>=prev.length-1) return prev
      const copy = [...prev]
      const tmp = copy[index+1]
      copy[index+1] = copy[index]
      copy[index] = tmp
      return copy
    })
  }

  function deleteAt(index){
    setParts(prev=> prev.filter((_,i)=> i!==index))
  }

  function handleSectionChange(id, content){
    setParts(prev=> prev.map(p=> p.id===id?{...p, content}:p))
  }

  // subsections handlers
  function addSubToPart(partId, style, title, content){
    const part = parts.find(p=> p.id===partId)
    const useStyle = style || (part && part.subStyle) || 'numbered'
    const sub = { id: uuid(), title: title || 'Subsection', content: content || '', style: useStyle, subsections: [] }
    setParts(prev=> prev.map(p=> p.id===partId? { ...p, subsections: [...(p.subsections||[]), sub] } : p))
  }

  function updateSub(partId, subId, field, value){
    setParts(prev=> prev.map(p=> {
      if(p.id!==partId) return p
      // recursive update through subsections
      function updateList(list){
        return (list||[]).map(s=>{
          if(s.id===subId) return { ...s, [field]: value }
          if(s.subsections) return { ...s, subsections: updateList(s.subsections) }
          return s
        })
      }
      return { ...p, subsections: updateList(p.subsections) }
    }))
  }

  function deleteSub(partId, subId){
    setParts(prev=> prev.map(p=> {
      if(p.id!==partId) return p
      function filterList(list){
        return (list||[]).filter(s=> s.id!==subId).map(s=> ({ ...s, subsections: filterList(s.subsections) }))
      }
      return { ...p, subsections: filterList(p.subsections) }
    }))
  }

  // add nested subsection into a parent subsection (by parentSubId)
  function addSubToParent(partId, parentSubId, style, title, content){
    const part = parts.find(p=> p.id===partId)
    const useStyle = style || (part && part.subStyle) || 'numbered'
    setParts(prev=> prev.map(p=>{
      if(p.id!==partId) return p
      function addInto(list){
        return (list||[]).map(s=>{
          if(s.id===parentSubId){
            const sub = { id: uuid(), title: title||'Subsection', content: content||'', style: useStyle, subsections: [] }
            return { ...s, subsections: [...(s.subsections||[]), sub] }
          }
          if(s.subsections) return { ...s, subsections: addInto(s.subsections) }
          return s
        })
      }
      return { ...p, subsections: addInto(p.subsections) }
    }))
  }

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Editor</h3>
        <div className="controls">
          <button className="muted" onClick={handleAutoCompose}>AI Compose</button>
          <button className="primary" onClick={()=>onSave({ ...contract, title, parts })}>Save</button>
        </div>
      </div>

      <div style={{marginBottom:8}}>
        <input placeholder="Contract title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',padding:8}} />
      </div>

      <div style={{marginBottom:8}}>
        <input placeholder="Custom section header" value={newHeader} onChange={e=>setNewHeader(e.target.value)} style={{width:'70%',padding:8}} />
        <button className="muted" onClick={addCustomSection} style={{marginLeft:8}}>Add Custom Section</button>
      </div>

      <div className="editor-sections">
        {parts.map((p,i)=> (
            <SectionItem key={p.id}
            p={p}
            index={i}
            total={parts.length}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onDelete={deleteAt}
            onChange={handleSectionChange}
            editing={editingId===p.id}
              onAddSubToPart={addSubToPart}
              onAddSubToParent={addSubToParent}
              onSubChange={updateSub}
              onDeleteSub={deleteSub}
                templates={templates}
                onUpdatePart={updatePart}
                onAIGenerate={handleAIGenerateContent}
                onSaveToTemplate={handleSaveToTemplate}
                isModified={isPartModified(p)}
                onResetToTemplate={handleResetToTemplate}
                onSaveAsTemplate={handleSaveAsTemplate}
          />
        ))}
      </div>
    </div>
  )
}

function SubsectionItem({partId, sub, onSubChange, onDeleteSub, onAddSubToParent, templates, onAIGenerate}){
  const [expanded, setExpanded] = useState(!(sub.content && sub.content.toString().trim().length > 0))
  const [showAddOptions, setShowAddOptions] = useState(false)
  const [pendingStyle, setPendingStyle] = useState(null)
  const [customTitle, setCustomTitle] = useState('')
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  useEffect(()=>{
    setExpanded(!(sub.content && sub.content.toString().trim().length > 0))
  },[sub.id])

  function promptAndAdd(style){
    setShowAddOptions(false)
    const title = window.prompt('Subsection title') || 'Subsection'
    // delegate upward: add nested under this sub
    // allow template choice
    const useTemplate = window.confirm('Use a template for this subsection? (Cancel to enter custom)')
    if(useTemplate && templates && templates.length>0){
      const t = templates[0]
      onAddSubToParent && onAddSubToParent(partId, sub.id, style, t.title, t.content)
    } else {
      onAddSubToParent && onAddSubToParent(partId, sub.id, style, title, '')
    }
  }

  return (
    <div style={{padding:6}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8,position:'relative'}}>
          <button className="muted" onClick={e=>{ e.stopPropagation(); setExpanded(x=>!x) }}>{expanded? '▾':'▸'}</button>
          <input value={sub.title||''} onChange={e=> onSubChange(partId, sub.id, 'title', e.target.value)} style={{fontWeight:600,flex:1,padding:6}} />
          <div style={{position:'relative'}}>
            <button className="muted" onClick={e=>{ e.stopPropagation(); setShowStyleMenu(s=>!s) }} title="Subsection format">{(sub.style||'numbered')}</button>
            {showStyleMenu && (
              <div className="popover" style={{left:0,top:28,background:'#fff',border:'1px solid #e6eefc',borderRadius:6,padding:6,boxShadow:'0 6px 18px rgba(2,6,23,0.06)'}}>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onSubChange(partId, sub.id, 'style', 'numbered'); setShowStyleMenu(false) }}>Numbered</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onSubChange(partId, sub.id, 'style', 'bulleted'); setShowStyleMenu(false) }}>Bulleted</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onSubChange(partId, sub.id, 'style', 'letters'); setShowStyleMenu(false) }}>Letters</button>
                  <button className="muted" onClick={e=>{ e.stopPropagation(); onSubChange(partId, sub.id, 'style', 'roman'); setShowStyleMenu(false) }}>Roman</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{position:'relative'}}>
            <button className="muted" onClick={e=>{ e.stopPropagation(); setShowAddOptions(s=>!s) }} title="Add subsection">Add subsection</button>
            {showAddOptions && (
              <div className="popover" style={{right:0,top:28,width:320,background:'#fff',border:'1px solid #e6eefc',borderRadius:6,padding:8,boxShadow:'0 6px 18px rgba(2,6,23,0.06)'}}>
                {!pendingStyle ? (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <div style={{fontWeight:600}}>Choose format</div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('numbered') }}>Numbered</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('bulleted') }}>Bulleted</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('letters') }}>Letters</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('roman') }}>Roman</button>
                    </div>
                    <div className="small">Or choose a template below</div>
                    <div style={{maxHeight:160,overflow:'auto',display:'flex',flexDirection:'column',gap:6}}>
                      {(templates||[]).map(t=> (
                        <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600}}>{t.title}</div>
                            <div className="small">{(t.content||'').slice(0,80)}</div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:6}}>
                            <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle('numbered'); onAddSubToParent && onAddSubToParent(partId, sub.id,'numbered', t.title, t.content); setShowAddOptions(false); setPendingStyle(null) }}>Use</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    <div style={{display:'flex',gap:8,justifyContent:'space-between'}}>
                      <div style={{fontWeight:600}}>Add {pendingStyle} subsection</div>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle(null) }}>Back</button>
                    </div>
                    <input placeholder="Subsection title" value={customTitle} onChange={e=>setCustomTitle(e.target.value)} />
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button className="primary" onClick={e=>{ e.stopPropagation(); onAddSubToParent && onAddSubToParent(partId, sub.id, pendingStyle, customTitle||'Subsection', ''); setShowAddOptions(false); setPendingStyle(null); setCustomTitle('') }}>Add</button>
                      <button className="muted" onClick={e=>{ e.stopPropagation(); setPendingStyle(null) }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="muted" onClick={()=> onDeleteSub(partId, sub.id)}>Delete</button>
        </div>
      </div>
      {expanded && (
        <div style={{marginTop:8}}>
          <div style={{position:'relative'}}>
            <textarea value={sub.content||''} onChange={e=> onSubChange(partId, sub.id, 'content', e.target.value)} style={{width:'100%',minHeight:80,padding:8}} />
            <button
              className="muted"
              onClick={()=> onAIGenerate && onAIGenerate(sub.id, sub.title, 'subsection')}
              style={{position:'absolute',top:8,right:8,fontSize:12,padding:'4px 8px',background:'rgba(255,255,255,0.95)',border:'1px solid #e6eefc'}}
              title="Generate content with AI"
            >
              ✨ AI
            </button>
          </div>

          {/* render nested subsections */}
          <div style={{marginTop:10,marginLeft:18,borderLeft:'2px solid rgba(2,6,23,0.03)',paddingLeft:12,display:'flex',flexDirection:'column',gap:10}}>
            {(sub.subsections||[]).map(ns=> (
              <SubsectionItem key={ns.id} partId={partId} sub={ns} onSubChange={onSubChange} onDeleteSub={onDeleteSub} onAddSubToParent={onAddSubToParent} templates={templates} onAIGenerate={onAIGenerate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
