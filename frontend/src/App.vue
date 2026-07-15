<template>
  <div id="sauna-root-wrapper" class="min-h-screen transition-colors duration-200">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 1. Theme Bootstrapper
  const savedTheme = localStorage.getItem('sauna_theme') || 'light';
  const htmlEl = document.documentElement;
  htmlEl.classList.remove('theme-light', 'theme-dark', 'theme-classic');
  htmlEl.classList.add(`theme-${savedTheme}`);
  if (savedTheme === 'dark') {
    htmlEl.classList.add('dark');
  }

  // 2. Eye Protection / Night Shift Bootstrapper
  const savedEyeProtection = localStorage.getItem('sauna_eye_protection') === 'true';
  if (savedEyeProtection) {
    htmlEl.classList.add('eye-protection');
  } else {
    htmlEl.classList.remove('eye-protection');
  }

  // 3. Font Size Bootstrapper
  const savedFontSize = localStorage.getItem('sauna_font_size') || 'medium';
  htmlEl.classList.remove('size-small', 'size-medium', 'size-large');
  htmlEl.classList.add(`size-${savedFontSize}`);

  // 4. Default language setup if empty
  if (!localStorage.getItem('sauna_lang')) {
    localStorage.setItem('sauna_lang', 'uz');
  }
});
</script>
