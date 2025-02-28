import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory("/bookkee/"), // ✅ 確保 GitHub Pages 正確處理
  routes: [
    { path: '/', component: () => import('./views/LoginPage.vue') },
    { path: '/dashboard', component: () => import('./views/DashboardPage.vue') },
    { path: '/add-accounting', component: () => import('./views/AddAccounting.vue') },
  ],
});

export default router;
