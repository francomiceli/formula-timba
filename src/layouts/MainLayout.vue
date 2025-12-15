<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="header-bar">
      <q-toolbar>
        <!-- Logo / Home -->
        <q-btn 
          flat 
          dense 
          no-caps 
          to="/" 
          class="logo-btn"
        >
          <span class="logo-icon">🏎️</span>
          <span class="logo-text">Apex League</span>
        </q-btn>

        <q-space />

        <!-- Desktop Navigation -->
        <nav class="desktop-nav gt-sm">
          <q-btn 
            flat 
            no-caps 
            to="/" 
            label="Dashboard" 
            :class="{ 'nav-active': $route.name === 'dashboard' }"
          />
          <q-btn 
            flat 
            no-caps 
            to="/leagues" 
            label="Ligas" 
            :class="{ 'nav-active': $route.name === 'leagues' || $route.name === 'league-detail' }"
          />
        </nav>

        <q-space class="gt-sm" />

        <!-- User Menu -->
        <q-btn flat round dense class="user-btn">
          <q-avatar size="32px" color="red-9" text-color="white">
            {{ userInitial }}
          </q-avatar>
          
          <q-menu anchor="bottom right" self="top right" class="user-menu">
            <q-list style="min-width: 200px">
              <q-item-label header class="user-header">
                <div class="user-name">{{ authStore.user?.username || 'Usuario' }}</div>
                <div class="user-email">{{ authStore.user?.email }}</div>
              </q-item-label>
              
              <q-separator />
              
              <q-item clickable v-close-popup to="/">
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section>Dashboard</q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup to="/leagues">
                <q-item-section avatar>
                  <q-icon name="emoji_events" />
                </q-item-section>
                <q-item-section>Ligas</q-item-section>
              </q-item>
              
              <q-separator />
              
              <q-item clickable v-close-popup @click="handleLogout" class="logout-item">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative">Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Mobile Bottom Navigation -->
    <q-footer class="mobile-nav lt-md" elevated>
      <q-tabs
        v-model="currentTab"
        class="mobile-tabs"
        active-color="red-6"
        indicator-color="red-6"
        narrow-indicator
      >
        <q-route-tab 
          name="dashboard" 
          to="/" 
          icon="dashboard" 
          label="Inicio"
        />
        <q-route-tab 
          name="leagues" 
          to="/leagues" 
          icon="emoji_events" 
          label="Ligas"
        />
        <q-route-tab 
          name="profile" 
          to="/profile" 
          icon="person" 
          label="Perfil"
          disable
        />
      </q-tabs>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const currentTab = ref('dashboard');

const userInitial = computed(() => {
  const username = authStore.user?.username || 'U';
  return username.charAt(0).toUpperCase();
});

async function handleLogout() {
  authStore.logout();
  await router.push('/login');
}
</script>

<style lang="scss" scoped>
.header-bar {
  background: linear-gradient(90deg, #0d0d0d 0%, #1a1a1a 100%);
  border-bottom: 1px solid #2a2a2a;
}

.logo-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-size: 1.125rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, #ffffff 0%, #e10600 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 400px) {
      display: none;
    }
  }
}

.desktop-nav {
  display: flex;
  gap: 4px;

  .q-btn {
    color: #888;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    &.nav-active {
      color: #e10600;
      background: rgba(225, 6, 0, 0.1);
    }
  }
}

.user-btn {
  margin-left: 8px;
}

.user-menu {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

.user-header {
  padding: 16px !important;
  background: linear-gradient(135deg, #1f1f1f 0%, #151515 100%);

  .user-name {
    font-weight: 700;
    color: #fff;
    font-size: 1rem;
  }

  .user-email {
    font-size: 0.75rem;
    color: #666;
    margin-top: 2px;
  }
}

.logout-item {
  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }
}

// Mobile Navigation
.mobile-nav {
  background: #0d0d0d;
  border-top: 1px solid #2a2a2a;
}

.mobile-tabs {
  :deep(.q-tab) {
    min-height: 56px;
    
    .q-tab__label {
      font-size: 0.65rem;
      font-weight: 500;
      text-transform: none;
    }
    
    .q-tab__icon {
      font-size: 1.25rem;
    }
  }
}
</style>