# MongoDB setup

## Wat jij zelf moet doen

1. Maak een account aan op MongoDB Atlas.
2. Maak een gratis cluster aan.
3. Maak een database user aan met een gebruikersnaam en wachtwoord.
4. Zet bij Network Access tijdelijk je eigen IP of `0.0.0.0/0` voor testen.
5. Klik op `Connect` en kies `Drivers`.
6. Kopieer de connection string.
7. Maak in `backend/` een bestand `.env`.
8. Kopieer de waarden uit `.env.example` naar `.env`.
9. Vul daar jouw echte `MONGODB_URI` in.
10. Controleer dat `MONGODB_DB_NAME=budgetting_bp03` klopt.

## Wat de app daarna gebruikt

- Collection `users`
- Collection `parentChildLinks`
- Collection `pots`
- Collection `transactions`

## Backend starten

```bash
cd backend
npm install
npm run dev
```

## Frontend starten

```bash
cd ..
npm install
npm run dev
```

## Test URLs

- Backend health: `http://localhost:5050/api/health`
- Backend db-status: `http://localhost:5050/api/db-status`
- Frontend: `http://127.0.0.1:5173`
