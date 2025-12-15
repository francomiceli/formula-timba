import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';

export interface League {
  id: number;
  name: string;
  slug?: string;
  memberCount: number;
  userRank: number;
  userPoints: number;
  isAdmin: boolean;
}

export interface PilotStat {
  id: number;
  name: string;
  team: string;
  acronym: string;
  count?: number;        // Para piloto más elegido
  successRate?: number;  // Para piloto mejor performante
  avgPosition?: number;
}

export interface RecentPrediction {
  id: number;
  raceName: string;
  raceDate: string;
  pointsEarned: number;
  correctPositions: number;
  totalPositions: number;
}

export interface NextRace {
  id: number;
  name: string;
  circuit: string;
  country: string;
  date: string;
  flagUrl?: string;
  hasPrediction: boolean;
}

export interface DashboardStats {
  totalPoints: number;
  totalPredictions: number;
  currentStreak: number;
  bestStreak: number;
  avgPointsPerRace: number;
  perfectPredictions: number;
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const leagues = ref<League[]>([]);
  const mostPickedPilot = ref<PilotStat | null>(null);
  const bestPerformingPilot = ref<PilotStat | null>(null);
  const recentPredictions = ref<RecentPrediction[]>([]);
  const nextRace = ref<NextRace | null>(null);
  const stats = ref<DashboardStats | null>(null);
  
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasLeagues = computed(() => leagues.value.length > 0);
  const hasPredictions = computed(() => recentPredictions.value.length > 0);

  // Actions
  async function fetchDashboard() {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/api/dashboard');
      
      leagues.value = response.data.leagues || [];
      mostPickedPilot.value = response.data.mostPickedPilot || null;
      bestPerformingPilot.value = response.data.bestPerformingPilot || null;
      recentPredictions.value = response.data.recentPredictions || [];
      nextRace.value = response.data.nextRace || null;
      stats.value = response.data.stats || null;

    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Error al cargar el dashboard';
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchLeagues() {
    try {
      const response = await api.get('/api/leagues/user');
      leagues.value = response.data || [];
    } catch (err: unknown) {
      console.error('Error fetching leagues:', err);
    }
  }

  async function fetchStats() {
    try {
      const response = await api.get('/api/dashboard/stats');
      stats.value = response.data || null;
    } catch (err: unknown) {
      console.error('Error fetching stats:', err);
    }
  }

  async function fetchNextRace() {
    try {
      const response = await api.get('/api/races/next');
      nextRace.value = response.data || null;
    } catch (err: unknown) {
      console.error('Error fetching next race:', err);
    }
  }

  function $reset() {
    leagues.value = [];
    mostPickedPilot.value = null;
    bestPerformingPilot.value = null;
    recentPredictions.value = [];
    nextRace.value = null;
    stats.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // Estado
    leagues,
    mostPickedPilot,
    bestPerformingPilot,
    recentPredictions,
    nextRace,
    stats,
    loading,
    error,
    // Getters
    hasLeagues,
    hasPredictions,
    // Actions
    fetchDashboard,
    fetchLeagues,
    fetchStats,
    fetchNextRace,
    $reset,
  };
});