// Mock AI generator. Replace with real API integration as needed.
export async function generateSection({title, purpose}){
  // Simulate network latency
  await new Promise(r=>setTimeout(r,800))
  const body = `Generated section for ${title || purpose || 'agreement'}:\n\nThis section outlines obligations and scope. It is a starting draft — please review and edit.`
  return { title: title || 'AI Generated Section', content: body }
}

export async function composeAgreementFromParts(parts){
  await new Promise(r=>setTimeout(r,600))
  return parts.map((p,i)=>({ ...p, content: p.content || `Auto-composed part ${i+1}: ${p.title}`}))
}
