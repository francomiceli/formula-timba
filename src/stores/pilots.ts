import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export interface Pilot {
  id: number;
  name: string;
  team: string;
  number: string;
  acronym: string;
}

export const usePilotsStore = defineStore("pilots", () => {
  // ------------------------------
  // Estado
  // ------------------------------
  const pilots = ref<Pilot[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ------------------------------
  // Actions
  // ------------------------------
  async function fetchPilots() {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get<Pilot[]>("http://localhost:3000/api/pilots");
      pilots.value = res.data;
      console.log(pilots.value);
} catch (err: unknown) {
  if (err instanceof Error) {
    error.value = err.message;
  } else {
    error.value = "Error desconocido";
  }
} finally {
      loading.value = false;
    }
  }

  return {
    pilots,
    loading,
    error,
    fetchPilots,
  };
});