<template>
  <q-page class="dashboard-page">
    <!-- Hero Section con próxima carrera -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="welcome-text">
          <span class="greeting">Bienvenido,</span>
          <h1 class="username">{{ authStore.user?.username || 'Piloto' }}</h1>
        </div>
        
        <!-- Next Race Card -->
        <div v-if="nextRace" class="next-race-card">
          <div class="race-badge">PRÓXIMA CARRERA</div>
          <div class="race-info">
            <div class="race-flag">
              <span class="flag-emoji">{{ getCountryFlag(nextRace.country) }}</span>
            </div>
            <div class="race-details">
              <h2 class="race-name">{{ nextRace.name }}</h2>
              <p class="race-circuit">{{ nextRace.circuit }}</p>
            </div>
            <div class="race-countdown">
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.days }}</span>
                <span class="countdown-label">DÍAS</span>
              </div>
              <div class="countdown-separator">:</div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.hours }}</span>
                <span class="countdown-label">HRS</span>
              </div>
              <div class="countdown-separator">:</div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.minutes }}</span>
                <span class="countdown-label">MIN</span>
              </div>
            </div>
          </div>
          <q-btn 
            v-if="!nextRace.hasPrediction"
            class="predict-btn"
            label="Hacer Predicción"
            icon="sports_score"
            to="/prediction"
            no-caps
          />
          <div v-else class="prediction-done">
            <q-icon name="check_circle" size="sm" />
            <span>Predicción enviada</span>
          </div>
        </div>

        <!-- Skeleton mientras carga -->
        <div v-else-if="loading" class="next-race-card skeleton-card">
          <q-skeleton type="rect" height="200px" />
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="hero-decoration">
        <div class="speed-lines"></div>
      </div>
    </section>

    <!-- Stats Grid -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total-points">
          <div class="stat-icon">
            <q-icon name="emoji_events" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalPoints || 0 }}</span>
            <span class="stat-label">Puntos Totales</span>
          </div>
          <div class="stat-decoration"></div>
        </div>

        <div class="stat-card predictions-count">
          <div class="stat-icon">
            <q-icon name="fact_check" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalPredictions || 0 }}</span>
            <span class="stat-label">Predicciones</span>
          </div>
        </div>

        <div class="stat-card current-streak">
          <div class="stat-icon">
            <q-icon name="local_fire_department" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.currentStreak || 0 }}</span>
            <span class="stat-label">Racha Actual</span>
          </div>
          <div v-if="stats?.currentStreak && stats.currentStreak >= 3" class="streak-fire">
            🔥
          </div>
        </div>

        <div class="stat-card avg-points">
          <div class="stat-icon">
            <q-icon name="trending_up" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatAvg(stats?.avgPointsPerRace) }}</span>
            <span class="stat-label">Promedio/Carrera</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <section class="content-section">
      <div class="content-grid">
        <!-- Ligas del usuario -->
        <div class="dashboard-card leagues-card">
          <div class="card-header">
            <h3 class="card-title">
              <q-icon name="groups" class="title-icon" />
              Mis Ligas
            </h3>
            <q-btn 
              flat 
              dense 
              icon="add" 
              label="Unirme" 
              class="add-btn"
              to="/leagues"
              no-caps
            />
          </div>
          
          <div v-if="leagues.length" class="leagues-list">
            <router-link 
              v-for="league in leagues" 
              :key="league.id" 
              :to="`/leagues/${league.slug || getLeagueSlug(league.name)}`"
              class="league-item"
            >
              <div class="league-rank">
                <span class="rank-position">#{{ league.userRank }}</span>
              </div>
              <div class="league-info">
                <span class="league-name">{{ league.name }}</span>
                <span class="league-members">{{ league.memberCount }} miembros</span>
              </div>
              <div class="league-points">
                <span class="points-value">{{ league.userPoints }}</span>
                <span class="points-label">pts</span>
              </div>
              <q-badge v-if="league.isAdmin" color="amber" text-color="dark" label="Admin" />
              <q-icon name="chevron_right" class="league-arrow" />
            </router-link>
          </div>
          
          <div v-else class="empty-state">
            <q-icon name="sports_motorsports" size="48px" class="empty-icon" />
            <p>No estás en ninguna liga aún</p>
            <q-btn 
              outline 
              color="primary" 
              label="Explorar ligas" 
              to="/leagues"
              no-caps
            />
          </div>
        </div>

        <!-- Pilotos destacados -->
        <div class="dashboard-card pilots-card">
          <div class="card-header">
            <h3 class="card-title">
              <q-icon name="person_pin" class="title-icon" />
              Mis Pilotos
            </h3>
          </div>

          <div class="pilots-grid">
            <!-- Piloto más elegido -->
            <div class="pilot-stat-card most-picked">
              <div class="pilot-stat-header">
                <span class="pilot-stat-label">Más Elegido</span>
                <q-icon name="favorite" class="stat-type-icon" />
              </div>
              <div v-if="mostPickedPilot" class="pilot-info">
                <div class="pilot-avatar">
                  <span class="pilot-acronym">{{ mostPickedPilot.acronym }}</span>
                </div>
                <div class="pilot-details">
                  <span class="pilot-name">{{ mostPickedPilot.name }}</span>
                  <span class="pilot-team">{{ mostPickedPilot.team }}</span>
                </div>
                <div class="pilot-metric">
                  <span class="metric-value">{{ mostPickedPilot.count }}x</span>
                  <span class="metric-label">elegido</span>
                </div>
              </div>
              <div v-else class="pilot-empty">
                <span>Sin datos aún</span>
              </div>
            </div>

            <!-- Piloto mejor rendimiento -->
            <div class="pilot-stat-card best-performing">
              <div class="pilot-stat-header">
                <span class="pilot-stat-label">Mejor Rendimiento</span>
                <q-icon name="star" class="stat-type-icon" />
              </div>
              <div v-if="bestPerformingPilot" class="pilot-info">
                <div class="pilot-avatar gold">
                  <span class="pilot-acronym">{{ bestPerformingPilot.acronym }}</span>
                </div>
                <div class="pilot-details">
                  <span class="pilot-name">{{ bestPerformingPilot.name }}</span>
                  <span class="pilot-team">{{ bestPerformingPilot.team }}</span>
                </div>
                <div class="pilot-metric">
                  <span class="metric-value">{{ bestPerformingPilot.successRate }}%</span>
                  <span class="metric-label">acierto</span>
                </div>
              </div>
              <div v-else class="pilot-empty">
                <span>Sin datos aún</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Predicciones recientes -->
        <div class="dashboard-card predictions-card">
          <div class="card-header">
            <h3 class="card-title">
              <q-icon name="history" class="title-icon" />
              Últimas Predicciones
            </h3>
            <q-btn 
              flat 
              dense 
              label="Ver todas" 
              class="view-all-btn"
              to="/predictions/history"
              no-caps
            />
          </div>

          <div v-if="recentPredictions.length" class="predictions-list">
            <div 
              v-for="prediction in recentPredictions" 
              :key="prediction.id" 
              class="prediction-item"
            >
              <div class="prediction-race">
                <span class="race-name">{{ prediction.raceName }}</span>
                <span class="race-date">{{ formatDate(prediction.raceDate) }}</span>
              </div>
              <div class="prediction-result">
                <div class="accuracy-ring" :class="getAccuracyClass(prediction)">
                  <span>{{ prediction.correctPositions }}/{{ prediction.totalPositions }}</span>
                </div>
              </div>
              <div class="prediction-points" :class="{ 'high-score': prediction.pointsEarned >= 50 }">
                <span class="points-earned">+{{ prediction.pointsEarned }}</span>
                <span class="points-label">pts</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <q-icon name="sports_motorsports" size="48px" class="empty-icon" />
            <p>Aún no tienes predicciones</p>
            <q-btn 
              outline 
              color="primary" 
              label="Hacer mi primera predicción" 
              to="/prediction"
              no-caps
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useDashboardStore } from 'src/stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

// Estado del countdown
const countdown = ref({ days: '00', hours: '00', minutes: '00' });
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Computed
const loading = computed(() => dashboardStore.loading);
const leagues = computed(() => dashboardStore.leagues);
const mostPickedPilot = computed(() => dashboardStore.mostPickedPilot);
const bestPerformingPilot = computed(() => dashboardStore.bestPerformingPilot);
const recentPredictions = computed(() => dashboardStore.recentPredictions);
const nextRace = computed(() => dashboardStore.nextRace);
const stats = computed(() => dashboardStore.stats);

// Helpers
function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Australia': '🇦🇺',
    'Bahrain': '🇧🇭',
    'Saudi Arabia': '🇸🇦',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'USA': '🇺🇸',
    'Italy': '🇮🇹',
    'Monaco': '🇲🇨',
    'Canada': '🇨🇦',
    'Spain': '🇪🇸',
    'Austria': '🇦🇹',
    'UK': '🇬🇧',
    'Hungary': '🇭🇺',
    'Belgium': '🇧🇪',
    'Netherlands': '🇳🇱',
    'Azerbaijan': '🇦🇿',
    'Singapore': '🇸🇬',
    'Mexico': '🇲🇽',
    'Brazil': '🇧🇷',
    'Qatar': '🇶🇦',
    'UAE': '🇦🇪',
  };
  return flags[country] || '🏁';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatAvg(value: number | undefined): string {
  if (!value) return '0';
  return value.toFixed(1);
}

function getAccuracyClass(prediction: { correctPositions: number; totalPositions: number }) {
  const ratio = prediction.correctPositions / prediction.totalPositions;
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
}

function getLeagueSlug(leagueName: string): string {
  const slugMap: Record<string, string> = {
    'Race League': 'race',
    'Qualy League': 'qualy',
    'Sprint League': 'sprint',
  };
  return slugMap[leagueName] || leagueName.toLowerCase().replace(/\s+/g, '-');
}

function updateCountdown() {
  if (!nextRace.value?.date) return;
  
  const raceDate = new Date(nextRace.value.date);
  const now = new Date();
  const diff = raceDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    countdown.value = { days: '00', hours: '00', minutes: '00' };
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  countdown.value = {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
  };
}

// Lifecycle
onMounted(async () => {
  await dashboardStore.fetchDashboard();
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 60000); // Update cada minuto
});

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 100vh;
  padding-bottom: 40px;
}

// ============================================
// HERO SECTION
// ============================================
.hero-section {
  position: relative;
  padding: 24px 16px 32px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  border-bottom: 3px solid #e10600;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 40px 32px 48px;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-text {
  margin-bottom: 24px;

  .greeting {
    display: block;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #888;
    margin-bottom: 4px;
  }

  .username {
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(90deg, #ffffff 0%, #e10600 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }
}

.next-race-card {
  background: linear-gradient(145deg, #1f1f1f 0%, #151515 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #333;
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 28px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e10600 0%, #ff6b6b 50%, #e10600 100%);
  }
}

.race-badge {
  display: inline-block;
  background: #e10600;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.race-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;

  @media (min-width: 600px) {
    grid-template-columns: auto 1fr auto;
  }
}

.race-flag {
  .flag-emoji {
    font-size: 3rem;

    @media (min-width: 768px) {
      font-size: 4rem;
    }
  }
}

.race-details {
  .race-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: #fff;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .race-circuit {
    font-size: 0.875rem;
    color: #888;
    margin: 0;
  }
}

.race-countdown {
  display: flex;
  gap: 8px;
  align-items: center;
  grid-column: 1 / -1;
  justify-content: center;
  margin-top: 8px;

  @media (min-width: 600px) {
    grid-column: auto;
    margin-top: 0;
  }
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #0a0a0a;
  padding: 8px 12px;
  border-radius: 8px;
  min-width: 50px;

  .countdown-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #e10600;
    font-variant-numeric: tabular-nums;
  }

  .countdown-label {
    font-size: 0.6rem;
    color: #666;
    letter-spacing: 1px;
  }
}

.countdown-separator {
  font-size: 1.5rem;
  font-weight: 800;
  color: #444;
}

.predict-btn {
  width: 100%;
  background: linear-gradient(90deg, #e10600 0%, #c70000 100%);
  color: white;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 8px;

  &:hover {
    background: linear-gradient(90deg, #ff1a1a 0%, #e10600 100%);
  }
}

.prediction-done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4caf50;
  font-weight: 600;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  pointer-events: none;
  opacity: 0.1;
  overflow: hidden;
}

.speed-lines {
  position: absolute;
  top: 50%;
  right: -100px;
  width: 400px;
  height: 200px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 10px,
    #e10600 10px,
    #e10600 12px
  );
  transform: translateY(-50%);
}

// ============================================
// STATS SECTION
// ============================================
.stats-section {
  padding: 24px 16px;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: -20px;
  position: relative;
  z-index: 3;

  @media (min-width: 768px) {
    padding: 32px;
    margin-top: -30px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

.stat-card {
  background: linear-gradient(145deg, #1f1f1f 0%, #171717 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #2a2a2a;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-color: #e10600;
  }

  @media (min-width: 768px) {
    padding: 20px;
  }
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 6, 0, 0.15);
  color: #e10600;
  font-size: 1.25rem;
}

.stat-content {
  display: flex;
  flex-direction: column;

  .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: #fff;

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }

  .stat-label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.current-streak {
  position: relative;

  .streak-fire {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 1.5rem;
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

// ============================================
// CONTENT SECTION
// ============================================
.content-section {
  padding: 0 16px 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 0 32px 32px;
  }
}

.content-grid {
  display: grid;
  gap: 20px;

  @media (min-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1100px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.dashboard-card {
  background: linear-gradient(145deg, #1a1a1a 0%, #131313 100%);
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #222;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #fff;

  .title-icon {
    color: #e10600;
  }
}

.add-btn, .view-all-btn {
  color: #e10600;
  font-size: 0.8rem;
}

// Leagues Card
.leagues-list {
  padding: 8px;
}

.league-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background-color 0.2s, transform 0.2s;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateX(4px);

    .league-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.league-arrow {
  color: #e10600;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.2s, transform 0.2s;
}

.league-rank {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e10600 0%, #8b0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  .rank-position {
    font-weight: 800;
    font-size: 0.875rem;
    color: #fff;
  }
}

.league-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .league-name {
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .league-members {
    font-size: 0.75rem;
    color: #666;
  }
}

.league-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .points-value {
    font-weight: 800;
    font-size: 1.125rem;
    color: #fff;
  }

  .points-label {
    font-size: 0.65rem;
    color: #666;
    text-transform: uppercase;
  }
}

// Pilots Card
.pilots-card {
  @media (min-width: 900px) and (max-width: 1099px) {
    grid-column: 1 / -1;
  }
}

.pilots-grid {
  display: grid;
  gap: 12px;
  padding: 16px;

  @media (min-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pilot-stat-card {
  background: #0f0f0f;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #222;
}

.pilot-stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .pilot-stat-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #666;
  }

  .stat-type-icon {
    font-size: 1rem;
    color: #e10600;
  }
}

.best-performing .stat-type-icon {
  color: #ffc107;
}

.pilot-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pilot-avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e10600 0%, #8b0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  &.gold {
    background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
  }

  .pilot-acronym {
    font-weight: 800;
    font-size: 0.875rem;
    color: #fff;
  }
}

.pilot-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .pilot-name {
    font-weight: 700;
    color: #fff;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pilot-team {
    font-size: 0.7rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.pilot-metric {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .metric-value {
    font-weight: 800;
    font-size: 1rem;
    color: #e10600;
  }

  .metric-label {
    font-size: 0.6rem;
    color: #666;
  }
}

.best-performing .metric-value {
  color: #ffc107;
}

.pilot-empty {
  color: #555;
  font-size: 0.875rem;
  text-align: center;
  padding: 16px;
}

// Predictions Card
.predictions-card {
  @media (min-width: 1100px) {
    grid-column: 1 / -1;
  }
}

.predictions-list {
  padding: 8px;
}

.prediction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (min-width: 600px) {
    gap: 16px;
  }
}

.prediction-race {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .race-name {
    font-weight: 600;
    color: #fff;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .race-date {
    font-size: 0.75rem;
    color: #666;
  }
}

.prediction-result {
  .accuracy-ring {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    border: 3px solid;

    &.high {
      border-color: #4caf50;
      color: #4caf50;
    }

    &.medium {
      border-color: #ff9800;
      color: #ff9800;
    }

    &.low {
      border-color: #f44336;
      color: #f44336;
    }
  }
}

.prediction-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 50px;

  .points-earned {
    font-weight: 800;
    font-size: 1rem;
    color: #4caf50;
  }

  .points-label {
    font-size: 0.65rem;
    color: #666;
  }

  &.high-score .points-earned {
    color: #ffc107;
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    color: #333;
    margin-bottom: 16px;
  }

  p {
    color: #666;
    margin: 0 0 16px;
  }
}

// Skeleton
.skeleton-card {
  background: #1a1a1a;
}
</style>