# Test Credentials

## Debut/Admin Auth
- POST `/api/auth/verify-debut` with `{"password": "veri2024"}` returns `{"token": "<JWT>"}`
- Bearer token expires in 24h; use as `Authorization: Bearer <token>`
- DEBUT_PASSWORD env in `/app/backend/.env` (default `veri2024`)
