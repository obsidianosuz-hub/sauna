<template>
  <div class="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 font-sans p-6">
    <!-- Header with Language Selector -->
    <header class="flex justify-between items-center max-w-md mx-auto w-full">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-lg bg-black border border-[#c5a059] flex items-center justify-center text-[#c5a059] font-bold text-lg">S</div>
        <span class="font-semibold text-lg tracking-tight">SAUNA.UZ</span>
      </div>
      
      <!-- Language Selector -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <select 
            v-model="currentLang" 
            @change="updateLanguage"
            class="bg-white border border-zinc-200 text-zinc-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Main Login Card -->
    <main class="max-w-md mx-auto w-full my-auto py-8">
      <div class="bg-white border border-zinc-200/80 shadow-xl rounded-3xl p-8 transition-all duration-300 min-h-[420px] flex flex-col justify-center">
        
        <!-- PREVIEW LOADING STATE -->
        <div v-if="pageLoading" class="flex flex-col items-center justify-center my-auto">
          <!-- Premium pulsing gold logo or spinner -->
          <div class="relative w-20 h-20 mb-6 flex items-center justify-center">
            <!-- Outer pulsing golden rings -->
            <div class="absolute inset-0 rounded-full border-2 border-[#c5a059]/25 animate-ping"></div>
            <div class="absolute inset-2 rounded-full border border-[#c5a059]/40 animate-pulse"></div>
            <!-- Center black/gold coin -->
            <div class="w-12 h-12 rounded-full bg-zinc-950 border-2 border-[#c5a059] flex items-center justify-center text-[#c5a059] font-black text-xl shadow-lg">
              S
            </div>
          </div>
          <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">{{ t('loading') }}...</p>
        </div>

        <!-- LOGIN FORM CONTENT -->
        <div v-else class="animate-fadeIn">
          
          <div class="flex flex-col">
            <h2 class="text-2xl font-bold text-center mb-2 tracking-tight">
              {{ isAdminMode ? t('welcome_admin') : t('welcome_cashier') }}
            </h2>
            <p class="text-sm text-zinc-400 text-center mb-6">
              {{ isAdminMode ? t('enter_admin_desc') : t('enter_cashier_desc') }}
            </p>

            <form @submit.prevent="handleLoginSubmit" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('gmail_label') }}</label>
                <input 
                  v-model="emailInput"
                  type="email" 
                  :placeholder="isAdminMode ? 'admin@sauna.uz' : 'cashier@sauna.uz'"
                  required
                  class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{{ t('password_label') }}</label>
                <input 
                  v-model="passwordInput"
                  type="password" 
                  placeholder="••••••••"
                  required
                  class="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button 
                type="submit" 
                :disabled="loading"
                class="w-full bg-black text-white hover:bg-zinc-800 transition-colors py-3.5 rounded-xl font-semibold text-sm active:scale-95 duration-150 flex justify-center items-center"
              >
                <span v-if="loading" class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {{ t('login_btn') }}
              </button>
            </form>
          </div>

          <!-- Alert messages -->
          <div 
            v-if="errorMessage" 
            class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-center"
          >
            {{ errorMessage }}
          </div>

        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="text-center text-xs text-zinc-400 mt-6">
      © {{ new Date().getFullYear() }} Sauna & Hamom Management System. v1.0.0
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();

const currentLang = ref(localStorage.getItem('sauna_lang') || 'uz');
const isAdminMode = computed(() => route.path === '/admin-login');
const pageLoading = ref(true);

const emailInput = ref('');
const passwordInput = ref('');
const errorMessage = ref('');
const loading = ref(false);

// Multi-language translation helper
const translations = {
  uz: {
    welcome_admin: "Super Admin Tizimi",
    enter_admin_desc: "Gmail va maxfiy parolingiz orqali kiring",
    welcome_cashier: "Kassir Kirish Tizimi",
    enter_cashier_desc: "Kassir Gmail manzili va parolingiz orqali kiring",
    gmail_label: "Gmail Manzili",
    password_label: "Parol",
    login_btn: "Tizimga Kirish",
    err_invalid: "Gmail yoki parol noto'g'ri",
    err_connect: "Server bilan bog'lanishda xatolik",
    loading: "Yuklanmoqda"
  },
  ru: {
    welcome_admin: "Панель Супер Админа",
    enter_admin_desc: "Войдите с помощью Gmail и пароля",
    welcome_cashier: "Вход для Кассира",
    enter_cashier_desc: "Войдите с помощью Gmail кассира и пароля",
    gmail_label: "Адрес Gmail",
    password_label: "Пароль",
    login_btn: "Войти в систему",
    err_invalid: "Неверный Gmail или пароль",
    err_connect: "Ошибка подключения к серверу",
    loading: "Загрузка"
  },
  en: {
    welcome_admin: "Super Admin Access",
    enter_admin_desc: "Log in using email address and password",
    welcome_cashier: "Cashier Access System",
    enter_cashier_desc: "Log in using cashier Gmail and password",
    gmail_label: "Gmail Address",
    password_label: "Password",
    login_btn: "Sign In",
    err_invalid: "Invalid Gmail or password",
    err_connect: "Server connection failed",
    loading: "Loading"
  },
  tr: {
    welcome_admin: "Süper Yönetici Paneli",
    enter_admin_desc: "Gmail ve şifrenizle giriş yapın",
    welcome_cashier: "Kasiyer Giriş Sistemi",
    enter_cashier_desc: "Kasiyer Gmail ve şifresiyle giriş yapın",
    gmail_label: "Gmail Adresi",
    password_label: "Şifre",
    login_btn: "Giriş Yap",
    err_invalid: "Geçersiz Gmail veya şifre",
    err_connect: "Sunucu bağlantı hatası",
    loading: "Yükleniyor"
  }
};

const t = (key) => {
  return translations[currentLang.value]?.[key] || key;
};

const updateLanguage = () => {
  localStorage.setItem('sauna_lang', currentLang.value);
};

const handleLoginSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const res = await axios.post('/api/auth/login/super', {
      email: emailInput.value.trim(),
      password: passwordInput.value.trim()
    });

    if (res.data && res.data.success && res.data.token) {
      localStorage.setItem('sauna_token', res.data.token);
      localStorage.setItem('sauna_user', JSON.stringify(res.data.user));
      router.push('/');
    } else {
      errorMessage.value = res.data?.message || t('err_invalid');
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.message || t('err_invalid');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  setTimeout(() => {
    pageLoading.value = false;
  }, 800);
});
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
