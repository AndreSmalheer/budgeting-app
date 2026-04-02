# Backend basis

Deze map bevat nu een simpele Node/Express backend die klaar is voor MongoDB.

## Belangrijkste bestanden

- `backend/package.json`
- `backend/.env.example`
- `backend/src/server.js`
- `backend/src/app.js`
- `backend/src/config/database.js`
- `backend/src/controllers/authController.js`

## Routes

- `GET /api/health`
- `GET /api/db-status`
- `POST /api/auth/register`
- `POST /api/auth/login`

## Starten

```bash
cd backend
npm install
npm run dev
```

## Wat jij nog moet doen

1. Maak een MongoDB Atlas database aan.
2. Vul `backend/.env` in.
3. Start daarna de backend.
