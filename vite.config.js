import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './', // ✅ 確保 GitHub Pages 運作
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // ✅ 避免 Vite 拆分內部 Vue 工具，確保 _plugin-vue_export-helper.js 存在
      },
    },
  },
});
