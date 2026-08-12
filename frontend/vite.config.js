import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The frontend deliberately reads no environment variables. Its handful of public settings are
// plain constants in src/config.js, which means nothing from .env is ever inlined into the
// browser bundle and a server-side secret cannot leak into shipped JavaScript by accident.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    proxy: {
      // `vercel dev`, run from the repo root, serves the /api functions on port 3000 - the same
      // way they are served same-origin in production. Build output is unaffected by this.
      '/api': 'http://localhost:3000',
    },
  },
})
