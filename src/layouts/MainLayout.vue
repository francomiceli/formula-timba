<template>
  <q-layout view="lHh Lpr lFf">
    <!-- HEADER -->
    <q-header elevated class="f1-header">
      <q-toolbar>
        <q-toolbar-title class="f1-title">
          Formula 1 Predictions
        </q-toolbar-title>
        <!-- Aquí podés agregar botones si querés, por ejemplo menú o logout -->
      </q-toolbar>
    </q-header>

    <!-- PAGE CONTAINER -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

</script>

<style scoped>
.f1-header {
  background-color: #121212;
  border-bottom: 4px solid #FF0000;
  font-family: 'Orbitron', sans-serif;
}

.f1-title {
  font-weight: bold;
  font-size: 1.5rem;
  color: #FF0000;
}
</style>