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
      <v-btn variant="text" @click="dialog = true">Help</v-btn>

    </v-app-bar>

    <v-main class="full-screen">
      <div class="centered-content">
        <router-view />
        <v-dialog v-model="dialog" width="800">
          <v-card class="help-card">
            <v-card-title class="help-title">HELP-GRAPH</v-card-title>
            <v-card-text class="help-carousel">
              <v-carousel hide-delimiters show-arrows="hover" height="400">
                <v-carousel-item src="../public/img/imgHelp11.png">
                </v-carousel-item>
              </v-carousel>
            </v-card-text>
            <v-card-actions class="help-actions">
              <v-btn class="help-button" color="primary" @click="downloadPDF">Descargar</v-btn>
              <v-btn class="help-button" color="primary" @click="dialog = false">Cerrar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data(): { dialog: boolean } {
    return {
      dialog: false,
    };
  },
  methods: {
    downloadPDF() {
      const link = document.createElement('a');
      link.href = '../public/img/pdfHelp2.pdf';
      link.download = 'pdfHelp2.pdf';
      link.click();
    },
  },
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

.help-card {
  border-radius: 20px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.4s ease-in-out;
  font-family: 'Poppins', sans-serif;
}

.help-card:hover {
  transform: scale(1.02);
}

.help-title {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  color: white;
  padding: 20px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
  font-family: 'Poppins', sans-serif;
}

.help-carousel {
  border-bottom: 2px solid #1976D2;
}

.v-carousel {
  border-radius: 15px;
  overflow: hidden;
}

.v-carousel-item img {
  object-fit: contain;
  max-height: 350px;
  margin: auto;
}

.help-actions {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #f0f0f0;
  border-top: 2px solid #1976D2;
}

.help-button {
  width: 120px;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 1px;
  transition: background-color 0.3s ease, border 0.3s ease;
  border: 2px solid #1976D2;
  font-family: 'Poppins', sans-serif;
}

.help-button:hover {
  background-color: #1565C0;
  color: white;
  border: 2px solid #0D47A1;
}
</style>
