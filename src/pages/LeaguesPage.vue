<template>
  <q-page class="leagues-page">
    <!-- Header -->
    <section class="page-header">
      <div class="header-content">
        <h1 class="page-title">Ligas</h1>
        <p class="page-subtitle">Competí con otros fans prediciendo resultados de F1</p>
      </div>
      <div class="header-decoration">
        <div class="checkered-flag"></div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-spinner-gears size="60px" color="red-6" />
      <p>Cargando ligas...</p>
    </div>

    <!-- Ligas Grid -->
    <section v-else class="leagues-section">
      <div class="leagues-grid">
        <div 
          v-for="league in availableLeagues" 
          :key="league.id"
          class="league-card"
          :class="[`league-${league.slug}`, { 'is-joined': league.isJoined }]"
        >
          <!-- Card Header con icono -->
          <div class="card-header">
            <div class="league-icon-wrapper">
              <q-icon :name="league.icon" class="league-icon" />
            </div>
            <q-badge 
              v-if="league.isJoined" 
              color="green-8" 
              class="joined-badge"
            >
              <q-icon name="check" size="xs" class="q-mr-xs" />
              Inscripto
            </q-badge>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h2 class="league-name">{{ league.name }}</h2>
            <p class="league-description">{{ league.description }}</p>
            
            <!-- Stats -->
            <div class="league-stats">
              <div class="stat">
                <q-icon name="group" size="sm" />
                <span>{{ formatNumber(league.memberCount) }} miembros</span>
              </div>
              <div class="stat">
                <q-icon name="format_list_numbered" size="sm" />
                <span>Top {{ league.positionsCount }}</span>
              </div>
            </div>

            <!-- User Stats (si está inscripto) -->
            <div v-if="league.isJoined && league.userRank" class="user-stats">
              <div class="user-rank">
                <span class="rank-label">Tu posición</span>
                <span class="rank-value">#{{ league.userRank }}</span>
              </div>
              <div class="user-points">
                <span class="points-label">Puntos</span>
                <span class="points-value">{{ league.userPoints }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <q-btn
              v-if="league.isJoined"
              class="action-btn primary"
              :to="`/leagues/${league.slug}`"
              no-caps
              unelevated
            >
              <q-icon name="play_arrow" class="q-mr-sm" />
              Ir a la liga
            </q-btn>
            <q-btn
              v-else
              class="action-btn join"
              no-caps
              unelevated
              :loading="joiningLeague === league.slug"
              @click="handleJoinLeague(league.slug)"
            >
              <q-icon name="add" class="q-mr-sm" />
              Unirme
            </q-btn>
          </div>

          <!-- Decorative element -->
          <div class="card-stripe"></div>
        </div>
      </div>
    </section>

    <!-- Info Section -->
    <section class="info-section">
      <div class="info-card">
        <q-icon name="info" size="md" class="info-icon" />
        <div class="info-content">
          <h3>¿Cómo funcionan las ligas?</h3>
          <ul class="info-list">
            <li>
              <strong>Inscribite</strong> en las ligas que quieras participar
            </li>
            <li>
              <strong>Predecí</strong> las posiciones antes de cada evento
            </li>
            <li>
              <strong>Sumá puntos</strong> por cada acierto en tu predicción
            </li>
            <li>
              <strong>Competí</strong> contra otros usuarios en el ranking
            </li>
          </ul>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useLeaguesStore, type LeagueType } from 'src/stores/leagues';

const $q = useQuasar();
const leaguesStore = useLeaguesStore();

const joiningLeague = ref<LeagueType | null>(null);

// Computed
const loading = computed(() => leaguesStore.loading);
const availableLeagues = computed(() => leaguesStore.availableLeagues);

// Helpers
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Actions
async function handleJoinLeague(slug: LeagueType) {
  joiningLeague.value = slug;
  
  const success = await leaguesStore.joinLeague(slug);
  
  if (success) {
    $q.notify({
      type: 'positive',
      message: '¡Te has unido a la liga!',
      position: 'top',
      timeout: 2000
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'Error al unirse a la liga',
      position: 'top',
      timeout: 2000
    });
  }
  
  joiningLeague.value = null;
}

// Lifecycle
onMounted(async () => {
  await leaguesStore.fetchLeagues();
});
</script>

<style lang="scss" scoped>
.leagues-page {
  background: linear-gradient(180deg, #0a0a0a 0%, #151515 100%);
  min-height: 100vh;
  padding-bottom: 100px;
}

// ============================================
// PAGE HEADER
// ============================================
.page-header {
  position: relative;
  padding: 32px 20px 40px;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
  border-bottom: 3px solid #e10600;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 48px 32px 56px;
  }
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 8px;
  background: linear-gradient(90deg, #ffffff 0%, #e10600 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
}

.page-subtitle {
  font-size: 1rem;
  color: #888;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40%;
  pointer-events: none;
  overflow: hidden;
}

.checkered-flag {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: 
    linear-gradient(45deg, #222 25%, transparent 25%),
    linear-gradient(-45deg, #222 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #222 75%),
    linear-gradient(-45deg, transparent 75%, #222 75%);
  background-size: 40px 40px;
  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
  opacity: 0.1;
  transform: rotate(15deg);
}

// ============================================
// LOADING STATE
// ============================================
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;

  p {
    color: #666;
    margin: 0;
  }
}

// ============================================
// LEAGUES SECTION
// ============================================
.leagues-section {
  padding: 32px 16px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 48px 32px;
  }
}

.leagues-grid {
  display: grid;
  gap: 24px;

  @media (min-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1000px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// ============================================
// LEAGUE CARD
// ============================================
.league-card {
  position: relative;
  background: linear-gradient(145deg, #1a1a1a 0%, #111111 100%);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    border-color: #444;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  &.is-joined {
    border-color: #2e7d32;

    &:hover {
      border-color: #4caf50;
    }
  }
}

.card-stripe {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #e10600 0%, #ff4444 100%);
}

.league-race .card-stripe {
  background: linear-gradient(90deg, #e10600 0%, #ff4444 100%);
}

.league-qualy .card-stripe {
  background: linear-gradient(90deg, #ffc107 0%, #ffeb3b 100%);
}

.league-sprint .card-stripe {
  background: linear-gradient(90deg, #2196f3 0%, #64b5f6 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
}

.league-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 6, 0, 0.15);
}

.league-race .league-icon-wrapper {
  background: rgba(225, 6, 0, 0.15);
  .league-icon { color: #e10600; }
}

.league-qualy .league-icon-wrapper {
  background: rgba(255, 193, 7, 0.15);
  .league-icon { color: #ffc107; }
}

.league-sprint .league-icon-wrapper {
  background: rgba(33, 150, 243, 0.15);
  .league-icon { color: #2196f3; }
}

.league-icon {
  font-size: 1.75rem;
}

.joined-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
}

.card-body {
  padding: 20px 24px;
}

.league-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 8px;
  color: #fff;
}

.league-description {
  font-size: 0.875rem;
  color: #888;
  margin: 0 0 20px;
  line-height: 1.5;
}

.league-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #666;

    .q-icon {
      color: #555;
    }
  }
}

.user-stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: rgba(46, 125, 50, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(46, 125, 50, 0.2);
}

.user-rank, .user-points {
  display: flex;
  flex-direction: column;
}

.rank-label, .points-label {
  font-size: 0.65rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rank-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #4caf50;
}

.points-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.card-actions {
  padding: 0 24px 24px;
}

.action-btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;

  &.primary {
    background: linear-gradient(90deg, #e10600 0%, #c70000 100%);
    color: white;

    &:hover {
      background: linear-gradient(90deg, #ff1a1a 0%, #e10600 100%);
    }
  }

  &.join {
    background: #2a2a2a;
    color: white;
    border: 1px solid #444;

    &:hover {
      background: #333;
      border-color: #555;
    }
  }
}

// ============================================
// INFO SECTION
// ============================================
.info-section {
  padding: 0 16px 32px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 0 32px 48px;
  }
}

.info-card {
  display: flex;
  gap: 20px;
  background: linear-gradient(145deg, #1a1a1a 0%, #111111 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #2a2a2a;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

.info-icon {
  color: #e10600;
  flex-shrink: 0;
}

.info-content {
  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 12px;
    color: #fff;
  }
}

.info-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    font-size: 0.875rem;
    color: #888;

    &::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #e10600;
    }

    strong {
      color: #fff;
    }
  }

  @media (max-width: 600px) {
    text-align: left;
    display: inline-block;
  }
}
</style>