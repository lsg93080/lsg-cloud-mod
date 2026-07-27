// URLs for cross-service navigation (all go through nginx in production)
export const externalRoutes = {
  vitrina: import.meta.env.VITE_VITRINA_URL || '/vitrina/',
  home: import.meta.env.VITE_HOME_URL || '/home/',
} as const
