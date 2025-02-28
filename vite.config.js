import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === "production" ? "/bookkee/" : "/", // 🔥 讓本地端不加 `/bookkee/`
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
