# Backend basis

Deze map is de backend voor jullie schoolproject.

## Mappen

- `public/`
  Hier komt de publieke entrypoint van de API.
- `src/config/`
  Database-instellingen en CORS.
- `src/controllers/`
  Logica per onderdeel, zoals login, potjes en transacties.
- `src/helpers/`
  Kleine hulpfuncties voor JSON responses en request data.

## Basis API routes

- `GET /api/health`
- `POST /api/register`
- `POST /api/login`
- `POST /api/link-parent-child`
- `GET /api/pots`
- `POST /api/pots`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/approvals`
- `PATCH /api/approvals`

## Advies voor jullie team

- Adam werkt vooral in `backend/src/`.
- Andre en Tim gebruiken vooral `src/pages/`, `src/components/` en `src/services/api/`.
- Laat de frontend alleen met fetch-calls naar de PHP API praten.
