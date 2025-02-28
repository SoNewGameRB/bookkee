import { createRouter, createWebHashHistory } from 'vue-router'; // ✅ 使用 Hash 模式，確保 GitHub Pages 可運行

const routes = [
  { path: '/', component: () => import('@/views/LoginPage.vue') }, // ✅ 動態載入
  { 
    path: '/dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    beforeEnter: (to, from, next) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        next(); // ✅ 允許進入
      } else {
        next('/'); // ❌ 未登入，返回登入頁
      }
    }
  },
  { path: '/add-accounting', component: () => import('@/views/AddAccounting.vue') }, // ✅ 確保這個頁面存在
];

const router = createRouter({
  history: createWebHashHistory(), // ✅ 確保 GitHub Pages 運行
  routes,
});

export default router;
