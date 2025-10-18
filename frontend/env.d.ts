// / <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_VAULT_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
