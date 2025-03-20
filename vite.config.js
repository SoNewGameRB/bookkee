import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // ✅ Netlify 需要這個，不能設 '/bookkee/'
})
