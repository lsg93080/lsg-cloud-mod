# bGames-StandardAttributesService (S10)

Normalizes raw sensor readings into standard attribute values for the LifeSync Games Cloud Module's multidimensional user profile.

- **Port:** 3009
- **Stack:** Express + Babel, MySQL
- **Env vars:** `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`

## Run

Normally run via the platform's `docker-compose.yml` (see `infra/deploy/minimal/`). For standalone dev:

```bash
npm install
npm start
```
