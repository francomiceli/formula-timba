<template>
  <q-page class="league-detail-page">
    <!-- League Header -->
    <section class="league-header" :class="`league-${leagueSlug}`">
      <div class="header-content">
        <q-btn 
          flat 
          round 
          icon="arrow_back" 
          class="back-btn"
          to="/leagues"
        />
        
        <div class="league-info">
          <div class="league-icon-wrapper">
            <q-icon :name="leagueIcon" class="league-icon" />
          </div>
          <div class="league-text">
            <h1 class="league-name">{{ leagueName }}</h1>
            <p class="league-members">{{ memberCount }} participantes</p>
          </div>
        </div>

        <!-- User Stats -->
        <div v-if="currentLeague?.isJoined" class="user-league-stats">
          <div class="stat-item">
            <span class="stat-value">#{{ userRank }}</span>
            <span class="stat-label">Posición</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userPoints }}</span>
            <span class="stat-label">Puntos</span>
          </div>
        </div>
      </div>
      
      <div class="header-stripe"></div>
    </section>

    <!-- Tabs Navigation -->
    <section class="tabs-section">
      <q-tabs
        v-model="activeTab"
        class="league-tabs"
        active-color="white"
        indicator-color="red-6"
        align="center"
        narrow-indicator
      >
        <q-tab name="prediction" icon="edit_note" label="Predicción" />
        <q-tab name="ranking" icon="leaderboard" label="Ranking" />
      </q-tabs>
    </section>

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated class="tab-panels">
      <!-- PREDICTION TAB -->
      <q-tab-panel name="prediction" class="prediction-panel">
        <div class="panel-content">
          <!-- Next Event Info -->
          <div v-if="nextEvent" class="event-card">
            <div class="event-badge">PRÓXIMO EVENTO</div>
            <div class="event-info">
              <span class="event-flag">{{ getCountryFlag(nextEvent.country) }}</span>
              <div class="event-details">
                <h3 class="event-name">{{ nextEvent.name }}</h3>
                <p class="event-circuit">{{ nextEvent.circuit }}</p>
                <p class="event-date">{{ formatEventDate(nextEvent.date) }}</p>
              </div>
            </div>
          </div>

          <!-- Already Submitted Banner -->
          <q-banner 
            v-if="hasPrediction" 
            class="prediction-submitted-banner"
            rounded
          >
            <template v-slot:avatar>
              <q-icon name="check_circle" color="green-5" size="md" />
            </template>
            <div class="banner-content">
              <strong>¡Predicción enviada!</strong>
              <p>Ya has enviado tu predicción para este evento. Podés modificarla antes de que comience.</p>
            </div>
          </q-banner>

          <!-- Prediction Form -->
          <div class="prediction-form">
            <h3 class="form-title">
              <q-icon name="format_list_numbered" class="q-mr-sm" />
              Seleccioná el Top {{ positionsCount }}
            </h3>

            <div class="positions-list">
              <div 
                v-for="pos in positionsCount" 
                :key="pos" 
                class="position-row"
                :class="{ 'has-selection': currentPrediction[pos] }"
              >
                <div class="position-number" :class="getPositionClass(pos)">
                  <span>P{{ pos }}</span>
                </div>
                
                <div class="pilot-select-wrapper">
                  <q-select
                    :model-value="currentPrediction[pos]"
                    :options="availablePilots"
                    option-label="name"
                    option-value="id"
                    emit-value
                    map-options
                    :label="currentPrediction[pos] ? '' : 'Seleccionar piloto'"
                    dense
                    filled
                    dark
                    class="pilot-select"
                    popup-content-class="pilot-select-popup"
                    :disable="submitting"
                    @update:model-value="(val) => handlePilotSelect(pos, val)"
                  >
                    <template v-slot:selected-item="scope">
                      <div v-if="scope.opt" class="selected-pilot">
                        <span class="pilot-acronym">{{ scope.opt.acronym }}</span>
                        <span class="pilot-name">{{ scope.opt.name }}</span>
                        <span class="pilot-team">{{ scope.opt.team }}</span>
                      </div>
                    </template>
                    
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps" class="pilot-option">
                        <q-item-section avatar>
                          <div class="option-number">{{ scope.opt.number }}</div>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="option-name">{{ scope.opt.name }}</q-item-label>
                          <q-item-label caption class="option-team">{{ scope.opt.team }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <span class="option-acronym">{{ scope.opt.acronym }}</span>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <q-btn
                  v-if="currentPrediction[pos]"
                  flat
                  round
                  dense
                  icon="close"
                  class="clear-btn"
                  @click="handlePilotSelect(pos, null)"
                />
              </div>
            </div>

            <!-- Progress Indicator -->
            <div class="form-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${progressPercent}%` }"
                ></div>
              </div>
              <span class="progress-text">
                {{ selectedCount }}/{{ positionsCount }} posiciones
              </span>
            </div>

            <!-- Submit Actions -->
            <div class="form-actions">
              <q-btn
                flat
                label="Limpiar todo"
                icon="refresh"
                class="clear-all-btn"
                :disable="selectedCount === 0 || submitting"
                @click="handleClearAll"
                no-caps
              />
              <q-btn
                unelevated
                :label="hasPrediction ? 'Actualizar predicción' : 'Enviar predicción'"
                icon="send"
                class="submit-btn"
                :disable="!isPredictionComplete"
                :loading="submitting"
                @click="handleSubmit"
                no-caps
              />
            </div>

            <!-- Success Message -->
            <q-banner v-if="success" class="success-banner" rounded>
              <template v-slot:avatar>
                <q-icon name="celebration" color="amber" />
              </template>
              ¡Predicción guardada correctamente!
            </q-banner>
          </div>
        </div>
      </q-tab-panel>

      <!-- RANKING TAB -->
      <q-tab-panel name="ranking" class="ranking-panel">
        <div class="panel-content">
          <!-- Ranking Header -->
          <div class="ranking-header">
            <h3 class="ranking-title">
              <q-icon name="emoji_events" class="q-mr-sm trophy-icon" />
              Tabla de Posiciones
            </h3>
            <q-btn
              flat
              dense
              icon="refresh"
              class="refresh-btn"
              :loading="rankingLoading"
              @click="refreshRanking"
            />
          </div>

          <!-- Loading -->
          <div v-if="rankingLoading" class="ranking-loading">
            <q-spinner-dots size="40px" color="red-6" />
          </div>

          <!-- Ranking Table -->
          <div v-else class="ranking-table">
            <!-- Podium (Top 3) -->
            <div v-if="leagueRankings.length >= 3" class="podium-section">
              <!-- 2nd Place -->
              <div class="podium-item second">
                <div class="podium-avatar">
                  <span>{{ getInitial(leagueRankings[1]!.username) }}</span>
                </div>
                <span class="podium-name">{{ leagueRankings[1]!.username }}</span>
                <span class="podium-points">{{ leagueRankings[1]!.points }} pts</span>
                <div class="podium-base">
                  <span class="podium-rank">2</span>
                </div>
              </div>

              <!-- 1st Place -->
              <div class="podium-item first">
                <q-icon name="workspace_premium" class="crown-icon" />
                <div class="podium-avatar gold">
                  <span>{{ getInitial(leagueRankings[0]!.username) }}</span>
                </div>
                <span class="podium-name">{{ leagueRankings[0]!.username }}</span>
                <span class="podium-points">{{ leagueRankings[0]!.points }} pts</span>
                <div class="podium-base">
                  <span class="podium-rank">1</span>
                </div>
              </div>

              <!-- 3rd Place -->
              <div class="podium-item third">
                <div class="podium-avatar">
                  <span>{{ getInitial(leagueRankings[2]!.username) }}</span>
                </div>
                <span class="podium-name">{{ leagueRankings[2]!.username }}</span>
                <span class="podium-points">{{ leagueRankings[2]!.points }} pts</span>
                <div class="podium-base">
                  <span class="podium-rank">3</span>
                </div>
              </div>
            </div>

            <!-- Rest of Rankings -->
            <div class="ranking-list">
              <div 
                v-for="user in rankingsAfterPodium" 
                :key="user.userId"
                class="ranking-row"
                :class="{ 'is-current-user': user.isCurrentUser }"
              >
                <div class="rank-col">
                  <span class="rank-number">{{ user.rank }}</span>
                </div>
                <div class="user-col">
                  <div class="user-avatar-small">
                    {{ getInitial(user.username) }}
                  </div>
                  <span class="user-name">{{ user.username }}</span>
                  <q-badge 
                    v-if="user.isCurrentUser" 
                    color="red-8" 
                    label="Tú" 
                    class="you-badge"
                  />
                </div>
                <div class="stats-col">
                  <span class="predictions-count">{{ user.predictionsCount }} pred.</span>
                </div>
                <div class="points-col">
                  <span class="points-number">{{ user.points }}</span>
                  <span class="points-suffix">pts</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="leagueRankings.length === 0" class="ranking-empty">
              <q-icon name="leaderboard" size="64px" class="empty-icon" />
              <p>Aún no hay rankings disponibles</p>
              <span>Sé el primero en hacer una predicción</span>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useLeaguesStore, type LeagueType } from 'src/stores/leagues';

const route = useRoute();
const $q = useQuasar();
const leaguesStore = useLeaguesStore();

// State
const activeTab = ref('prediction');

// Route params
const leagueSlug = computed(() => route.params.slug as LeagueType);

// Store computed
const loading = computed(() => leaguesStore.loading);
const rankingLoading = computed(() => leaguesStore.rankingLoading);
const submitting = computed(() => leaguesStore.submitting);
const success = computed(() => leaguesStore.success);
const currentLeague = computed(() => leaguesStore.currentLeague);
const nextEvent = computed(() => leaguesStore.nextEvent);
const leagueRankings = computed(() => leaguesStore.leagueRankings);
const currentPrediction = computed(() => leaguesStore.currentPrediction);
const isPredictionComplete = computed(() => leaguesStore.isPredictionComplete);
const hasPrediction = computed(() => leaguesStore.hasPrediction);
const pilots = computed(() => leaguesStore.pilots);

// League info computed
const leagueName = computed(() => currentLeague.value?.name || getDefaultLeagueName(leagueSlug.value));
const leagueIcon = computed(() => currentLeague.value?.icon || getDefaultLeagueIcon(leagueSlug.value));
const memberCount = computed(() => currentLeague.value?.memberCount || 0);
const positionsCount = computed(() => currentLeague.value?.positionsCount || getDefaultPositionsCount(leagueSlug.value));
const userRank = computed(() => currentLeague.value?.userRank || '-');
const userPoints = computed(() => currentLeague.value?.userPoints || 0);

// Pilots that haven't been selected yet
const availablePilots = computed(() => {
  const selectedIds = Object.values(currentPrediction.value).filter(Boolean) as number[];
  return pilots.value.filter(p => !selectedIds.includes(p.id));
});

// Progress
const selectedCount = computed(() => 
  Object.values(currentPrediction.value).filter(Boolean).length
);

const progressPercent = computed(() => 
  (selectedCount.value / positionsCount.value) * 100
);

// Rankings after podium
const rankingsAfterPodium = computed(() => 
  leagueRankings.value.slice(3)
);

// ============================================
// HELPERS
// ============================================

function getDefaultLeagueName(slug: LeagueType): string {
  const names: Record<LeagueType, string> = {
    race: 'Race League',
    qualy: 'Qualy League',
    sprint: 'Sprint League'
  };
  return names[slug] || 'Liga';
}

function getDefaultLeagueIcon(slug: LeagueType): string {
  const icons: Record<LeagueType, string> = {
    race: 'sports_score',
    qualy: 'timer',
    sprint: 'bolt'
  };
  return icons[slug] || 'emoji_events';
}

function getDefaultPositionsCount(slug: LeagueType): number {
  return slug === 'sprint' ? 8 : 10;
}

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

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPositionClass(pos: number): string {
  if (pos === 1) return 'gold';
  if (pos === 2) return 'silver';
  if (pos === 3) return 'bronze';
  return '';
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

// ============================================
// ACTIONS
// ============================================

function handlePilotSelect(position: number, pilotId: number | null) {
  leaguesStore.setPosition(position, pilotId);
}

function handleClearAll() {
  leaguesStore.clearPrediction();
}

async function handleSubmit() {
  if (!nextEvent.value) return;

  const success = await leaguesStore.submitPrediction(
    leagueSlug.value, 
    nextEvent.value.id
  );

  if (success) {
    $q.notify({
      type: 'positive',
      message: '¡Predicción guardada!',
      position: 'top',
      timeout: 2500,
      icon: 'check_circle'
    });
  } else {
    $q.notify({
      type: 'negative',
      message: leaguesStore.error || 'Error al guardar',
      position: 'top',
      timeout: 3000
    });
  }
}

async function refreshRanking() {
  await leaguesStore.fetchLeagueRankings(leagueSlug.value);
}

async function loadLeagueData() {
  await Promise.all([
    leaguesStore.fetchLeagueDetails(leagueSlug.value),
    leaguesStore.fetchNextEvent(leagueSlug.value),
    leaguesStore.fetchPilots(),
    leaguesStore.fetchLeagueRankings(leagueSlug.value)
  ]);

  // Cargar predicción existente si hay evento
  if (nextEvent.value) {
    await leaguesStore.fetchUserPrediction(leagueSlug.value, nextEvent.value.id);
  }
}

// Watch for tab changes to refresh data
watch(activeTab, async (newTab) => {
  if (newTab === 'ranking') {
    await refreshRanking();
  }
});

// Lifecycle
onMounted(async () => {
  leaguesStore.clearPrediction();
  await loadLeagueData();
});
</script>

<style lang="scss" scoped>
.league-detail-page {
  background: #0a0a0a;
  min-height: 100vh;
  padding-bottom: 100px;
}

// ============================================
// LEAGUE HEADER
// ============================================
.league-header {
  position: relative;
  padding: 20px 16px 24px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);

  @media (min-width: 768px) {
    padding: 24px 32px 32px;
  }
}

.header-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  color: #888;

  &:hover {
    color: #fff;
  }
}

.league-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.league-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.league-race .league-icon-wrapper {
  background: rgba(225, 6, 0, 0.2);
  .league-icon { color: #e10600; }
}

.league-qualy .league-icon-wrapper {
  background: rgba(255, 193, 7, 0.2);
  .league-icon { color: #ffc107; }
}

.league-sprint .league-icon-wrapper {
  background: rgba(33, 150, 243, 0.2);
  .league-icon { color: #2196f3; }
}

.league-icon {
  font-size: 1.5rem;
}

.league-text {
  .league-name {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    color: #fff;

    @media (min-width: 768px) {
      font-size: 1.75rem;
    }
  }

  .league-members {
    font-size: 0.8rem;
    color: #666;
    margin: 4px 0 0;
  }
}

.user-league-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 20px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  margin-left: auto;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  .stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #e10600;
  }

  .stat-label {
    font-size: 0.65rem;
    color: #666;
    text-transform: uppercase;
  }
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #333;
}

.header-stripe {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.league-race .header-stripe {
  background: linear-gradient(90deg, #e10600 0%, #ff4444 100%);
}

.league-qualy .header-stripe {
  background: linear-gradient(90deg, #ffc107 0%, #ffeb3b 100%);
}

.league-sprint .header-stripe {
  background: linear-gradient(90deg, #2196f3 0%, #64b5f6 100%);
}

// ============================================
// TABS
// ============================================
.tabs-section {
  background: #111;
  border-bottom: 1px solid #222;
  position: sticky;
  top: 50px;
  z-index: 10;
}

.league-tabs {
  max-width: 1200px;
  margin: 0 auto;

  :deep(.q-tab) {
    min-height: 56px;
    color: #666;
    font-weight: 600;

    &.q-tab--active {
      color: #fff;
    }
  }
}

.tab-panels {
  background: transparent;

  :deep(.q-tab-panel) {
    padding: 0;
  }
}

.panel-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;

  @media (min-width: 768px) {
    padding: 32px;
  }
}

// ============================================
// PREDICTION TAB
// ============================================
.event-card {
  background: linear-gradient(145deg, #1a1a1a 0%, #111 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #2a2a2a;
}

.event-badge {
  display: inline-block;
  background: #e10600;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.event-flag {
  font-size: 2.5rem;
}

.event-details {
  .event-name {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 4px;
    color: #fff;
  }

  .event-circuit {
    font-size: 0.85rem;
    color: #888;
    margin: 0 0 2px;
  }

  .event-date {
    font-size: 0.75rem;
    color: #666;
    margin: 0;
    text-transform: capitalize;
  }
}

.prediction-submitted-banner {
  background: rgba(46, 125, 50, 0.1);
  border: 1px solid rgba(46, 125, 50, 0.3);
  margin-bottom: 24px;

  .banner-content {
    strong {
      color: #4caf50;
    }

    p {
      margin: 4px 0 0;
      font-size: 0.85rem;
      color: #888;
    }
  }
}

.prediction-form {
  background: linear-gradient(145deg, #1a1a1a 0%, #111 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #2a2a2a;
}

.form-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: #fff;

  .q-icon {
    color: #e10600;
  }
}

.positions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.position-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 12px;
  background: #0d0d0d;
  border: 1px solid #1a1a1a;
  transition: border-color 0.2s;

  &.has-selection {
    border-color: #333;
  }
}

.position-number {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  background: #1a1a1a;
  color: #888;
  flex-shrink: 0;

  &.gold {
    background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
    color: #000;
  }

  &.silver {
    background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
    color: #000;
  }

  &.bronze {
    background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
    color: #fff;
  }
}

.pilot-select-wrapper {
  flex: 1;
  min-width: 0;
}

.pilot-select {
  :deep(.q-field__control) {
    background: #1a1a1a;
    border-radius: 8px;
  }

  :deep(.q-field__native) {
    color: #fff;
  }
}

.selected-pilot {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  .pilot-acronym {
    font-weight: 800;
    color: #e10600;
    font-size: 0.85rem;
  }

  .pilot-name {
    font-weight: 600;
    color: #fff;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pilot-team {
    font-size: 0.75rem;
    color: #666;
    
    @media (max-width: 500px) {
      display: none;
    }
  }
}

.pilot-option {
  border-bottom: 1px solid #222;

  &:last-child {
    border-bottom: none;
  }
}

.option-number {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #e10600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

.option-name {
  font-weight: 600;
  color: #fff;
}

.option-team {
  color: #666 !important;
}

.option-acronym {
  font-weight: 800;
  color: #888;
}

.clear-btn {
  color: #666;
  flex-shrink: 0;

  &:hover {
    color: #e10600;
  }
}

.form-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #1a1a1a;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e10600 0%, #ff4444 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.clear-all-btn {
  color: #888;
  flex: 1;
  min-width: 140px;
}

.submit-btn {
  flex: 2;
  min-width: 180px;
  background: linear-gradient(90deg, #e10600 0%, #c70000 100%);
  color: white;
  font-weight: 700;
  padding: 14px 24px;
  border-radius: 10px;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #ff1a1a 0%, #e10600 100%);
  }

  &:disabled {
    opacity: 0.5;
  }
}

.success-banner {
  margin-top: 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

// ============================================
// RANKING TAB
// ============================================
.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.ranking-title {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #fff;

  .trophy-icon {
    color: #ffc107;
  }
}

.refresh-btn {
  color: #666;
}

.ranking-loading {
  display: flex;
  justify-content: center;
  padding: 48px;
}

.ranking-table {
  background: linear-gradient(145deg, #1a1a1a 0%, #111 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #2a2a2a;
}

// Podium
.podium-section {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 12px;
  padding: 32px 16px;
  background: linear-gradient(180deg, #1f1f1f 0%, #151515 100%);
  border-bottom: 1px solid #2a2a2a;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.crown-icon {
  color: #ffd700;
  font-size: 1.5rem;
  margin-bottom: 8px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.podium-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #444 0%, #222 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  color: #fff;
  margin-bottom: 8px;

  &.gold {
    background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
    color: #000;
  }
}

.first .podium-avatar {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.podium-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: #fff;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.podium-points {
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 8px;
}

.podium-base {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
  font-weight: 800;
  font-size: 1.25rem;
}

.first .podium-base {
  width: 70px;
  height: 80px;
  background: linear-gradient(180deg, #ffd700 0%, #b8860b 100%);
  color: #000;
}

.second .podium-base {
  width: 60px;
  height: 60px;
  background: linear-gradient(180deg, #c0c0c0 0%, #808080 100%);
  color: #000;
}

.third .podium-base {
  width: 60px;
  height: 50px;
  background: linear-gradient(180deg, #cd7f32 0%, #8b4513 100%);
  color: #fff;
}

// Ranking List
.ranking-list {
  padding: 8px;
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &.is-current-user {
    background: rgba(225, 6, 0, 0.1);
    border: 1px solid rgba(225, 6, 0, 0.2);
  }
}

.rank-col {
  width: 40px;
  flex-shrink: 0;
}

.rank-number {
  font-weight: 800;
  font-size: 1rem;
  color: #666;
}

.user-col {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #333 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: #888;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.you-badge {
  flex-shrink: 0;
}

.stats-col {
  flex-shrink: 0;

  @media (max-width: 500px) {
    display: none;
  }
}

.predictions-count {
  font-size: 0.75rem;
  color: #666;
}

.points-col {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  min-width: 60px;
  justify-content: flex-end;
}

.points-number {
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
}

.points-suffix {
  font-size: 0.7rem;
  color: #666;
}

.ranking-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;

  .empty-icon {
    color: #333;
    margin-bottom: 16px;
  }

  p {
    color: #888;
    margin: 0 0 4px;
    font-weight: 600;
  }

  span {
    color: #555;
    font-size: 0.85rem;
  }
}
</style>

<style lang="scss">
// Global styles for select popup
.pilot-select-popup {
  background: #1a1a1a !important;
  border: 1px solid #333;
  border-radius: 12px;

  .q-item {
    color: #fff;

    &:hover {
      background: rgba(225, 6, 0, 0.1);
    }

    &.q-manual-focusable--focused {
      background: rgba(225, 6, 0, 0.15);
    }
  }
}
</style>