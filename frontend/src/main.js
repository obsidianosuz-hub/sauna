import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import './index.css';
import './mockApi.js'; // Client-side mock API database interceptor

const app = createApp(App);
app.use(router);
app.mount('#app');
