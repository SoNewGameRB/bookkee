import { createRouter, createWebHistory } from 'vue-router'; // ✅ 改成 createWebHistory
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
  history: createWebHistory(), // ✅ 改成 history 模式
  routes,
});

export default router;
