import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * SINGLE=1 собирает всё в один HTML — такой файл открывается двойным кликом
 * с file://, потому что инлайн-модуль не упирается в CORS (в отличие от
 * внешнего <script type="module" src>, который браузер блокирует).
 *
 */
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
  },
})
