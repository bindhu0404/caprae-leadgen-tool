/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAULT_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
