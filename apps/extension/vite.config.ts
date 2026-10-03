import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import manifest from './manifest.json'

const productionOrigin = 'https://remitance-buddy.vercel.app'
const apiOrigin = process.env.EXTENSION_API_ORIGIN || productionOrigin
const parsedOrigin = new URL(apiOrigin)
if (
  parsedOrigin.protocol !== 'https:' ||
  parsedOrigin.origin !== apiOrigin ||
  parsedOrigin.username ||
  parsedOrigin.password ||
  !parsedOrigin.hostname.endsWith('.vercel.app')
) {
  throw new Error(
    'EXTENSION_API_ORIGIN must be one exact HTTPS Vercel origin with no path or credentials'
  )
}
const buildManifest = {
  ...manifest,
  ...(apiOrigin === productionOrigin
    ? {}
    : { name: 'My Remittance Pal — preview test', short_name: 'Pal preview test' }),
  homepage_url: apiOrigin,
  host_permissions: [`${apiOrigin}/*`],
}

export default defineConfig({
  define: { __REMIT_API_ORIGIN__: JSON.stringify(apiOrigin) },
  plugins: [react(), crx({ manifest: buildManifest })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    cors: {
      origin: '*',
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'src/sidepanel/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        options: resolve(__dirname, 'src/options/index.html'),
      },
    },
  },
})
