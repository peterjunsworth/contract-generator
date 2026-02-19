import React, {useState, useRef} from 'react'

function DocIcon(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )
}

export default function ContractList({contracts, onSelect, onNew, selectedId, onDelete, onUpload}){
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedSections, setUploadedSections] = useState([])
  const [uploadedTitle, setUploadedTitle] = useState('')
  const [selectedSections, setSelectedSections] = useState({})
  const fileInputRef = useRef(null)

  function handleUploadClick(){
    fileInputRef.current?.click()
  }

  async function handleFileChange(e){
    const file = e.target.files?.[0]
    if(!file) return

    // Read file content
    const text = await file.text()

    // Parse the document to extract sections
    const parsed = parseDocument(text, file.type)

    if(parsed.sections.length === 0){
      alert('No sections found in the uploaded document.')
      return
    }

    setUploadedTitle(parsed.title || file.name.replace(/\.[^/.]+$/, ''))
    setUploadedSections(parsed.sections)

    // Select all sections by default
    const defaults = {}
    parsed.sections.forEach((_, idx) => { defaults[idx] = true })
    setSelectedSections(defaults)

    setShowUploadModal(true)

    // Reset file input
    e.target.value = ''
  }

  function parseDocument(text, fileType){
    // Mock parser - in real implementation, this would handle different file types
    const lines = text.split('\n')
    const sections = []
    let currentSection = null

    // Try to parse markdown-style headers first
    lines.forEach(line => {
      // Check for section headers (lines starting with ## or single # followed by number)
      if(line.trim().match(/^#{1,3}\s+/) || line.trim().match(/^\d+\.\s+[A-Z]/)){
        if(currentSection){
          sections.push(currentSection)
        }
        const title = line.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim()
        currentSection = { title, content: '' }
      } else if(currentSection && line.trim()){
        currentSection.content += (currentSection.content ? '\n' : '') + line
      }
    })

    if(currentSection){
      sections.push(currentSection)
    }

    // If no sections found, create mock sections for demo purposes
    if(sections.length === 0){
      const sampleContent = text.slice(0, 200) + (text.length > 200 ? '...' : '')
      sections.push(
        { title: 'Introduction', content: sampleContent },
        { title: 'Terms and Conditions', content: 'This section contains the main terms and conditions of the agreement.' },
        { title: 'Payment Terms', content: 'Details regarding payment schedules, methods, and terms.' },
        { title: 'Termination', content: 'Conditions under which this agreement may be terminated.' },
        { title: 'Miscellaneous', content: 'Additional provisions and general clauses.' }
      )
    }

    // Extract title from first # heading or use filename
    const titleMatch = text.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : ''

    return { title, sections }
  }

  function toggleSection(idx){
    setSelectedSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  function handleSaveAsTemplates(){
    const selected = uploadedSections.filter((_, idx) => selectedSections[idx])
    if(selected.length === 0){
      alert('Please select at least one section.')
      return
    }

    onUpload && onUpload({
      action: 'templates',
      sections: selected
    })

    setShowUploadModal(false)
    alert(`✓ ${selected.length} section(s) saved as templates!`)
  }

  function handleSaveAsContract(){
    const selected = uploadedSections.filter((_, idx) => selectedSections[idx])
    if(selected.length === 0){
      alert('Please select at least one section.')
      return
    }

    onUpload && onUpload({
      action: 'contract',
      title: uploadedTitle,
      sections: selected
    })

    setShowUploadModal(false)
    alert(`✓ Contract "${uploadedTitle}" created!`)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 4px'}}>
        <h3 style={{margin:0}}>Contracts</h3>
        <div style={{display:'flex',gap:8}}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.doc,.docx,application/pdf"
            style={{display:'none'}}
            onChange={handleFileChange}
          />
          <button className="muted" onClick={handleUploadClick} style={{padding:'6px 10px'}}>Upload</button>
          <button className="primary" onClick={onNew} style={{padding:'6px 10px'}}>New</button>
        </div>
      </div>
      <ul className="contract-list">
        {contracts.map(c=> (
          <li key={c.id} onClick={()=>onSelect(c)} className={c.id===selectedId? 'selected':''}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <DocIcon />
              <div>
                <div className="contract-title">{c.title}</div>
                <div className="small">{(c.parts||[]).length} parts</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="small">{new Date(parseInt(c.id||0)).getFullYear() || ''}</div>
              <button
                className="btn-icon"
                title="Delete contract"
                onClick={e=>{ e.stopPropagation(); if(window.confirm('Delete this contract?')) onDelete && onDelete(c.id) }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showUploadModal && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fff',borderRadius:8,padding:24,maxWidth:600,width:'90%',maxHeight:'80vh',overflow:'auto',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
            <h3 style={{marginTop:0}}>Upload Contract: {uploadedTitle}</h3>
            <p style={{marginBottom:16,color:'#64748b'}}>
              Select which sections you want to save. You can save them as reusable templates or as a standalone contract.
            </p>

            <div style={{marginBottom:20}}>
              <div style={{fontWeight:600,marginBottom:12}}>Sections Found ({uploadedSections.length})</div>
              <div style={{maxHeight:300,overflow:'auto',border:'1px solid #e2e8f0',borderRadius:6,padding:8}}>
                {uploadedSections.map((section, idx) => (
                  <label key={idx} style={{display:'flex',alignItems:'start',gap:12,padding:12,cursor:'pointer',borderBottom: idx < uploadedSections.length - 1 ? '1px solid #f1f5f9' : 'none'}} onClick={() => toggleSection(idx)}>
                    <input
                      type="checkbox"
                      checked={selectedSections[idx] || false}
                      onChange={() => {}}
                      style={{marginTop:4,cursor:'pointer'}}
                    />
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,marginBottom:4}}>{section.title}</div>
                      <div style={{fontSize:14,color:'#64748b',maxHeight:60,overflow:'hidden',textOverflow:'ellipsis'}}>
                        {section.content.slice(0, 150)}{section.content.length > 150 ? '...' : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:8,fontWeight:600}}>Contract Title</label>
              <input
                type="text"
                value={uploadedTitle}
                onChange={(e) => setUploadedTitle(e.target.value)}
                style={{width:'100%',padding:8,border:'1px solid #e2e8f0',borderRadius:4}}
                placeholder="Enter contract title"
              />
            </div>

            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button className="muted" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="muted" onClick={handleSaveAsTemplates}>Save as Templates</button>
              <button className="primary" onClick={handleSaveAsContract}>Save as Contract</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
