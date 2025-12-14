
<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title shrink @click="goToIndex">
          🏎️ Apex League
        </q-toolbar-title>

        <div class="q-gutter-sm row items-center">
          <q-btn flat label="Inicio" @click="goToIndex" />
          <q-btn flat label="Ligas" @click="goToLeagues" />
        </div>

        <div v-if="authStore.user" class="q-gutter-sm q-ml-auto row items-center">
          <q-btn flat icon="person" :label="authStore.user?.username" />
          <q-btn flat round icon="logout" @click="handleLogout">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  authStore.logout();
  await router.push('/login');
}

async function goToIndex() {
  await router.push('/');
}

async function goToLeagues() {
  await router.push('/leagues');
}
</script>