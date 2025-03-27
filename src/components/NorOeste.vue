<!-- NorthwestMethod.vue -->
<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Método del Rincón Noroeste</h1>

    <div class="mb-2">
      <label class="mr-2">Tipo de problema:</label>
      <select v-model="problemType">
        <option value="min">Minimizar</option>
        <option value="max">Maximizar</option>
      </select>
    </div>

    <!-- Aquí irán inputs para la matriz de costos, oferta y demanda -->
    <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded" @click="solve">
      Resolver
    </button>

    <div v-if="result.length > 0" class="mt-6">
      <h2 class="text-xl font-semibold mb-2">Resultado:</h2>
      <table class="table-auto border-collapse border border-gray-400">
        <tr v-for="(row, i) in result" :key="i">
          <td v-for="(val, j) in row" :key="j" class="border border-gray-400 p-2">
            {{ val }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const problemType = ref("min") // "min" o "max"

// Datos de prueba
const costs = ref([
  [8, 6, 10],
  [9, 7, 4]
])
const supply = ref([35, 50])
const demand = ref([30, 40, 15])

const result = ref([])

function solve() {
  let matrix = JSON.parse(JSON.stringify(costs.value)) // Copia de la matriz

  if (problemType.value === "max") {
    // Convertir ganancias a pseudo-costos negativos (para poder minimizar)
    const maxVal = Math.max(...matrix.flat())
    matrix = matrix.map(row => row.map(val => maxVal - val))
  }

  const m = supply.value.length
  const n = demand.value.length

  let i = 0, j = 0
  const allocation = Array.from({ length: m }, () => Array(n).fill(0))
  let supplyLeft = [...supply.value]
  let demandLeft = [...demand.value]

  while (i < m && j < n) {
    const amount = Math.min(supplyLeft[i], demandLeft[j])
    allocation[i][j] = amount
    supplyLeft[i] -= amount
    demandLeft[j] -= amount

    if (supplyLeft[i] === 0) i++
    else if (demandLeft[j] === 0) j++
  }

  result.value = allocation
}
</script>

<style scoped>
select {
  border: 1px solid #ccc;
  padding: 5px;
}
</style>
