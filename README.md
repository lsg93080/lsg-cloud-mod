# bGames-UserManagementService (S11)

Player/user CRUD for the LifeSync Games Cloud Module — the SSO bridge point where an LSG JWT resolves to a MySQL player record.

- **Port:** 3010
- **Stack:** Express + Babel, MySQL
- **Env vars:** `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`

## Run

Normally run via the platform's `docker-compose.yml` (see `infra/deploy/minimal/`). For standalone dev:

```bash
npm install
npm start
```
