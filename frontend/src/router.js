import { createRouter, createWebHistory } from 'vue-router';
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
  history: createWebHistory(),
  routes
});

// Navigation guard to enforce authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('sauna_token');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
