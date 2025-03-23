<template>
  <div class="full-screen">
    <h1>Pantalla Completa</h1>
    <p>Este componente ocupa toda la pantalla.</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Contacto',
};
</script>

<style scoped>
.full-screen {
  width: 100%;
  height: 100vh;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
</style>
