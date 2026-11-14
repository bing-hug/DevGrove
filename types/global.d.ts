declare module '*.json' {
  const value: unknown
  export default value
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_DEBUG: string
  readonly VITE_MOCK_ENABLED: string
  readonly VITE_PORT: string
  readonly VITE_COMPRESSION: string
  readonly VITE_SOURCEMAP: string
}

interface ImportMeta {
  readonly url: string
  readonly env: ImportMetaEnv
}
