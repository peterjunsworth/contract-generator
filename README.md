# Agreement Manager (Mock)

This is a minimal React app scaffold (mock data) for creating and editing contracts and agreements.

Getting started:

1. Install dependencies and run dev (client + mock API):

```bash
cd /Users/peterunsworth/Documents/agreement_manager
npm install
npm run dev
```

If `npm install` fails due to peer conflicts, retry with:

```bash
npm install --legacy-peer-deps
```

If you still see dependency resolution errors, try cleaning and reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
```

Features:
- Create new agreements or contracts
- Add predefined contract parts (non-compete, non-solicit, indemnity)
- Stack parts and reorder via drag-and-drop
- Add custom sections with a WYSIWYG editor
- Mock AI section generation (simulated)

Notes:
- This project uses mock AI functions; replace `src/ai.js` with real API integration if desired.
