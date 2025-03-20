import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import DashboardPage from './views/DashboardPage.vue';
import AddAccounting from './views/AddAccounting.vue';

const routes = [
  { path: '/', component: LoginPage }, // ✅ `/` 正確對應 `LoginPage.vue`
  { path: '/dashboard', component: DashboardPage },
  { path: '/add-accounting', component: AddAccounting },
  { path: '/logout', redirect: '/' }, // ✅ `/logout` 應該回到 `/`
];

const router = createRouter({
  history: createWebHistory(), // ✅ 確保不使用 `/bookkee/`
  routes,
});

export default router;
