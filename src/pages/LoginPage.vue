<template>
  <q-page class="flex flex-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <q-card class="login-card q-pa-lg shadow-10">
      <q-card-section class="text-center">
        <div class="text-h4 text-weight-bold q-mb-md">🏎️ Apex League</div>
        <div class="text-h6 text-grey-7">{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Username (solo en registro) -->
          <q-input
            v-if="!isLogin"
            v-model="username"
            label="Nombre de usuario"
            outlined
            dense
            :rules="[val => !!val || 'Campo requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <!-- Email -->
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[
              val => !!val || 'Campo requerido',
              val => /.+@.+\..+/.test(val) || 'Email inválido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <!-- Password -->
          <q-input
            v-model="password"
            :label="isLogin ? 'Contraseña' : 'Contraseña (mín. 6 caracteres)'"
            :type="showPassword ? 'text' : 'password'"
            outlined
            dense
            :rules="[
              val => !!val || 'Campo requerido',
              val => isLogin || val.length >= 6 || 'Mínimo 6 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Error message -->
          <q-banner v-if="authStore.error" class="bg-negative text-white rounded-borders">
            <template v-slot:avatar>
              <q-icon name="error" color="white" />
            </template>
            {{ authStore.error }}
          </q-banner>

          <!-- Submit button -->
          <q-btn
            :label="isLogin ? 'Iniciar Sesión' : 'Registrarse'"
            type="submit"
            color="primary"
            class="full-width"
            :loading="authStore.loading"
            size="lg"
            no-caps
          />

          <!-- Toggle login/register -->
          <div class="text-center q-mt-md">
            <q-btn
              flat
              :label="isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'"
              color="primary"
              @click="toggleMode"
              no-caps
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const $q = useQuasar();

const isLogin = ref(true);
const username = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);

function toggleMode() {
  isLogin.value = !isLogin.value;
  authStore.error = null;
  // Limpiar campos al cambiar de modo
  username.value = '';
  email.value = '';
  password.value = '';
}

async function handleSubmit() {
  let success = false;

  if (isLogin.value) {
    success = await authStore.login(email.value, password.value);
  } else {
    success = await authStore.register(username.value, email.value, password.value);
  }

  if (success) {
    $q.notify({
      type: 'positive',
      message: isLogin.value ? '¡Bienvenido!' : '¡Cuenta creada exitosamente!',
      position: 'top',
      timeout: 2000
    });

    await router.push('/');
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
}

@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }
}
</style>