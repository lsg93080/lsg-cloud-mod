# LifeSync Games Cloud (Profile Frontend)

Vue 3 + Vite SPA for the Cloud Module (S12), the multidimensional user profile dashboard.

## Requirements

- Node >= 18

## Setup

```sh
npm install
```

## Environment variables

Create a `.env` file in the project root (see `.env.example`).

```sh
# Firebase (auth provider). Get these from your Firebase project settings.
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"

# Auth Service (SSO, JWT exchange)
VITE_AUTH_SERVICE_URL="http://localhost:3000/api/v1"

# Cross-service navigation (trailing slash required)
VITE_HOST_URL="http://localhost:8081/cloud/"
VITE_HOME_URL="http://localhost/home/"
VITE_VITRINA_URL="http://localhost:3007/vitrina/"

# Cloud Module backend services (S01, S02, S10, S11)
VITE_S01_URL="http://localhost:3001"
VITE_S02_URL="http://localhost:3002"
VITE_S10_URL="http://localhost:3009"
VITE_S11_URL="http://localhost:3010"
```

## Development

```sh
npm run dev
```

The dev server runs on port 8081 (configurable in `vite.config.js`).

The app is served under the `/cloud/` base path, so open `http://localhost:8081/cloud/`.
In the full platform it sits behind an nginx reverse proxy that maps `/cloud/` to this app.

## Build

```sh
npm run build
```

## Test and lint

```sh
npm run test:unit    # Vitest
npm run lint         # ESLint
npm run type-check   # vue-tsc
```
