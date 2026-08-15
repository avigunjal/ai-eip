# AI-EIP — AI Engineering Intelligence Platform

Monorepo for the AI-EIP platform. Both apps are self-contained with their own
dependencies, scripts, and configuration.

## Structure

```
ai-eip/
├── frontend/   # React + Vite frontend (AI-EIP UI mock)
├── backend/    # Backend services
└── docs/       # Shared specs and documentation
```

## Frontend

```bash
cd frontend
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

See `frontend/README.md` for details.

## Backend

```bash
cd backend
npm install
# see backend/.env.example for configuration
```
