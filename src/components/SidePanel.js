import React from 'react'

function toMarkdown(contract){
  if(!contract) return ''
  const lines = [`# ${contract.title}\n`]
  (contract.parts||[]).forEach((p,i)=>{
    lines.push(`## ${i+1}. ${p.title}\n`)
    // strip HTML if present (very naive)
    const text = (p.content||'').replace(/<[^>]*>/g,'')
    lines.push(text + '\n')
  })
  return lines.join('\n')
}

function formatSectionNumber(index, style){
  const num = index + 1
  if(style === 'bulleted') return '•'
  if(style === 'letters') return String.fromCharCode(96 + num) + '.'
  if(style === 'roman') return toRoman(num) + '.'
  return num + '.'
}

function toRoman(num){
  const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}
  let str = ''
  for(let key of Object.keys(roman)){
    const q = Math.floor(num / roman[key])
    num -= q * roman[key]
    str += key.repeat(q)
  }
  return str.toLowerCase()
}

export default function SidePanel({contract}){
  function handleExport(){
    const md = toMarkdown(contract)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(contract?.title||'agreement').replace(/\s+/g,'_')}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card" style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>Preview</h3>
        <div style={{display:'flex',gap:8}}>
          <button className="muted btn-icon" onClick={handleExport} disabled={!contract} title="Export markdown">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7l4-4 4 4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21H3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="muted btn-icon" onClick={()=>openPrintPreview(contract)} disabled={!contract} title="Print preview">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9V3h12v6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="13" width="12" height="8" rx="2" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="preview-scroll">
        {!contract && <div className="small">Open a contract to preview its composed content.</div>}
        {contract && (
          <div>
            <h2 style={{marginTop:0}}>{contract.title}</h2>
            {(contract.parts||[]).map((p,i)=> (
              <section key={p.id} style={{marginBottom:18}}>
                <h4 style={{margin:'6px 0'}}>{formatSectionNumber(i, p.style || 'numbered')} {p.title}</h4>
                <div style={{whiteSpace:'pre-wrap',color:'#0f172a',lineHeight:1.45}}>{(p.content||'').replace(/<[^>]*>/g,'')}</div>
                {/* render subsections recursively */}
                {renderSubsections(p.subsections||[], null, p.subStyle || 'numbered')}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function renderSubsections(list, parentStyle, defaultStyle){
  if(!list || !list.length) return null

  function renderList(items, depth, fallbackStyle){
    if(!items || !items.length) return null

    // Group items by their style
    const groups = []
    let currentGroup = null

    items.forEach(item => {
      const itemStyle = item.style || fallbackStyle
      if(!currentGroup || currentGroup.style !== itemStyle){
        currentGroup = { style: itemStyle, items: [] }
        groups.push(currentGroup)
      }
      currentGroup.items.push(item)
    })

    return groups.map((group, groupIdx) => {
      const listStyle = group.style
      const isOrdered = listStyle === 'numbered' || listStyle === 'letters' || listStyle === 'roman'
      const olProps = {}
      if(listStyle === 'letters') olProps.type = 'a'
      if(listStyle === 'roman') olProps.type = 'i'

      if(isOrdered){
        return (
          <ol key={groupIdx} style={{marginTop:8,marginBottom:8,paddingLeft: depth>0?20:20}} {...olProps}>
            {group.items.map(s=> (
              <li key={s.id} style={{marginBottom:8}}>
                <div style={{fontWeight:600}}>{s.title}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{(s.content||'').replace(/<[^>]*>/g,'')}</div>
                {renderList(s.subsections, depth+1, s.style || fallbackStyle)}
              </li>
            ))}
          </ol>
        )
      }
      return (
        <ul key={groupIdx} style={{marginTop:8,marginBottom:8,paddingLeft: depth>0?20:20}}>
          {group.items.map(s=> (
            <li key={s.id} style={{marginBottom:8}}>
              <div style={{fontWeight:600}}>{s.title}</div>
              <div style={{whiteSpace:'pre-wrap'}}>{(s.content||'').replace(/<[^>]*>/g,'')}</div>
              {renderList(s.subsections, depth+1, s.style || fallbackStyle)}
            </li>
          ))}
        </ul>
      )
    })
  }

  return renderList(list, 0, parentStyle || defaultStyle || 'numbered')
}

function openPrintPreview(contract){
  if(!contract) return
  const w = window.open('', '_blank', 'toolbar=0,location=0,menubar=0')
  const partsHtml = (contract.parts||[]).map((p,i)=>{
    const body = escapeHtml((p.content||'').replace(/\n/g,'<br/>'))
    const sectionNum = formatSectionNumber(i, p.style || 'numbered')
    return '<section><h2>' + sectionNum + ' ' + (p.title||'') + '</h2><div>' + body + '</div></section>'
  }).join('')

  const html = '<html><head>' +
    '<title>' + (contract.title||'') + '</title>' +
    '<style>body{font-family: Arial, Helvetica, sans-serif;padding:20px;color:#0f172a}h1{font-size:20px}h2{font-size:16px;margin-top:18px}section{margin-bottom:12px}</style>' +
    '</head><body>' +
    '<h1>' + (contract.title||'') + '</h1>' +
    partsHtml +
    '<script>window.onload = function(){ window.print() }</script>' +
    '</body></html>'
  w.document.open()
  w.document.write(html)
  w.document.close()
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
