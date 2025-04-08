/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_GEMINI_API_ENDPOINT: string
  readonly VITE_GEMINI_API_KEY_1: string
  readonly VITE_GEMINI_API_KEY_2?: string
  readonly VITE_GEMINI_API_KEY_3?: string
  readonly VITE_GEMINI_API_KEY_4?: string
  readonly VITE_GEMINI_API_KEY_5?: string
  readonly VITE_GEMINI_API_KEY_6?: string
  readonly VITE_SUPPORT_API_URL: string
  readonly VITE_NOWPAYMENTS_API_KEY: string
  readonly VITE_NOWPAYMENTS_API_URL: string
  readonly VITE_NOWPAYMENTS_SHOP_ID: string
  readonly VITE_NOWPAYMENTS_IPN_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
