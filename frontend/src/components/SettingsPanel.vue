<template>
  <div class="bg-white border border-zinc-200/60 shadow-sm rounded-3xl p-8 max-w-3xl mx-auto">
    <div class="border-b border-zinc-100 pb-4 mb-6">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-950">{{ t('settings_title') }}</h2>
      <p class="text-sm text-zinc-500">{{ t('settings_desc') }}</p>
    </div>

    <div class="space-y-8">
      <!-- 1. Language Customization -->
      <div class="flex justify-between items-center py-4 border-b border-zinc-100/60">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('lang_label') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('lang_desc') }}</p>
        </div>
        <select 
          v-model="lang" 
          @change="saveLanguage"
          class="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black font-medium"
        >
          <option value="uz">O'zbekcha (UZ)</option>
          <option value="ru">Русский (RU)</option>
          <option value="en">English (EN)</option>
          <option value="tr">Türkçe (TR)</option>
        </select>
      </div>

      <!-- 2. Dark/Light Theme Switching -->
      <div class="flex justify-between items-center py-4 border-b border-zinc-100/60">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('theme_label') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('theme_desc') }}</p>
        </div>
        <div class="flex space-x-2">
          <button 
            v-for="mode in ['light', 'dark']" 
            :key="mode"
            @click="setTheme(mode)"
            :class="[
              'px-4 py-2.5 rounded-xl text-xs font-semibold border active:scale-95 transition-all',
              theme === mode 
                ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold' 
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700'
            ]"
          >
            {{ t(`theme_${mode}`) }}
          </button>
        </div>
      </div>

      <!-- Tungi filtr / Ko'z himoyasi (Blue Light Filter) -->
      <div class="flex justify-between items-center py-4 border-b border-zinc-100/60">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('eye_protection_label') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('eye_protection_desc') }}</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            v-model="eyeProtection" 
            @change="toggleEyeProtection" 
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      <!-- 3. Font / Text Resizing -->
      <div class="flex justify-between items-center py-4 border-b border-zinc-100/60">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('fontSize_label') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('fontSize_desc') }}</p>
        </div>
        <div class="flex space-x-2">
          <button 
            v-for="sz in ['small', 'medium', 'large']" 
            :key="sz"
            @click="setFontSize(sz)"
            :class="[
              'px-4 py-2.5 rounded-xl text-xs font-semibold border active:scale-95 transition-all',
              fontSize === sz 
                ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white font-bold' 
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700'
            ]"
          >
            {{ t(`fontSize_${sz}`) }}
          </button>
        </div>
      </div>

      <!-- 4. Staff Section Permission Restriction Controls (Super Admin only) -->
      <div v-if="userRole === 'super_admin'" class="py-4 space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('perm_label') }}</h3>
          <p class="text-xs text-zinc-400 mb-4">{{ t('perm_desc') }}</p>
        </div>

        <div class="space-y-4">
          <!-- Checkboxes Control -->
          <div class="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 space-y-3.5 text-left">
            <!-- 1. Wages & KPI -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-zinc-700">{{ t('perm_kpi') }}</span>
              <input 
                v-model="permissions.cashierViewKpi"
                type="checkbox"
                @change="savePermissions"
                class="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black cursor-pointer"
              />
            </div>
            
            <!-- 2. Finance -->
            <div class="flex items-center justify-between border-t border-zinc-200/50 pt-3">
              <span class="text-xs font-semibold text-zinc-700">{{ t('perm_finance') }}</span>
              <input 
                v-model="permissions.cashierViewFinance"
                type="checkbox"
                @change="savePermissions"
                class="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black cursor-pointer"
              />
            </div>
            
            <!-- 3. Warehouse -->
            <div class="flex items-center justify-between border-t border-zinc-200/50 pt-3">
              <span class="text-xs font-semibold text-zinc-700">{{ t('perm_warehouse') }}</span>
              <input 
                v-model="permissions.cashierViewWarehouse"
                type="checkbox"
                @change="savePermissions"
                class="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black cursor-pointer"
              />
            </div>
            
            <!-- 4. Customers -->
            <div class="flex items-center justify-between border-t border-zinc-200/50 pt-3">
              <span class="text-xs font-semibold text-zinc-700">{{ t('perm_customers') }}</span>
              <input 
                v-model="permissions.cashierViewCustomers"
                type="checkbox"
                @change="savePermissions"
                class="w-4 h-4 text-black border-zinc-300 rounded focus:ring-black cursor-pointer"
              />
            </div>
          </div>

          <!-- Kassir Permissions Preview -->
          <div class="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3 text-left">
            <div class="flex justify-between items-center border-b border-zinc-200/50 pb-2.5">
              <div class="flex items-center space-x-2">
                <span class="text-base">💵</span>
                <span class="font-bold text-sm text-zinc-900">{{ t('cashier_status_label') }}</span>
              </div>
              <span class="bg-amber-100/70 text-amber-800 text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">{{ t('restricted_access') }}</span>
            </div>
            
            <div class="text-xs space-y-2">
              <div class="text-zinc-400 uppercase tracking-widest text-[9px] font-bold">{{ t('allowed_sections') }}</div>
              <ul class="text-zinc-650 space-y-2 font-bold list-disc list-inside">
                <li class="text-zinc-900">✓ {{ t('section_dashboard') }}</li>
                <li class="text-zinc-900">✓ {{ t('section_rooms') }}</li>
                
                <li :class="permissions.cashierViewCustomers ? 'text-emerald-600' : 'text-rose-600/80'">
                  {{ permissions.cashierViewCustomers ? '✓' : '✗' }} {{ t('section_customers') }}
                </li>
                
                <li :class="permissions.cashierViewKpi ? 'text-emerald-600' : 'text-rose-600/80'">
                  {{ permissions.cashierViewKpi ? '✓' : '✗' }} {{ t('section_staff') }}
                </li>
                
                <li :class="permissions.cashierViewFinance ? 'text-emerald-600' : 'text-rose-600/80'">
                  {{ permissions.cashierViewFinance ? '✓' : '✗' }} {{ t('section_finance') }}
                </li>
                
                <li :class="permissions.cashierViewWarehouse ? 'text-emerald-600' : 'text-rose-600/80'">
                  {{ permissions.cashierViewWarehouse ? '✓' : '✗' }} {{ t('section_warehouse') }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. RFID Card Tap Simulator (For Testing and Debugging) -->
      <div class="py-6 border-t border-zinc-100/60 text-left space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('rfid_simulator_title') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('rfid_simulator_desc') }}</p>
        </div>

        <div class="bg-zinc-50 border border-zinc-150 rounded-2xl p-5 flex flex-col md:flex-row items-end gap-4 max-w-xl">
          <div class="flex-1 space-y-1.5">
            <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('rfid_card_uid_label') }}</label>
            <input 
              v-model="simulatedCardUid" 
              type="text" 
              placeholder="Masalan: RFID-RC522-BAND-001"
              class="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-black font-medium"
            />
          </div>

          <button 
            type="button" 
            @click="triggerSimulatedRfidTap"
            class="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition active:scale-95 flex items-center space-x-1.5"
          >
            <span>💳</span>
            <span>{{ t('rfid_tap_btn') }}</span>
          </button>
        </div>
      </div>

      <!-- 6. Camera API Tokens Management (Super Admin & Manager only) -->
      <div v-if="userRole === 'super_admin' || userRole === 'manager'" class="py-6 border-t border-zinc-100/60 text-left space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900 mb-1">{{ t('settings_cam_title') }}</h3>
          <p class="text-xs text-zinc-400">{{ t('settings_cam_desc') }}</p>
        </div>

        <!-- Token list table -->
        <div class="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[9px]">
                <th class="pb-2.5">{{ t('camera_name_label') }}</th>
                <th class="pb-2.5">{{ t('camera_permissions_label') }}</th>
                <th class="pb-2.5">{{ t('description') }}</th>
                <th class="pb-2.5">API Token</th>
                <th class="pb-2.5 text-right">{{ t('action') || 'Amal' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/50">
              <tr v-for="tok in cameraTokens" :key="tok.id" class="text-zinc-700 font-semibold">
                <td class="py-3 pr-2">{{ tok.name }}</td>
                <td class="py-3 pr-2">
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide"
                    :class="[
                      tok.permissions === 'full_access' ? 'bg-emerald-100 text-emerald-800' :
                      tok.permissions === 'checkin_only' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    ]"
                  >
                    {{ tok.permissions === 'full_access' ? (t('settings_token_full') || 'To\'liq') : tok.permissions === 'checkin_only' ? (t('settings_token_in') || 'Kirish') : (t('settings_token_out') || 'Chiqish') }}
                  </span>
                </td>
                <td class="py-3 pr-2 text-zinc-400 font-medium max-w-[150px] truncate" :title="tok.purpose">{{ tok.purpose }}</td>
                <td class="py-3 pr-2 font-mono text-[10px] text-zinc-800">
                  <div class="flex items-center space-x-1.5 bg-white border border-zinc-200 px-2 py-1 rounded-lg w-max">
                    <span>{{ tok.token.substring(0, 12) }}...{{ tok.token.substring(tok.token.length - 4) }}</span>
                    <button 
                      type="button"
                      @click="copyToClipboard(tok.token)"
                      class="text-zinc-400 hover:text-black transition text-[10px]"
                      title="Nusxalash"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td class="py-3 text-right">
                  <button 
                    type="button"
                    @click="revokeToken(tok.id)"
                    class="text-rose-500 hover:text-rose-700 font-bold transition text-[10px]"
                  >
                    {{ t('delete') || 'Bekor Qilish' }}
                  </button>
                </td>
              </tr>
              <tr v-if="cameraTokens.length === 0">
                <td colspan="5" class="py-6 text-center text-zinc-400 italic">Hali kamera tokenlari generatsiya qilinmagan.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Token Inline Form -->
        <form @submit.prevent="createCameraToken" class="bg-zinc-50/60 border border-dashed border-zinc-200 rounded-2xl p-4 space-y-4 max-w-xl">
          <h4 class="text-xs font-bold text-zinc-800 uppercase tracking-wider">{{ t('settings_new_token_title') }}</h4>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_name_label') }}</label>
              <input 
                v-model="newTokenForm.name" 
                type="text" 
                required 
                placeholder="Masalan: Resepsiyon Tablet"
                class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium text-xs"
              />
            </div>
            
            <div class="space-y-1">
              <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_permissions_label') }}</label>
              <select 
                v-model="newTokenForm.permissions" 
                required
                class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium text-xs"
              >
                <option value="full_access">{{ t('settings_token_full') }}</option>
                <option value="checkin_only">{{ t('settings_token_in') }}</option>
                <option value="checkout_only">{{ t('settings_token_out') }}</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{{ t('camera_purpose_label') }}</label>
            <input 
              v-model="newTokenForm.purpose" 
              type="text" 
              required 
              placeholder="Masalan: Asosiy kirish eshigidagi turniket plansheti"
              class="w-full border border-zinc-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black font-medium text-xs"
            />
          </div>

          <button 
            type="submit" 
            class="bg-black hover:bg-zinc-800 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center space-x-1.5"
          >
            <span>⚡</span>
            <span>{{ t('settings_new_token_btn') }}</span>
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const lang = ref(localStorage.getItem('sauna_lang') || 'uz');
const theme = ref(localStorage.getItem('sauna_theme') || 'light');
const fontSize = ref(localStorage.getItem('sauna_font_size') || 'medium');
const eyeProtection = ref(localStorage.getItem('sauna_eye_protection') === 'true');
const userRole = ref('');

const simulatedCardUid = ref('RFID-RC522-BAND-001');
const cameraTokens = ref([]);
const newTokenForm = ref({ name: '', purpose: '', permissions: 'full_access' });

const getAuthHeaders = () => {
  const token = localStorage.getItem('sauna_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const fetchCameraTokens = async () => {
  try {
    const response = await axios.get('/api/camera-tokens', getAuthHeaders());
    if (response.data.success) {
      cameraTokens.value = response.data.data;
    }
  } catch (error) {
    console.error('Fetch tokens error:', error);
  }
};

const createCameraToken = async () => {
  try {
    const response = await axios.post('/api/camera-tokens/generate', newTokenForm.value, getAuthHeaders());
    if (response.data.success) {
      newTokenForm.value = { name: '', purpose: '', permissions: 'full_access' };
      await fetchCameraTokens();
      alert('Yangi kamera ulanish tokeni muvaffaqiyatli generatsiya qilindi!');
    }
  } catch (error) {
    console.error('Create token error:', error);
    alert(error.response?.data?.message || 'Token generatsiya qilishda xatolik yuz berdi.');
  }
};

const revokeToken = async (id) => {
  if (!confirm('Haqiqatan ham bu kameraning kirish ruxsatini bekor qilmoqchimisiz?')) return;
  try {
    const response = await axios.delete(`/api/camera-tokens/${id}`, getAuthHeaders());
    if (response.data.success) {
      await fetchCameraTokens();
      alert('Kamera ulanish tokeni muvaffaqiyatli bekor qilindi (o\'chirildi).');
    }
  } catch (error) {
    console.error('Revoke token error:', error);
    alert('Tokenni o\'chirishda xatolik yuz berdi.');
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  alert('API Token nusxalandi! Endi uni tashqi kamerangiz sozlamalarida "Authorization: Bearer <token>" ko\'rinishida yuborishingiz mumkin.');
};

const triggerSimulatedRfidTap = async () => {
  if (!simulatedCardUid.value.trim()) {
    alert('Karta UID kodini kiriting!');
    return;
  }

  // Play beep
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}

  try {
    const token = localStorage.getItem('sauna_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post('/api/rfid/simulate-tap', {
      nfcUid: simulatedCardUid.value.trim()
    }, { headers });

    if (response.data.success) {
      alert(`NFC Karta tekkizildi! 8-xona bandlik holati muvaffaqiyatli o'zgartirildi.`);
    }
  } catch (error) {
    console.error('RFID Simulation fail:', error);
    alert(error.response?.data?.message || 'Simulyatsiya qilishda xatolik yuz berdi.');
  }
};

const permissions = ref({
  cashierViewKpi: false,
  cashierViewFinance: false,
  cashierViewWarehouse: false,
  cashierViewCustomers: true
});

// Translation database
const translations = {
  uz: {
    settings_title: "Tizim Sozlamalari",
    settings_desc: "Interfeys tili, ranglar mavzusi, yozuv hajmi va xodimlar huquqlarini boshqarish",
    lang_label: "Tizim tili",
    lang_desc: "Tizimning asosiy foydalanuvchi interfeysi tili",
    theme_label: "Ranglar Mavzusi (Theme)",
    theme_desc: "Klassik oq, tungi qorong'i yoki yuqori kontrastli rejimni tanlang",
    theme_light: "Yorug' (Oq)",
    theme_dark: "Qorong'i (Tungi)",
    theme_classic: "Classic (Oq-Qora)",
    eye_protection_label: "Ko'z himoyasi (Tungi Filtr)",
    eye_protection_desc: "Ko'k chiroqni cheklash va tungi toliqishning oldini olish uchun issiq ohanglar",
    theme_gold: "Oltin (Premium)",
    theme_cyan: "Okean (Neon)",
    theme_emerald: "Zumrad (O'rmon)",
    fontSize_label: "Matin / Harflar o'lchami",
    fontSize_desc: "Ekrandagi ma'lumotlar o'lchamini kattalashtirish yoki kichiklashtirish",
    fontSize_small: "Kichik",
    fontSize_medium: "O'rtacha",
    fontSize_large: "Katta",
    perm_label: "Xodimlar kirish ruxsatlari",
    perm_desc: "Turli rollardagi ishchilar uchun bo'limlarni cheklash sozlamalari (Super Admin)",
    perm_kpi: "Kassirlarga xodimlar maoshi va KPI ni ko'rish ruxsati",
    perm_finance: "Kassirlarga moliya va foyda hisobotlarini ko'rish ruxsati",
    perm_warehouse: "Kassirlarga ombor qoldig'i va tovarlarni ko'rish ruxsati",
    perm_customers: "Kassirlarga mijozlar tarixi va qarzlarini ko'rish ruxsati",
    cashier_status_label: "Kassir Ruxsat etilganlik holati",
    restricted_access: "Cheklangan Ruxsat",
    allowed_sections: "Ruxsat etilgan bo'limlar:",
    section_dashboard: "Kunlik Statistika (Dashboard)",
    section_rooms: "Xonalar holati va Band qilish (Barcha xonalar)",
    section_customers: "Mijozlar ro'yxati va tarixi",
    section_staff: "Xodimlar maoshi va KPI",
    section_finance: "Moliya bo'limi (Kassa/Chiqimlar)",
    section_warehouse: "Omborxona bo'limi",
    rfid_simulator_title: "NFC/RFID Karta Simulyatori",
    rfid_simulator_desc: "COM3 Serial Portiga ulangan RFID-RC522 moduliga karta yaqinlashtirishni simulyatsiya qilish va 8-xonani avtomatik band qilish/bo'shatish",
    rfid_card_uid_label: "Karta UID Kodi (RFID HEX/Decimal)",
    rfid_tap_btn: "Karta Tekkizish (Simulate Tap)",
    settings_cam_title: "Xavfsizlik Kameralari va API Integratsiyasi (Tokenlar)",
    settings_cam_desc: "Tashqi IP-kameralarni (Python, OpenCV, Hikvision va b.) Face ID tizimiga ulash uchun universal xavfsiz tokenlar. Har bir token uchun alohida vazifani belgilang.",
    settings_new_token_title: "➕ Yangi Kamera Tokenini Generatsiya Qilish",
    settings_new_token_btn: "Token Generatsiya Qilish va Saqlash",
    settings_token_full: "To'liq Kirish va Chiqishni Qayd Etish",
    settings_token_in: "Faqat Ishga Kirishni (Check-In) Qayd Etish",
    settings_token_out: "Faqat Ishdan Ketishni (Check-Out) Qayd Etish"
  },
  ru: {
    settings_title: "Настройки Системы",
    settings_desc: "Управление языком интерфейса, цветовой схемой, размером текста и правами сотрудников",
    lang_label: "Язык системы",
    lang_desc: "Основной язык пользовательского интерфейса системы",
    theme_label: "Цветовая тема",
    theme_desc: "Выберите классический белый, ночной темный или контрастный режим",
    theme_light: "Светлый (Белый)",
    theme_dark: "Темный (Ночной)",
    theme_classic: "Классический",
    eye_protection_label: "Защита глаз (Ночной фильтр)",
    eye_protection_desc: "Теплые тона для снижения синего спектра света и предотвращения усталости глаз",
    theme_gold: "Золотой (Premium)",
    theme_cyan: "Океан (Неон)",
    theme_emerald: "Изумрудный (Лес)",
    fontSize_label: "Размер текста",
    fontSize_desc: "Увеличение или уменьшение размера отображаемого на экране текста",
    fontSize_small: "Мелкий",
    fontSize_medium: "Средний",
    fontSize_large: "Крупный",
    perm_label: "Ограничение прав доступа сотрудников",
    perm_desc: "Настройка доступа к разделам для различных ролей (Супер Админ)",
    perm_kpi: "Разрешение кассирам просматривать зарплату и KPI сотрудников",
    perm_finance: "Разрешение кассирам просматривать финансовые отчеты и прибыль",
    perm_warehouse: "Разрешение кассирам просматривать остатки на складе и товары",
    perm_customers: "Разрешение кассирам просматривать историю клиентов и долги",
    cashier_status_label: "Статус доступа кассира",
    restricted_access: "Ограниченный Доступ",
    allowed_sections: "Разрешенные разделы:",
    section_dashboard: "Ежедневная статистика (Дашборд)",
    section_rooms: "Статус комнат и бронирование (Все комнаты)",
    section_customers: "Список клиентов и история",
    section_staff: "Зарплаты сотрудников и KPI",
    section_finance: "Финансовый раздел (Касса/Расходы)",
    section_warehouse: "Складской раздел",
    rfid_simulator_title: "Симулятор карт NFC/RFID",
    rfid_simulator_desc: "Симуляция поднесения карты к модулю RFID-RC522 на порту COM3 для автоматического бронирования/освобождения комнаты №8",
    rfid_card_uid_label: "UID код карты (RFID HEX/Decimal)",
    rfid_tap_btn: "Коснуться карты (Simulate Tap)",
    settings_cam_title: "Камеры безопасности и интеграция API (Токены)",
    settings_cam_desc: "Универсальные безопасные токены для подключения внешних IP-камер (Python, OpenCV, Hikvision и др.) к системе Face ID. Настройте отдельную роль для каждого токена.",
    settings_new_token_title: "➕ Генерация нового токена камеры",
    settings_new_token_btn: "Сгенерировать и сохранить токен",
    settings_token_full: "Регистрация полного входа и выхода",
    settings_token_in: "Регистрация только входа (Check-In)",
    settings_token_out: "Регистрация только выхода (Check-Out)"
  },
  en: {
    settings_title: "System Settings",
    settings_desc: "Manage interface language, color themes, text sizing, and staff access permissions",
    lang_label: "System Language",
    lang_desc: "The primary display language of the system interface",
    theme_label: "Color Theme",
    theme_desc: "Select classic light, night dark, or high-contrast classic mode",
    theme_light: "Light (White)",
    theme_dark: "Dark (Night)",
    theme_classic: "Classic (B&W)",
    eye_protection_label: "Eye Protection (Night Shift)",
    eye_protection_desc: "Warm tones to reduce blue light and prevent eye strain at night",
    theme_gold: "Gold (Premium)",
    theme_cyan: "Ocean (Neon)",
    theme_emerald: "Emerald (Forest)",
    fontSize_label: "Text / Font Size",
    fontSize_desc: "Increase or decrease the size of text displayed on the screen",
    fontSize_small: "Small",
    fontSize_medium: "Medium",
    fontSize_large: "Large",
    perm_label: "Staff Access Permissions",
    perm_desc: "Settings to restrict sections for different roles (Super Admin)",
    perm_kpi: "Allow cashiers to view staff salaries and KPI metrics",
    perm_finance: "Allow cashiers to view financial reports and profits",
    perm_warehouse: "Allow cashiers to view warehouse stock and products",
    perm_customers: "Allow cashiers to view customer histories and debts",
    cashier_status_label: "Cashier Access Permission Status",
    restricted_access: "Restricted Access",
    allowed_sections: "Allowed sections:",
    section_dashboard: "Daily Statistics (Dashboard)",
    section_rooms: "Rooms Status & Booking (All rooms)",
    section_customers: "Customer list and history",
    section_staff: "Staff salaries and KPI",
    section_finance: "Finance section (Register/Expenses)",
    section_warehouse: "Warehouse section",
    rfid_simulator_title: "NFC/RFID Card Simulator",
    rfid_simulator_desc: "Simulate tapping a card on the RFID-RC522 module connected to COM3 to auto-book/free Room 8",
    rfid_card_uid_label: "Card UID Code (RFID HEX/Decimal)",
    rfid_tap_btn: "Tap Card (Simulate Tap)",
    settings_cam_title: "Security Cameras & API Integration (Tokens)",
    settings_cam_desc: "Universal secure tokens for connecting external IP cameras (Python, OpenCV, Hikvision, etc.) to the Face ID system. Select a role for each token.",
    settings_new_token_title: "➕ Generate New Camera Token",
    settings_new_token_btn: "Generate and Save Token",
    settings_token_full: "Record full Entry and Exit",
    settings_token_in: "Record Entry only (Check-In)",
    settings_token_out: "Record Exit only (Check-Out)"
  },
  tr: {
    settings_title: "Sistem Ayarları",
    settings_desc: "Arayüz dilini, renk temasını, yazı boyutunu ve personel erişim izinlerini yönetin",
    lang_label: "Sistem Dili",
    lang_desc: "Sistem arayüzünün birincil ekran dili",
    theme_label: "Renk Teması",
    theme_desc: "Klasik açık, gece karanlığı veya yüksek kontrastlı klasik modu seçin",
    theme_light: "Açık (Beyaz)",
    theme_dark: "Koyu (Gece)",
    theme_classic: "Klasik (S&B)",
    eye_protection_label: "Göz Koruması (Gece Filtresi)",
    eye_protection_desc: "Mavi ışığı azaltmak ve geceleri göz yorgunluğunu önlemek için sıcak tonlar",
    theme_gold: "Altın (Premium)",
    theme_cyan: "Okyanus (Neon)",
    theme_emerald: "Zümrüt (Orman)",
    fontSize_label: "Metin / Yazı Boyutu",
    fontSize_desc: "Ekranda görüntülenen metnin boyutunu artırın veya azaltın",
    fontSize_small: "Küçük",
    fontSize_medium: "Orta",
    fontSize_large: "Büyük",
    perm_label: "Personel Erişim İzinleri",
    perm_desc: "Farklı roller için bölümleri kısıtlama ayarları (Süper Yönetici)",
    perm_kpi: "Kasiyerlerin personel maaşlarını ve KPI ölçümlerini görmesine izin ver",
    perm_finance: "Kasiyerlerin finansal raporları ve kârları görmesine izin ver",
    perm_warehouse: "Kasiyerlerin depo stoklarını ve ürünleri görmesine izin ver",
    perm_customers: "Kasiyerlerin müşteri geçmişlerini ve borçlarını görmesine izin ver",
    cashier_status_label: "Kasiyer Erişim Yetki Durumu",
    restricted_access: "Sınırlı Erişim",
    allowed_sections: "İzin verilen bölümler:",
    section_dashboard: "Günlük İstatistikler (Panel)",
    section_rooms: "Odalar Durumu ve Rezervasyon (Tüm odalar)",
    section_customers: "Müşteri listesi ve geçmişi",
    section_staff: "Personel maaşları ve KPI",
    section_finance: "Finans bölümü (Kasa/Giderler)",
    section_warehouse: "Depo bölümü",
    rfid_simulator_title: "NFC/RFID Kart Simülatörü",
    rfid_simulator_desc: "Oda 8'i otomatik rezerve etmek/boşaltmak için COM3 portuna bağlı RFID-RC522 modülüne kart okutulmasını simüle edin",
    rfid_card_uid_label: "Kart UID Kodu (RFID HEX/Decimal)",
    rfid_tap_btn: "Kartı Dokundur (Simüle Et)",
    settings_cam_title: "Güvenlik Kameraları ve API Entegrasyonu (Jetonlar)",
    settings_cam_desc: "Harici IP kameraları (Python, OpenCV, Hikvision vb.) Face ID sistemine bağlamak için evrensel güvenli jetonlar. Her jeton için ayrı bir yetki rolü atayın.",
    settings_new_token_title: "➕ Yeni Kamera Jetonu Üret",
    settings_new_token_btn: "Jeton Üret ve Kaydet",
    settings_token_full: "Tam Giriş ve Çıkış Kaydı",
    settings_token_in: "Yalnızca Giriş Kaydı (Check-In)",
    settings_token_out: "Yalnızca Çıkış Kaydı (Check-Out)"
  }
};

const t = (key) => {
  return translations[lang.value]?.[key] || translations['uz'][key] || key;
};

// Mount load
onMounted(() => {
  const userObj = JSON.parse(localStorage.getItem('sauna_user') || '{}');
  userRole.value = userObj.role || '';

  const savedPerms = localStorage.getItem('sauna_permissions');
  if (savedPerms) {
    permissions.value = JSON.parse(savedPerms);
  }

  if (userRole.value === 'super_admin' || userRole.value === 'manager') {
    fetchCameraTokens();
  }
});

// Settings Handlers
const saveLanguage = () => {
  localStorage.setItem('sauna_lang', lang.value);
  window.location.reload(); // reload to apply localization changes
};

const setTheme = (mode) => {
  theme.value = mode;
  localStorage.setItem('sauna_theme', mode);
  
  // Apply theme dynamically to HTML node
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('theme-light', 'theme-dark', 'theme-classic', 'theme-gold', 'theme-cyan', 'theme-emerald');
  htmlEl.classList.add(`theme-${mode}`);
  
  if (mode === 'dark') {
    htmlEl.classList.add('dark');
  } else {
    htmlEl.classList.remove('dark');
  }
};

const toggleEyeProtection = () => {
  localStorage.setItem('sauna_eye_protection', eyeProtection.value);
  const htmlEl = document.documentElement;
  if (eyeProtection.value) {
    htmlEl.classList.add('eye-protection');
  } else {
    htmlEl.classList.remove('eye-protection');
  }
};

const setFontSize = (sz) => {
  fontSize.value = sz;
  localStorage.setItem('sauna_font_size', sz);
  
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('size-small', 'size-medium', 'size-large');
  htmlEl.classList.add(`size-${sz}`);
};

const savePermissions = () => {
  localStorage.setItem('sauna_permissions', JSON.stringify(permissions.value));
};
</script>
