import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: "/bookkee/",  // 請確保這是你的 GitHub Repository 名稱
  plugins: [vue()],
});
