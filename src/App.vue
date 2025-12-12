<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { api } from 'src/boot/axios';

const authStore = useAuthStore();

onMounted(async() => {
  // Inicializar autenticación al cargar la app
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔄 Restaurando sesión...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await authStore.initAuth();
  }
});
</script>
