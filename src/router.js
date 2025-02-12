import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import DashboardPage from './views/DashboardPage.vue';
import AddAccounting from './views/AddAccounting.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard', component: DashboardPage },
  { path: '/add-accounting', component: AddAccounting },
];

const router = createRouter({
  history: createWebHashHistory(), // ✅ 使用 Hash 模式，確保 GitHub Pages 可運行
  routes,
});

export default router;
