<template>
  <q-page padding class="column items-center q-gutter-md">
    <h2 class="text-h5 text-weight-bold">Predicción Top 10 - Próxima Carrera</h2>

    <!-- Estado de carga -->
    <q-spinner v-if="pilotsStore.loading" size="40px" />

    <!-- Error al cargar pilotos -->
    <q-banner v-if="pilotsStore.error" class="bg-red text-white q-pa-md">
      {{ pilotsStore.error }}
    </q-banner>

    <!-- Lista de posiciones estilo F1 -->
    <div
      v-if="pilotsStore.pilots.length"
      class="q-pa-lg rounded-borders"
    >
      <div v-for="pos in 10" :key="pos" class="pilot-card q-mb-sm">
        <div class="position-number">{{ pos }}</div>

        <div class="pilot-info">
        <q-select
          v-model="positions[pos]"
          :options="pilotOptions"
          option-label="name"
          option-value="id"
          :label="positions[pos] 
           ? pilotOptions.find(p => p.id === positions[pos])?.name 
           : 'Seleccionar Piloto'"
          dense
          filled
          :disable="predictionSubmitting"
          @update:model-value="validateUniquePilots(pos)"
        />
        </div>


      </div>
    </div>

    <!-- Botón enviar -->
    <q-btn
      label="Enviar predicción"
      color="primary"
      class="q-mt-lg"
      :disable="!isFormValid"
      :loading="predictionSubmitting"
      @click="submit"
    />

    <q-banner v-if="predictionStore.success" class="bg-green text-white q-pa-md q-mt-md">
      ¡Predicción enviada correctamente!
    </q-banner>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from "vue";
import { usePilotsStore } from "src/stores/pilots";
import { usePredictionStore } from "src/stores/prediction";

const pilotsStore = usePilotsStore();
const predictionStore = usePredictionStore();

// Posición -> pilotId
const positions = reactive<Record<number, number | null>>({});

// Opciones de pilotos para el select
const pilotOptions = computed(() => pilotsStore.pilots);

// Evita que un piloto se repita en distintas posiciones
function validateUniquePilots(changedPos: number) {
  const selectedPilotId = positions[changedPos];
  if (!selectedPilotId) return;

  // Limpiar duplicados en otras posiciones
  for (let pos = 1; pos <= 10; pos++) {
    if (pos !== changedPos && positions[pos] === selectedPilotId) {
      positions[pos] = null;
    }
  }
}

// Valida que todas las posiciones tengan un piloto
const isFormValid = computed(() => {
  const selected = Object.values(positions).filter(Boolean);
  return selected.length === 10;
});

const predictionSubmitting = computed(() => predictionStore.loading);

async function submit() {
  const prediction: Record<number, number> = {};

  for (let pos = 1; pos <= 10; pos++) {
    prediction[pos] = positions[pos]!;
  }

  await predictionStore.submitPrediction(prediction);
}

onMounted(async() => {
  await pilotsStore.fetchPilots();
});
</script>

<style scoped>
.pilot-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1C1C1C;
  border-radius: 12px;
  padding: 12px 16px;
  gap: 16px;
  transition: transform 0.2s, border-color 0.2s;
  border-left: 6px solid #FF0000; /* borde primario rojo F1 */
}

.pilot-card:hover {
  transform: scale(1.02);
  border-left-color: #F1C40F; /* resaltar al hover */
}

.position-number {
  font-size: 2rem;
  font-weight: bold;
  color: #FF0000;
  min-width: 50px;
  text-align: center;
}

.pilot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pilot-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.q-select {
  min-width: 220px;
}

::v-deep(.q-field__native) {
  background-color: transparent;
}
</style>