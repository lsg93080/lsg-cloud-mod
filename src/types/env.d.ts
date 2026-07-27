declare module '*.jpg' {
  const value: string
  export default value
}

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE_URL: string
  readonly VITE_HOST_URL: string
  readonly VITE_HOME_URL?: string
  readonly VITE_VITRINA_URL?: string
  readonly VITE_S01_URL: string
  readonly VITE_S02_URL: string
  readonly VITE_S10_URL: string
  readonly VITE_S11_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
