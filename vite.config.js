import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: "/bookkee/", // 🔥 這裡要設定為 GitHub Pages 的 repo 名稱
});
