/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_FREE_PRICE_ID: string
  readonly VITE_STRIPE_STARTER_PRICE_ID: string
  readonly VITE_STRIPE_PRO_PRICE_ID: string
  readonly VITE_STRIPE_ENTERPRISE_PRICE_ID: string
  readonly VITE_COGNITO_AUTHORITY: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REDIRECT_URI: string
  readonly VITE_COGNITO_SCOPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}