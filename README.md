# bGames-APIrestPOSTAtt (S02)

Write side of the LifeSync Games Cloud Module's multidimensional user profile. Records acquired/spent attribute points and applies initial and real-time attribute updates.

- **Port:** 3002
- **Stack:** Express + Babel, MySQL
- **Env vars:** `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`

## Run

Normally run via the platform's `docker-compose.yml` (see `infra/deploy/minimal/`). For standalone dev:

```bash
npm install
npm start
```
