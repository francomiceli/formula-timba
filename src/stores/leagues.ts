import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';

// ============================================
// INTERFACES
// ============================================

export type LeagueType = 'race' | 'qualy' | 'sprint';

export interface LeagueInfo {
  id: number;
  slug: LeagueType;
  name: string;
  description: string;
  icon: string;
  positionsCount: number; // 10 para race/qualy, 8 para sprint
  memberCount: number;
  isJoined: boolean;
  userRank?: number;
  userPoints?: number;
}

export interface LeagueRanking {
  rank: number;
  userId: number;
  username: string;
  points: number;
  predictionsCount: number;
  perfectPredictions: number;
  isCurrentUser: boolean;
}

export interface LeaguePrediction {
  id?: number;
  leagueId: number;
  raceId: number;
  positions: Record<number, number>; // position -> pilotId
  submittedAt?: string;
  pointsEarned?: number;
}

export interface NextEvent {
  id: number;
  name: string;
  circuit: string;
  country: string;
  date: string;
  hasUserPrediction: boolean;
}

export interface Pilot {
  id: number;
  name: string;
  team: string;
  number: string;
  acronym: string;
}

// ============================================
// STORE
// ============================================

export const useLeaguesStore = defineStore('leagues', () => {
  // Estado
  const availableLeagues = ref<LeagueInfo[]>([]);
  const currentLeague = ref<LeagueInfo | null>(null);
  const leagueRankings = ref<LeagueRanking[]>([]);
  const nextEvent = ref<NextEvent | null>(null);
  const currentPrediction = ref<Record<number, number | null>>({});
  const existingPrediction = ref<LeaguePrediction | null>(null);
  const pilots = ref<Pilot[]>([]);
  
  const loading = ref(false);
  const rankingLoading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  // Getters
  const joinedLeagues = computed(() => 
    availableLeagues.value.filter(l => l.isJoined)
  );

  const notJoinedLeagues = computed(() => 
    availableLeagues.value.filter(l => !l.isJoined)
  );

  const isPredictionComplete = computed(() => {
    if (!currentLeague.value) return false;
    const positions = Object.values(currentPrediction.value).filter(Boolean);
    return positions.length === currentLeague.value.positionsCount;
  });

  const hasPrediction = computed(() => !!existingPrediction.value);

  // ============================================
  // ACTIONS
  // ============================================

  async function fetchLeagues() {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/api/leagues');
      availableLeagues.value = response.data || [];
    } catch (err: unknown) {
      // Datos de ejemplo para desarrollo
      availableLeagues.value = getDefaultLeagues();
      if (err instanceof Error) {
        console.warn('Using default leagues data:', err.message);
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchLeagueDetails(slug: LeagueType) {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get(`/api/leagues/${slug}`);
      currentLeague.value = response.data;
    } catch (err: unknown) {
      // Datos de ejemplo
      currentLeague.value = getDefaultLeagues().find(l => l.slug === slug) || null;
      if (err instanceof Error) {
        console.warn('Using default league data:', err.message);
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchLeagueRankings(slug: LeagueType) {
    rankingLoading.value = true;

    try {
      const response = await api.get(`/api/leagues/${slug}/rankings`);
      leagueRankings.value = response.data || [];
    } catch (err: unknown) {
      // Datos de ejemplo
      leagueRankings.value = getDefaultRankings();
      if (err instanceof Error) {
        console.warn('Using default rankings:', err.message);
      }
    } finally {
      rankingLoading.value = false;
    }
  }

  async function fetchNextEvent(slug: LeagueType) {
    try {
      const response = await api.get(`/api/leagues/${slug}/next-event`);
      nextEvent.value = response.data;
    } catch (err: unknown) {
      // Datos de ejemplo
      nextEvent.value = {
        id: 1,
        name: 'Gran Premio de Australia 2025',
        circuit: 'Albert Park Circuit',
        country: 'Australia',
        date: '2025-03-16T05:00:00Z',
        hasUserPrediction: false
      };
    }
  }

  async function fetchUserPrediction(slug: LeagueType, eventId: number) {
    try {
      const response = await api.get(`/api/leagues/${slug}/predictions/${eventId}`);
      if (response.data) {
        existingPrediction.value = response.data;
        // Cargar posiciones existentes
        currentPrediction.value = { ...response.data.positions };
      }
    } catch (err: unknown) {
      existingPrediction.value = null;
      currentPrediction.value = {};
    }
  }

  async function fetchPilots() {
    try {
      const response = await api.get('/api/pilots');
      pilots.value = response.data || [];
    } catch (err: unknown) {
      // Datos de ejemplo
      pilots.value = getDefaultPilots();
    }
  }

  async function joinLeague(slug: LeagueType) {
    loading.value = true;
    error.value = null;

    try {
      await api.post(`/api/leagues/${slug}/join`);
      // Actualizar estado local
      const league = availableLeagues.value.find(l => l.slug === slug);
      if (league) {
        league.isJoined = true;
        league.memberCount++;
      }
      if (currentLeague.value?.slug === slug) {
        currentLeague.value.isJoined = true;
      }
      return true;
    } catch (err: unknown) {
      // Simular éxito para desarrollo
      const league = availableLeagues.value.find(l => l.slug === slug);
      if (league) {
        league.isJoined = true;
        league.memberCount++;
      }
      if (currentLeague.value?.slug === slug) {
        currentLeague.value.isJoined = true;
      }
      return true;
    } finally {
      loading.value = false;
    }
  }

  async function leaveLeague(slug: LeagueType) {
    loading.value = true;
    error.value = null;

    try {
      await api.post(`/api/leagues/${slug}/leave`);
      const league = availableLeagues.value.find(l => l.slug === slug);
      if (league) {
        league.isJoined = false;
        league.memberCount--;
      }
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message;
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function submitPrediction(slug: LeagueType, eventId: number) {
    if (!isPredictionComplete.value) {
      error.value = 'Debes completar todas las posiciones';
      return false;
    }

    submitting.value = true;
    error.value = null;
    success.value = false;

    try {
      const prediction: Record<number, number> = {};
      for (const [pos, pilotId] of Object.entries(currentPrediction.value)) {
        if (pilotId) {
          prediction[Number(pos)] = pilotId;
        }
      }

      await api.post(`/api/leagues/${slug}/predictions`, {
        eventId,
        positions: prediction
      });

      success.value = true;
      existingPrediction.value = {
        leagueId: currentLeague.value?.id || 0,
        raceId: eventId,
        positions: prediction,
        submittedAt: new Date().toISOString()
      };

      if (nextEvent.value) {
        nextEvent.value.hasUserPrediction = true;
      }

      return true;
    } catch (err: unknown) {
      // Simular éxito para desarrollo
      success.value = true;
      if (nextEvent.value) {
        nextEvent.value.hasUserPrediction = true;
      }
      return true;
    } finally {
      submitting.value = false;
    }
  }

  function setPosition(position: number, pilotId: number | null) {
    // Si el piloto ya está en otra posición, limpiarlo
    if (pilotId) {
      for (const pos of Object.keys(currentPrediction.value)) {
        if (currentPrediction.value[Number(pos)] === pilotId && Number(pos) !== position) {
          currentPrediction.value[Number(pos)] = null;
        }
      }
    }
    currentPrediction.value[position] = pilotId;
  }

  function clearPrediction() {
    currentPrediction.value = {};
    success.value = false;
    error.value = null;
  }

  function $reset() {
    availableLeagues.value = [];
    currentLeague.value = null;
    leagueRankings.value = [];
    nextEvent.value = null;
    currentPrediction.value = {};
    existingPrediction.value = null;
    pilots.value = [];
    loading.value = false;
    rankingLoading.value = false;
    submitting.value = false;
    error.value = null;
    success.value = false;
  }

  return {
    // Estado
    availableLeagues,
    currentLeague,
    leagueRankings,
    nextEvent,
    currentPrediction,
    existingPrediction,
    pilots,
    loading,
    rankingLoading,
    submitting,
    error,
    success,
    // Getters
    joinedLeagues,
    notJoinedLeagues,
    isPredictionComplete,
    hasPrediction,
    // Actions
    fetchLeagues,
    fetchLeagueDetails,
    fetchLeagueRankings,
    fetchNextEvent,
    fetchUserPrediction,
    fetchPilots,
    joinLeague,
    leaveLeague,
    submitPrediction,
    setPosition,
    clearPrediction,
    $reset,
  };
});

// ============================================
// DEFAULT DATA (para desarrollo)
// ============================================

function getDefaultLeagues(): LeagueInfo[] {
  return [
    {
      id: 1,
      slug: 'race',
      name: 'Race League',
      description: 'Predice el Top 10 de cada carrera y acumula puntos según tus aciertos.',
      icon: 'sports_score',
      positionsCount: 10,
      memberCount: 1247,
      isJoined: false,
    },
    {
      id: 2,
      slug: 'qualy',
      name: 'Qualy League',
      description: 'Predice el Top 10 de cada clasificación y demuestra que conocés la velocidad pura.',
      icon: 'timer',
      positionsCount: 10,
      memberCount: 892,
      isJoined: false,
    },
    {
      id: 3,
      slug: 'sprint',
      name: 'Sprint League',
      description: 'Predice el Top 8 de cada carrera sprint. Menos posiciones, más intensidad.',
      icon: 'bolt',
      positionsCount: 8,
      memberCount: 634,
      isJoined: false,
    },
  ];
}

function getDefaultRankings(): LeagueRanking[] {
  return [
    { rank: 1, userId: 101, username: 'VerstappenFan', points: 847, predictionsCount: 23, perfectPredictions: 2, isCurrentUser: false },
    { rank: 2, userId: 102, username: 'HamiltonGOAT', points: 823, predictionsCount: 23, perfectPredictions: 1, isCurrentUser: false },
    { rank: 3, userId: 103, username: 'LeclercMagia', points: 798, predictionsCount: 22, perfectPredictions: 1, isCurrentUser: false },
    { rank: 4, userId: 104, username: 'NorrisTime', points: 756, predictionsCount: 23, perfectPredictions: 0, isCurrentUser: false },
    { rank: 5, userId: 105, username: 'SainzSmooth', points: 734, predictionsCount: 21, perfectPredictions: 1, isCurrentUser: false },
    { rank: 6, userId: 106, username: 'PiastroRookie', points: 712, predictionsCount: 23, perfectPredictions: 0, isCurrentUser: true },
    { rank: 7, userId: 107, username: 'AlonsoEterno', points: 698, predictionsCount: 20, perfectPredictions: 0, isCurrentUser: false },
    { rank: 8, userId: 108, username: 'RussellSunday', points: 687, predictionsCount: 22, perfectPredictions: 0, isCurrentUser: false },
    { rank: 9, userId: 109, username: 'PerezCheco', points: 654, predictionsCount: 19, perfectPredictions: 0, isCurrentUser: false },
    { rank: 10, userId: 110, username: 'StrollPay', points: 623, predictionsCount: 23, perfectPredictions: 0, isCurrentUser: false },
  ];
}

function getDefaultPilots(): Pilot[] {
  return [
    { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', number: '1', acronym: 'VER' },
    { id: 2, name: 'Sergio Pérez', team: 'Red Bull Racing', number: '11', acronym: 'PER' },
    { id: 3, name: 'Lewis Hamilton', team: 'Ferrari', number: '44', acronym: 'HAM' },
    { id: 4, name: 'Charles Leclerc', team: 'Ferrari', number: '16', acronym: 'LEC' },
    { id: 5, name: 'Lando Norris', team: 'McLaren', number: '4', acronym: 'NOR' },
    { id: 6, name: 'Oscar Piastri', team: 'McLaren', number: '81', acronym: 'PIA' },
    { id: 7, name: 'George Russell', team: 'Mercedes', number: '63', acronym: 'RUS' },
    { id: 8, name: 'Andrea Kimi Antonelli', team: 'Mercedes', number: '12', acronym: 'ANT' },
    { id: 9, name: 'Fernando Alonso', team: 'Aston Martin', number: '14', acronym: 'ALO' },
    { id: 10, name: 'Lance Stroll', team: 'Aston Martin', number: '18', acronym: 'STR' },
    { id: 11, name: 'Pierre Gasly', team: 'Alpine', number: '10', acronym: 'GAS' },
    { id: 12, name: 'Jack Doohan', team: 'Alpine', number: '7', acronym: 'DOO' },
    { id: 13, name: 'Yuki Tsunoda', team: 'Racing Bulls', number: '22', acronym: 'TSU' },
    { id: 14, name: 'Isack Hadjar', team: 'Racing Bulls', number: '6', acronym: 'HAD' },
    { id: 15, name: 'Nico Hülkenberg', team: 'Kick Sauber', number: '27', acronym: 'HUL' },
    { id: 16, name: 'Gabriel Bortoleto', team: 'Kick Sauber', number: '5', acronym: 'BOR' },
    { id: 17, name: 'Esteban Ocon', team: 'Haas', number: '31', acronym: 'OCO' },
    { id: 18, name: 'Oliver Bearman', team: 'Haas', number: '87', acronym: 'BEA' },
    { id: 19, name: 'Alexander Albon', team: 'Williams', number: '23', acronym: 'ALB' },
    { id: 20, name: 'Carlos Sainz', team: 'Williams', number: '55', acronym: 'SAI' },
  ];
}