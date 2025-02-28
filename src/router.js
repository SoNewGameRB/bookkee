import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', component: () => import('../views/LoginPage.vue') }, // ✅ 使用相對路徑
  { path: '/dashboard', component: () => import('../views/DashboardPage.vue') },
  { path: '/add-accounting', component: () => import('../views/AddAccounting.vue') },
];

const router = createRouter({
  history: createWebHashHistory(), // ✅ 確保 GitHub Pages 可運行
  routes,
});

export default router;
