import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: 'vue-app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  plugins: [
    vue(),
    tailwindcss(),
  ]
});