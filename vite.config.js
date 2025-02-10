import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({

// });

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  return {
    root: 'vue-app',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      minify: mode == 'production',
    },
    plugins: [
      vue(),
      tailwindcss(),
    ]
  }
})