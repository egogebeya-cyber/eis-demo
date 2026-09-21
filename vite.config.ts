import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3010,
    strictPort: true,
    allowedHosts: ['.trycloudflare.com', 'localhost', '127.0.0.1'],
    watch: {
      ignored: ['**/.output/**', '**/public/**', '**/data/**'],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro(),
  ],
})
