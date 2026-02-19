import { v4 as uuid } from 'uuid'

export const PART_TEMPLATES = [
  { id: 'non-compete', title: 'Non-Compete Clause', content: 'During the term, the Employee shall not...'},
  { id: 'non-solicit', title: 'Non-Solicitation Clause', content: 'The Parties agree not to solicit...'},
  { id: 'indemnity', title: 'Indemnification', content: 'Each party shall indemnify and hold harmless...'}
]

export const SAMPLE_CONTRACTS = [
  {
    id: uuid(),
    title: 'Sample Consulting Agreement',
    parts: [
      { id: uuid(), type: 'non-compete', title: 'Non-Compete Clause', content: 'During the term, the Employee shall not...'},
      { id: uuid(), type: 'indemnity', title: 'Indemnification', content: 'Each party shall indemnify and hold harmless...'}
    ]
  }
]
