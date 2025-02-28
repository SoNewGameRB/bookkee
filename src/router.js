import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: process.env.NODE_ENV === "production" ? createWebHashHistory() : createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/LoginPage.vue') },
    { path: '/dashboard', component: () => import('./views/DashboardPage.vue') },
    { path: '/add-accounting', component: () => import('./views/AddAccounting.vue') },
  ],
});

export default router;
