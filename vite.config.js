import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/oradoadmin/',    // ✅ important for subpath deployment
  server: {
    port: 5176,             // fixed port for admin side
    host: "0.0.0.0"
  },
  plugins: [react(), tailwindcss()],
})
