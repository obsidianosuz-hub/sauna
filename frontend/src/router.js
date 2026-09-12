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

// Navigation guard for real authenticated routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('sauna_token');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next('/login');
    } else {
      next();
    }
  } else {
    if (token && (to.path === '/login' || to.path === '/admin-login')) {
      next('/');
    } else {
      next();
    }
  }
});

export default router;
