import { createRouter, createWebHashHistory } from 'vue-router';
import PinCodeLogin from './components/PinCodeLogin.vue';
import Dashboard from './components/Dashboard.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: PinCodeLogin
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: PinCodeLogin
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Navigation guard to enforce auto-login in demo mode
router.beforeEach((to, from, next) => {
  let token = localStorage.getItem('sauna_token');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // Auto login as Super Admin for instant client-side demo entry
      localStorage.setItem('sauna_token', 'mock-jwt-token-sauna-12345');
      localStorage.setItem('sauna_user', JSON.stringify({
        id: 1,
        name: "A.Axadov",
        pinCode: "1111",
        role: "super_admin",
        email: "admin@portfolio.com"
      }));
      next();
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
