import { createRouter, createWebHashHistory  } from 'vue-router'; // ✅ 改成 createWebHistory
import LoginPage from './views/LoginPage.vue';
import DashboardPage from './views/DashboardPage.vue';
import AddAccounting from './views/AddAccounting.vue';

const routes = [
  { path: '/', component: LoginPage },
  { 
    path: '/dashboard',
    component: DashboardPage,
    beforeEnter: (to, from, next) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        next(); // ✅ 允許進入
      } else {
        next('/'); // ❌ 未登入，返回登入頁
      }
    }
  },
  { path: '/add-accounting', component: AddAccounting },
];

const router = createRouter({
  history: createWebHashHistory(), // ✅ 確保 GitHub Pages 可運行
  routes: [
    { path: '/', component: () => import('./views/Login.vue') },
    { path: '/dashboard', component: () => import('./views/Dashboard.vue') },
  ],
});

export default router;
