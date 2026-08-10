# bGames-APIRestGETService (S01)

Read side of the LifeSync Games Cloud Module's multidimensional user profile. Serves player attribute/subattribute values and their per-sensor contribution breakdowns.

- **Port:** 3001
- **Stack:** Express + Babel, MySQL
- **Env vars:** `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`

## Run

Normally run via the platform's `docker-compose.yml` (see `infra/deploy/minimal/`). For standalone dev:

```bash
npm install
npm start
```
