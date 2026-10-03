/// <reference types="vite/client" />

declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Fixed at package build time; never a runtime user-controlled destination. */
declare const __REMIT_API_ORIGIN__: string
