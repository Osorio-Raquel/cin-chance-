<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>cin>>chance;</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" :to="{ name: 'graph' }">Graph</v-btn>
<v-btn variant="text" :to="{ name: 'johnson' }">Johnson</v-btn>
<v-btn variant="text" :to="{ name: 'asignacion' }">Asignación</v-btn>
<v-btn variant="text" :to="{ name: 'noroeste' }">NorOeste</v-btn>
<v-btn variant="text" :to="{ name: 'sort' }">Sort</v-btn>
<v-btn variant="text" :to="{ name: 'tree' }">Tree</v-btn>
<v-btn variant="text" :to="{ name: 'fft' }">FFT</v-btn>
<v-btn variant="text" :to="{ name: 'bigo' }">Big O</v-btn>
<v-btn variant="text" :to="{ name: 'ia' }">IA</v-btn>

    </v-app-bar>

    <v-main class="full-screen">
      <div class="centered-content">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>

<style scoped>
.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; 
  padding-top: 64px;  
  background-color: white;
  overflow: hidden;
}

.centered-content {
  display: flex;
  justify-content: center;  
  align-items: center;    
  width: 100%;
  height: calc(100vh - 64px); 
}

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>

