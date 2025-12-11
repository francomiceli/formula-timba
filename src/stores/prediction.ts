import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";

export const usePredictionStore = defineStore("prediction", () => {
    const loading = ref(false);
    const error = ref<string | null>(null);
    const success = ref(false);

    async function submitPrediction(prediction: Record<number, number>) {
        loading.value = true;
        error.value = null;
        success.value = false;

        try {
            await axios.post("http://localhost:3000/api/predictions", {
                prediction,
            });
            success.value = true;
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
        loading,
        error,
        success,
        submitPrediction,
    };
});