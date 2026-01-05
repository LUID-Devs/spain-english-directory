/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LUIDHUB_API_URL: string
  readonly VITE_LUIDHUB_URL: string
  readonly VITE_COGNITO_AUTHORITY: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REDIRECT_URI: string
  readonly VITE_COGNITO_SCOPE: string
  readonly VITE_COGNITO_DOMAIN: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_REGION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
