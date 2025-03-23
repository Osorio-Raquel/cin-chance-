<template>
  <div class="container">
    <h1 class="titulo-principal">Algoritmo del Noroeste</h1>

    <!-- Botones de configuración -->
    <div class="contenedor-botones">
      <button
        @click="mostrarModalConfig = true"
        class="boton boton-configurar"
      >
        Configurar Problema
      </button>

      <button
        @click="resolverProblema"
        class="boton boton-resolver"
        :disabled="!esValidoParaResolver"
        :class="{'boton-deshabilitado': !esValidoParaResolver}"
      >
        Resolver Problema
      </button>
    </div>

    <!-- Sección principal -->
    <div class="grid-principal">
      <!-- Matriz Inicial -->
      <div class="tarjeta">
        <h2 class="titulo-seccion titulo-inicial">Matriz Inicial</h2>
        <div class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th class="celda-cabecera"></th>
                <th v-for="(demanda, j) in demandas" :key="`header-${j}`" class="celda-cabecera">
                  D{{ j + 1 }} ({{ demanda }})
                </th>
                <th class="celda-cabecera">Oferta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(oferta, i) in ofertas" :key="`row-${i}`">
                <th class="celda-cabecera-fila">O{{ i + 1 }}</th>
                <td v-for="(_, j) in demandas" :key="`cell-${i}-${j}`" class="celda-datos">
                  {{ costos[i][j] }}
                </td>
                <th class="celda-cabecera-fila">{{ oferta }}</th>
              </tr>
              <tr>
                <th class="celda-cabecera-fila">Demanda</th>
                <td v-for="(demanda, j) in demandas" :key="`demand-${j}`" class="celda-demanda">
                  {{ demanda }}
                </td>
                <th class="celda-cabecera">
                  <span :class="totalOferta === totalDemanda ? 'texto-equilibrado' : 'texto-desequilibrado'">
                    {{ totalOferta === totalDemanda ? 'Equilibrado' : 'Desequilibrado' }}
                  </span>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Matriz Final -->
      <div class="tarjeta">
        <h2 class="titulo-seccion titulo-final">Matriz Final</h2>
        <div v-if="solucion.length > 0" class="tabla-contenedor">
          <table class="tabla">
            <thead>
              <tr>
                <th class="celda-cabecera"></th>
                <th v-for="(demanda, j) in demandas" :key="`final-header-${j}`" class="celda-cabecera">
                  D{{ j + 1 }} ({{ demanda }})
                </th>
                <th class="celda-cabecera">Oferta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(oferta, i) in ofertas" :key="`final-row-${i}`">
                <th class="celda-cabecera-fila">O{{ i + 1 }}</th>
                <td
                  v-for="(_, j) in demandas"
                  :key="`final-cell-${i}-${j}`"
                  class="celda-datos"
                  :class="{'celda-asignada': getSolucionValue(i, j) > 0}"
                >
                  <div class="celda-contenido">
                    <span class="costo-valor">{{ costos[i][j] }}</span>
                    <span v-if="getSolucionValue(i, j) > 0" class="asignacion-valor">
                      {{ getSolucionValue(i, j) }}
                    </span>
                    <span v-else>-</span>
                  </div>
                </td>
                <th class="celda-cabecera-fila">{{ oferta }}</th>
              </tr>
              <tr>
                <th class="celda-cabecera-fila">Demanda</th>
                <td v-for="(demanda, j) in demandas" :key="`final-demand-${j}`" class="celda-demanda">
                  {{ demanda }}
                </td>
                <th class="celda-cabecera">
                  <span class="costo-total">Costo: {{ costoTotal }}</span>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mensaje-sin-solucion">
          La solución se mostrará aquí después de resolver el problema
        </div>
      </div>
    </div>

    <!-- Sección de pasos -->
    <div v-if="solucion.length > 0" class="tarjeta tarjeta-pasos">
      <h2 class="titulo-seccion titulo-pasos">Pasos de la Solución</h2>
      <div class="grid-pasos">
        <div v-for="(paso, index) in pasos" :key="`paso-${index}`" class="tarjeta-paso">
          <h4 class="titulo-paso">Paso {{ index + 1 }}</h4>
          <p>Asignación: (O{{ paso.i + 1 }}, D{{ paso.j + 1 }}) = {{ paso.valor }}</p>
          <p v-if="paso.ofertaAgotada" class="texto-oferta-agotada">Oferta de O{{ paso.i + 1 }} agotada</p>
          <p v-if="paso.demandaAgotada" class="texto-demanda-agotada">Demanda de D{{ paso.j + 1 }} satisfecha</p>
        </div>
      </div>
    </div>

    <!-- Modal de configuración -->
    <div v-if="mostrarModalConfig" class="modal-fondo">
      <div class="modal-contenido">
        <div class="modal-cabecera">
          <h2 class="modal-titulo">Configuración del Problema</h2>
          <button @click="mostrarModalConfig = false" class="boton-cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" class="icono-cerrar" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="grid-config">
          <div>
            <label class="etiqueta-config">Número de orígenes:</label>
            <input
              type="number"
              v-model.number="numOrigenes"
              min="2"
              max="10"
              class="input-config"
            />
          </div>
          <div>
            <label class="etiqueta-config">Número de destinos:</label>
            <input
              type="number"
              v-model.number="numDestinos"
              min="2"
              max="10"
              class="input-config"
            />
          </div>
        </div>

        <div class="seccion-config">
          <h3 class="subtitulo-config subtitulo-ofertas">Ofertas (Orígenes)</h3>
          <div class="grid-valores">
            <div v-for="(oferta, i) in ofertas" :key="`oferta-config-${i}`" class="contenedor-valor">
              <label class="etiqueta-valor">Origen {{ i + 1 }}:</label>
              <input
                type="number"
                v-model.number="ofertas[i]"
                min="0"
                class="input-valor"
              />
            </div>
          </div>
        </div>

        <div class="seccion-config">
          <h3 class="subtitulo-config subtitulo-demandas">Demandas (Destinos)</h3>
          <div class="grid-valores">
            <div v-for="(demanda, j) in demandas" :key="`demanda-config-${j}`" class="contenedor-valor">
              <label class="etiqueta-valor">Destino {{ j + 1 }}:</label>
              <input
                type="number"
                v-model.number="demandas[j]"
                min="0"
                class="input-valor"
              />
            </div>
          </div>
        </div>

        <div class="seccion-config">
          <h3 class="subtitulo-config subtitulo-costos">Costos de transporte</h3>
          <div class="tabla-contenedor">
            <table class="tabla tabla-costos">
              <thead>
                <tr>
                  <th class="celda-cabecera"></th>
                  <th v-for="(_, j) in demandas" :key="`cost-header-${j}`" class="celda-cabecera">
                    D{{ j + 1 }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(_, i) in ofertas" :key="`cost-row-${i}`">
                  <th class="celda-cabecera-fila">O{{ i + 1 }}</th>
                  <td v-for="(_, j) in demandas" :key="`cost-cell-${i}-${j}`" class="celda-input">
                    <input
                      type="number"
                      v-model.number="costos[i][j]"
                      min="0"
                      class="input-costo"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-pie">
          <button
            @click="cargarEjemplo"
            class="boton boton-ejemplo"
          >
            Cargar Ejemplo
          </button>
          <div class="contenedor-botones-modal">
            <button
              @click="mostrarModalConfig = false"
              class="boton boton-cancelar"
            >
              Cancelar
            </button>
            <button
              @click="confirmarConfig"
              class="boton boton-confirmar"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NorOeste',
  data() {
    return {
      numOrigenes: 3,
      numDestinos: 4,
      ofertas: [20, 30, 25],
      demandas: [10, 15, 20, 30],
      costos: [
        [2, 3, 4, 1],
        [5, 4, 3, 2],
        [3, 1, 5, 6]
      ],
      solucion: [],
      pasos: [],
      mostrarModalConfig: false
    }
  },
  computed: {
    totalOferta() {
      return this.ofertas.reduce((sum, val) => sum + (val || 0), 0);
    },
    totalDemanda() {
      return this.demandas.reduce((sum, val) => sum + (val || 0), 0);
    },
    esValidoParaResolver() {
      // Verificar que todos los datos estén completos
      if (this.ofertas.some(val => val === null || val === undefined || val < 0)) return false;
      if (this.demandas.some(val => val === null || val === undefined || val < 0)) return false;

      // Verificar que haya datos para resolver
      return this.totalOferta > 0 && this.totalDemanda > 0;
    },
    costoTotal() {
      let total = 0;
      for (const item of this.solucion) {
        total += item.valor * this.costos[item.i][item.j];
      }
      return total;
    }
  },
  watch: {
    numOrigenes(newVal) {
      // Ajustar el array de ofertas
      if (newVal > this.ofertas.length) {
        const toAdd = newVal - this.ofertas.length;
        for (let i = 0; i < toAdd; i++) {
          this.ofertas.push(0);
        }
      } else if (newVal < this.ofertas.length) {
        this.ofertas.splice(newVal);
      }

      // Ajustar la matriz de costos
      this.ajustarMatrizCostos();
    },
    numDestinos(newVal) {
      // Ajustar el array de demandas
      if (newVal > this.demandas.length) {
        const toAdd = newVal - this.demandas.length;
        for (let i = 0; i < toAdd; i++) {
          this.demandas.push(0);
        }
      } else if (newVal < this.demandas.length) {
        this.demandas.splice(newVal);
      }

      // Ajustar la matriz de costos
      this.ajustarMatrizCostos();
    }
  },
  methods: {
    ajustarMatrizCostos() {
      const newCostos = [];
      for (let i = 0; i < this.numOrigenes; i++) {
        if (!this.costos[i]) {
          // Si la fila no existe, la creamos
          const row = Array(this.numDestinos).fill(0);
          newCostos.push(row);
        } else {
          // Si la fila existe, ajustamos su longitud
          const row = [...this.costos[i]];
          while (row.length < this.numDestinos) {
            row.push(0);
          }
          newCostos.push(row.slice(0, this.numDestinos));
        }
      }
      this.costos = newCostos;
    },
    resolverProblema() {
      // Reiniciar la solución
      this.solucion = [];
      this.pasos = [];

      // Copiar los datos para no modificar los originales
      const ofertasCopia = [...this.ofertas];
      const demandasCopia = [...this.demandas];

      // Implementación del algoritmo del Noroeste
      let i = 0;
      let j = 0;

      while (i < this.numOrigenes && j < this.numDestinos) {
        const oferta = ofertasCopia[i];
        const demanda = demandasCopia[j];

        // Calcular la cantidad a asignar (el mínimo entre oferta y demanda)
        const asignacion = Math.min(oferta, demanda);

        if (asignacion > 0) {
          // Registrar la asignación
          const paso = {
            i,
            j,
            valor: asignacion,
            ofertaAgotada: false,
            demandaAgotada: false
          };

          // Actualizar oferta y demanda
          ofertasCopia[i] -= asignacion;
          demandasCopia[j] -= asignacion;

          // Guardar en la solución
          this.solucion.push({
            i,
            j,
            valor: asignacion
          });

          // Determinar el siguiente paso
          if (ofertasCopia[i] === 0) {
            // Si la oferta se agotó, moverse a la siguiente fila
            paso.ofertaAgotada = true;
            i++;
          } else {
            // Si la demanda se agotó, moverse a la siguiente columna
            paso.demandaAgotada = true;
            j++;
          }

          // Registrar el paso
          this.pasos.push(paso);
        } else {
          // En caso de que haya oferta o demanda cero (caso extraño, pero posible)
          if (ofertasCopia[i] === 0) i++;
          else j++;
        }
      }
    },
    getSolucionValue(i, j) {
      const item = this.solucion.find(s => s.i === i && s.j === j);
      return item ? item.valor : 0;
    },
    confirmarConfig() {
      this.mostrarModalConfig = false;
      // Reiniciar la solución al cambiar la configuración
      this.solucion = [];
      this.pasos = [];
    },
    cargarEjemplo() {
      // Cargar un ejemplo predefinido
      this.numOrigenes = 3;
      this.numDestinos = 4;
      this.ofertas = [20, 30, 25];
      this.demandas = [10, 15, 20, 30];
      this.costos = [
        [2, 3, 4, 1],
        [5, 4, 3, 2],
        [3, 1, 5, 6]
      ];
      this.ajustarMatrizCostos();
    }
  },
  mounted() {
    // Inicializar la matriz de costos
    this.ajustarMatrizCostos();

    // Mostrar el modal de configuración al inicio
    this.mostrarModalConfig = true;
  }
}
</script>

<style>
/* Estilos generales */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f9fc;
  font-family: Arial, sans-serif;
}

.titulo-principal {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
  color: #1a56db;
}

/* Botones principales */
.contenedor-botones {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.boton {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

.boton-configurar {
  background-color: #3b82f6;
  color: white;
}

.boton-configurar:hover {
  background-color: #2563eb;
}

.boton-resolver {
  background-color: #10b981;
  color: white;
}

.boton-resolver:hover {
  background-color: #059669;
}

.boton-deshabilitado {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Grid principal */
.grid-principal {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .grid-principal {
    grid-template-columns: 1fr 1fr;
  }
}

/* Tarjetas */
.tarjeta {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tarjeta-pasos {
  margin-top: 24px;
}

.titulo-seccion {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 16px;
}

.titulo-inicial {
  color: #2563eb;
}

.titulo-final {
  color: #059669;
}

.titulo-pasos {
  color: #7c3aed;
}

/* Tablas */
.tabla-contenedor {
  overflow-x: auto;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.celda-cabecera, .celda-cabecera-fila {
  border: 2px solid #e5e7eb;
  padding: 8px;
  background-color: #f3f4f6;
  font-weight: bold;
}

.celda-datos {
  border: 2px solid #e5e7eb;
  padding: 8px;
  text-align: center;
}

.celda-asignada {
  background-color: #dbeafe;
}

.celda-demanda {
  border: 2px solid #e5e7eb;
  padding: 8px;
  text-align: center;
  font-weight: bold;
}

.celda-contenido {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.costo-valor {
  color: #6b7280;
  font-size: 0.875rem;
}

.asignacion-valor {
  font-weight: bold;
  color: #2563eb;
  font-size: 1.125rem;
}

.texto-equilibrado {
  color: #16a34a;
}

.texto-desequilibrado {
  color: #dc2626;
}

.costo-total {
  font-weight: bold;
  color: #16a34a;
}

.mensaje-sin-solucion {
  text-align: center;
  padding: 32px;
  color: #6b7280;
}

/* Pasos */
.grid-pasos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.tarjeta-paso {
  background-color: #f5f3ff;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #7c3aed;
}

.titulo-paso {
  font-weight: bold;
  color: #7c3aed;
  margin-bottom: 8px;
}

.texto-oferta-agotada {
  color: #2563eb;
}

.texto-demanda-agotada {
  color: #16a34a;
}

/* Modal */
.modal-fondo {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-contenido {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  margin: 16px;
}

.modal-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-titulo {
  font-size: 24px;
  font-weight: bold;
  color: #2563eb;
}

.boton-cerrar {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.boton-cerrar:hover {
  color: #374151;
}

.icono-cerrar {
  width: 24px;
  height: 24px;
}

.grid-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.etiqueta-config {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-config {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.input-config:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.seccion-config {
  margin-bottom: 24px;
}

.subtitulo-config {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.subtitulo-ofertas {
  color: #2563eb;
}

.subtitulo-demandas {
  color: #16a34a;
}

.subtitulo-costos {
  color: #7c3aed;
}

.grid-valores {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.contenedor-valor {
  display: flex;
  flex-direction: column;
}

.etiqueta-valor {
  margin-bottom: 4px;
}

.input-valor {
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.input-valor:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.celda-input {
  border: 2px solid #e5e7eb;
  padding: 4px;
}

.input-costo {
  width: 100%;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  text-align: center;
}

.modal-pie {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.contenedor-botones-modal {
  display: flex;
  gap: 12px;
}

.boton-ejemplo {
  background-color: #6b7280;
  color: white;
}

.boton-ejemplo:hover {
  background-color: #4b5563;
}

.boton-cancelar {
  background-color: #ef4444;
  color: white;
}

.boton-cancelar:hover {
  background-color: #dc2626;
}

.boton-confirmar {
  background-color: #3b82f6;
  color: white;
}

.boton-confirmar:hover {
  background-color: #2563eb;
}
</style>
