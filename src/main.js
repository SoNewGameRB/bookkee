import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// ✅ 防止應用程式因錯誤無限重新載入
app.config.errorHandler = (err, instance, info) => {
  console.error("❌ Vue 全域錯誤:", err, info);
};

app.use(router);
app.mount('#app');
