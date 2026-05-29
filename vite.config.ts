import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' && process.env.VITE_BASE_PATH
    ? process.env.VITE_BASE_PATH
    : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
}))
