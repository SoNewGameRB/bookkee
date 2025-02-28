import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: "/bookkee/", // ✅ 必須設置為 GitHub Pages 的 Repo 名稱
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ 確保 `@/` 可以正常解析
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined, // ✅ 避免 Vite 產生 `_plugin-vue_export-helper.js` 這種奇怪的路徑
      },
    },
  },
});
