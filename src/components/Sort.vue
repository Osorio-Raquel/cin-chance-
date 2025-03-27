<template>
  <div class="sort-container">
      <div class="input-section">
          <v-text-field
              v-model="newNumber"
              label="Ingrese un número"
              type="text"
              @keyup.enter="addNumber"
              :error-messages="inputError"
          />
          <v-btn color="primary" @click="addNumber">Agregar</v-btn>
          <v-btn color="error" @click="resetArray">Reiniciar</v-btn>
      </div>

      <div class="bars-container">
        <div
    v-for="(bar, index) in numbers"
    :key="index"
    class="bar"
    :style="{
        height: calculateBarHeight(bar.value, 700) + 'px',
        backgroundColor: getBarColor(index),
        transition: 'all 0.1s ease',
        boxShadow: getBarShadow(index)
    }"
    @click="openEditDialog(index)"
>
    {{ bar.value }}
</div>
      </div>

      <div class="sort-info" v-if="sortInfo">
          <p>{{ sortInfo }}</p>
      </div>

      <div class="sort-buttons">
          <v-btn color="success" @click="selectionSort">Selection Sort</v-btn>
          <v-btn color="info" @click="insertionSort">Insertion Sort</v-btn>
          <v-btn color="warning" @click="shellSort">Shell Sort</v-btn>
      </div>

      <v-dialog v-model="dialog" max-width="400">
          <v-card>
              <v-card-title>Editar Barra</v-card-title>
              <v-card-text>
                  <v-text-field
                      v-model="editValue"
                      label="Nuevo valor"
                      type="number"
                      outlined
                  />
                  <v-color-picker
                      v-model="editColor"
                      hide-canvas
                      show-swatches
                      mode="hexa"
                      swatches-max-height="150"
                  />
                  <div
                      class="color-preview"
                      :style="{ backgroundColor: editColor, height: '40px', width: '100%', marginTop: '10px', borderRadius: '4px' }"
                  ></div>
              </v-card-text>

              <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" text @click="dialog = false">Cancelar</v-btn>
                  <v-btn color="success" text @click="saveChanges">Guardar</v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import * as Tone from 'tone';
  const numbers = ref([]);
  const newNumber = ref('');
  const inputError = ref('');
  const highlightedIndices = ref([]);
  const comparedIndices = ref([]);
  const swappedIndices = ref([]);
  const dialog = ref(false);
  const editIndex = ref(null);
  const editValue = ref(0);
  const editColor = ref('#000000');
  const sortInfo = ref('');




  const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i=0; i<6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  };

  const getBarColor = (index) => {
      // Prioriza los estados de resaltado
      if (swappedIndices.value.includes(index)) return '#FF5722'; // Naranja para intercambios
      if (comparedIndices.value.includes(index)) return '#2196F3'; // Azul para comparaciones
      if (highlightedIndices.value.includes(index)) return '#4CAF50'; // Verde para selección
      return numbers.value[index].color; // Color original
  };

  const getBarShadow = (index) => {
      if (swappedIndices.value.includes(index))
          return '0 0 20px 5px rgba(255, 87, 34, 0.7)'; // Sombra naranja intensa
      if (comparedIndices.value.includes(index))
          return '0 0 15px 3px rgba(33, 150, 243, 0.6)'; // Sombra azul
      if (highlightedIndices.value.includes(index))
          return '0 0 10px 2px rgba(76, 175, 80, 0.5)'; // Sombra verde
      return 'none';
  };


const maxValue = ref(0);

const calculateBarHeight = (value, containerHeight) => {
    // Si no hay números, usa un valor por defecto
    if (maxValue.value === 0) return 50;

    // Calcula la altura proporcional al máximo valor
    const scaleFactor = 600 / maxValue.value; // Usar casi toda la altura del contenedor
    return Math.max(
        Math.abs(value) * scaleFactor,
        20 // Altura mínima
    );
};

const addNumber = () => {
    const parsedNumber = parseInt(newNumber.value);
    if (isNaN(parsedNumber)) {
        inputError.value = 'Por favor ingrese un número válido';
        return;
    }

    // Actualizar el valor máximo
    maxValue.value = Math.max(
        maxValue.value,
        Math.abs(parsedNumber)
    );

    numbers.value.push({
        value: parsedNumber,
        color: getRandomColor()
    });
    newNumber.value = '';
    inputError.value = '';
};

const resetArray = () => {
    numbers.value = [];
    maxValue.value = 0; // Reiniciar el valor máximo
    highlightedIndices.value = [];
    comparedIndices.value = [];
    swappedIndices.value = [];
    sortInfo.value = '';
};

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const highlightBars = async (index1, index2, type = 'compare') => {
    if (type === 'compare') {
        comparedIndices.value = [index1, index2];
    } else if (type === 'swap') {
        swappedIndices.value = [index1, index2];
    }
    await sleep(25); // Aquí se puede reducir el tiempo de espera
    comparedIndices.value = [];
    swappedIndices.value = [];
};

  const openEditDialog = (index) => {
      editIndex.value = index;
      editValue.value = numbers.value[index].value;
      editColor.value = numbers.value[index].color;
      dialog.value = true;
  };

  const saveChanges = () => {
    if (!isNaN(editValue.value)) {
        const oldValue = numbers.value[editIndex.value].value;
        const newValue = parseInt(editValue.value);

        // Actualizar el valor máximo
        maxValue.value = Math.max(
            maxValue.value,
            Math.abs(newValue)
        );

        numbers.value[editIndex.value].value = newValue;
        numbers.value[editIndex.value].color = editColor.value;
    }
    dialog.value = false;
};

// Configuración de sintetizadores más melódicos
const melodicSynth = new Tone.PolySynth({
    oscillator: {
        type: 'triangle', // Sonido más suave y melódico
        partials: [1, 0.3, 0.2] // Añade profundidad armónica
    },
    envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.3,
        release: 0.4
    }
}).toDestination();

// Sonido de victoria al estilo Mario Bros
const victorySequence = new Tone.Sequence((time, note) => {
    melodicSynth.triggerAttackRelease(note, '8n', time);
}, [
    'C5', 'E5', 'G5', 'C6', // Ascendente alegre
    'G5', 'E5', 'C5'        // Descenso triunfal
], '8n');

const getNoteFromValue = (value, maxValue) => {
    // Escala pentatónica para sonidos más musicales
    const pentatonicScale = [
        60, // C4
        62, // D4
        64, // E4
        67, // G4
        69  // A4
    ];

    const index = Math.floor(
        (Math.abs(value) / maxValue) * (pentatonicScale.length - 1)
    );

    return Tone.Frequency(pentatonicScale[index], 'midi').toFrequency();
};

const selectionSort = async () => {
    // Iniciar el audio
    await Tone.start();

    const arr = numbers.value;
    sortInfo.value = 'Iniciando Selection Sort...';

    for (let pA = 0; pA < arr.length; pA++) {
        let pvm = pA;
        sortInfo.value = `Buscando el mínimo desde la posición ${pA}`;

        for (let sP = pA + 1; sP < arr.length; sP++) {
            // Sonidos melódicos de comparación
            melodicSynth.triggerAttackRelease(
                getNoteFromValue(arr[sP].value, maxValue.value),
                '16n'
            );

            await highlightBars(pA, sP, 'compare');

            if (arr[sP].value < arr[pvm].value) {
                pvm = sP;
                sortInfo.value = `Nuevo mínimo encontrado en posición ${sP}`;
            }
        }

        if (pA !== pvm) {
            // Sonido de intercambio más musical
            melodicSynth.triggerAttackRelease(
                getNoteFromValue(arr[pvm].value, maxValue.value),
                '8n'
            );

            sortInfo.value = `Intercambiando elementos en posiciones ${pA} y ${pvm}`;

            await highlightBars(pA, pvm, 'swap');

            [arr[pA], arr[pvm]] = [arr[pvm], arr[pA]];
            numbers.value = [...arr];

            await sleep(1);
        }
    }

    // Secuencia de victoria al estilo Mario
    sortInfo.value = 'Selection Sort completado';

    // Reproducir secuencia de victoria
    Tone.Transport.start();
    victorySequence.start(0);

    // Detener la secuencia después de un tiempo
    setTimeout(() => {
        victorySequence.stop(0);
        Tone.Transport.stop();
    }, 2000);
};
  const insertionSort = async () => {
      const arr = numbers.value;
      sortInfo.value = 'Iniciando Insertion Sort...';

      for (let pA = 1; pA < arr.length; pA++) {
          let valorActual = arr[pA];
          let posicion = pA;
          sortInfo.value = `Insertando elemento en posición ${pA}`;

          while (posicion > 0 && valorActual.value < arr[posicion - 1].value) {
              await highlightBars(posicion, posicion - 1, 'compare');
              arr[posicion] = arr[posicion - 1];
              posicion--;
              sortInfo.value = `Moviendo elemento hacia la izquierda`;
          }

          arr[posicion] = valorActual;
          numbers.value = [...arr];
          await sleep(1); // Reduced from 500 to 250
      }

      sortInfo.value = 'Insertion Sort completado';
  };

  const shellSort = async () => {
      const arr = numbers.value;
      sortInfo.value = 'Iniciando Shell Sort...';
      let gap = Math.floor(arr.length / 2);

      while (gap > 0) {
          sortInfo.value = `Iniciando paso con gap = ${gap}`;

          for (let pA = gap; pA < arr.length; pA++) {
              let valorActual = arr[pA];
              let posicion = pA;

              while (posicion >= gap && valorActual.value < arr[posicion - gap].value) {
                  await highlightBars(posicion, posicion - gap, 'compare');
                  arr[posicion] = arr[posicion - gap];
                  posicion -= gap;
                  sortInfo.value = `Reordenando con gap ${gap}`;
              }

              arr[posicion] = valorActual;
              numbers.value = [...arr];
              await sleep(1); // Reduced from 500 to 250
          }

          gap = Math.floor(gap / 2);
      }

      sortInfo.value = 'Shell Sort completado';
  };

</script>

<style scoped>
.sort-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 40px;
}

.input-section {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 450px;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 700px;
  width: 1950px;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #f9f9f9;
}

.bar {
  width: 50px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sort-buttons {
  display: flex;
  gap: 15px;
}

.sort-info {
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}
</style>
