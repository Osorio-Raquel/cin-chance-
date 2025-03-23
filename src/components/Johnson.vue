<template>
  <div class="graph-wrapper">
    <h2 class="graph-title">Grafo de Johnson - Nodos Cuadrantes</h2>

    <div class="graph-legend">
      <div class="legend-item">
        <span class="legend-color" style="background-color: #27ae60;"></span> Ruta Crítica (Nodos y Aristas)
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #e74c3c;"></span> Otras conexiones
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #2c3e50; color: white; padding: 3px;">H</span> Holgura en aristas
      </div>
    </div>
    <div ref="graphContainer" class="graph-container"></div>
  </div>
</template>

<script>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Network,DataSet } from "vis-network/standalone";
import { useGraphStore } from "../stores/graphStores";

export default {
  setup() {
    const route = useRoute();
    const graphContainer = ref(null);
    let network = null;


    const graphStore = useGraphStore();
    const a = ref([]);
    const b = ref([]);
    const holguras = ref([]);
    function llenarA() {
      console.log("🚀 Iniciando llenarA()");
      const n = graphStore.nodes.get().length;
      a.value = new Array(n).fill(0);

      let cambio = true;
      let iteraciones = 0;
      const maxIteraciones = n * 2;

      while (cambio && iteraciones < maxIteraciones) {
        cambio = false;
        iteraciones++;

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (graphStore.adjacencyMatrix.value[i][j] !== 0) {
              const duracion = graphStore.adjacencyMatrix.value[i][j] === -1 ? 0 : graphStore.adjacencyMatrix.value[i][j];
              const nuevaA = a.value[i] + duracion;

              if (nuevaA > a.value[j]) {
                a.value[j] = nuevaA;
                cambio = true;
                console.log(`🟢 Actualizando a[${j}] = ${a.value[j]}`);
              }
            }
          }
        }
      }
      console.log("✅ Valores finales de A:", a.value);
    }

    function llenarB() {
      console.log("🚀 Iniciando llenarB()");
      const n = graphStore.nodes.get().length;
      b.value = new Array(n).fill(Infinity);
      b.value[n - 1] = a.value[n - 1];

      console.log(`Estableciendo b[${n - 1}] = ${b.value[n - 1]}`);

      let cambio = true;
      let iteraciones = 0;
      const maxIteraciones = n * 2;

      while (cambio && iteraciones < maxIteraciones) {
        cambio = false;
        iteraciones++;

        for (let j = n - 1; j >= 0; j--) {
          for (let i = 0; i < n; i++) {
            if (graphStore.adjacencyMatrix.value[i][j] !== 0) {
              const duracion = graphStore.adjacencyMatrix.value[i][j] === -1 ? 0 : graphStore.adjacencyMatrix.value[i][j];
              const nuevaB = b.value[j] - duracion;

              if (nuevaB < b.value[i]) {
                b.value[i] = nuevaB;
                cambio = true;
                console.log(`🟢 Actualizando b[${i}] = ${b.value[i]}`);
              }
            }
          }
        }
      }
      console.log("✅ Valores finales de B:", b.value);
    }

    function calcularH() {
      console.log("🚀 Iniciando calcularH()");
      const n = graphStore.nodes.get().length;
      holguras.value = Array(n).fill(null).map(() => Array(n).fill(null));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (graphStore.adjacencyMatrix.value[i][j] !== 0) {
            const duracion = graphStore.adjacencyMatrix.value[i][j] === -1 ? 0 : graphStore.adjacencyMatrix.value[i][j];
            holguras.value[i][j] = b.value[j] - a.value[i] - duracion;
            console.log(`🔵 Holgura (${i} → ${j}): ${holguras.value[i][j]}`);
          }
        }
      }
      console.log("✅ Matriz de holguras calculada:", holguras.value);
    }
    function resolver() {
      try {
        if (graphStore.nodes.length === 0) {
          console.log("No hay nodos para procesar");
          return;
        }

        console.log("Iniciando cálculo de tiempos más tempranos (A)");
        llenarA();

        console.log("Iniciando cálculo de tiempos más tardíos (B)");
        llenarB();

        console.log("Calculando holguras");
        calcularH();
      } catch (error) {
        console.error("Error en resolver:", error);
      }
    }
    function createGraph() {
  if (!graphContainer.value) {
    console.error("⚠️ ERROR: `graphContainer` es null. No se puede crear el grafo.");
    return;
  }

  // Validar que no existan ciclos bidireccionales
  const adjacencyMatrix = graphStore.adjacencyMatrix.value;
  let hasBidirectionalConnections = false;

  for (let i = 0; i < graphStore.nodes.get().length; i++) {
    for (let j = 0; j < graphStore.nodes.get().length; j++) {
      // Si existe una conexión de i a j y también de j a i, entonces es bidireccional
      if (i !== j && adjacencyMatrix[i] && adjacencyMatrix[j] &&
          adjacencyMatrix[i][j] > 0 && adjacencyMatrix[j][i] > 0) {
        hasBidirectionalConnections = true;
        console.error(`⚠️ Conexión bidireccional detectada entre los nodos ${graphStore.nodes.get()[i].label} y ${graphStore.nodes.get()[j].label}`);

        // Mostrar los detalles de la conexión bidireccional para debug
        console.error(`   ${graphStore.nodes.get()[i].label} → ${graphStore.nodes.get()[j].label}: ${adjacencyMatrix[i][j]}`);
        console.error(`   ${graphStore.nodes.get()[j].label} → ${graphStore.nodes.get()[i].label}: ${adjacencyMatrix[j][i]}`);
      }
    }
  }

  if (hasBidirectionalConnections) {
    // Mostrar alerta y detener la creación del grafo
    alert("Grafo no solucionable: Se detectaron conexiones bidireccionales entre nodos. Un camino crítico no puede contener ciclos.");
    console.error("❌ Creación del grafo cancelada debido a conexiones bidireccionales.");
    return;
  }

  console.log("📊 Iniciando creación de grafo...");

  // Inicializamos DataSets vacíos
  const nodes = new DataSet();
  const edges = new DataSet();

  // Preparamos los datos de nodos
  const nodesData = graphStore.nodes.get().map((node, index) => {
    const isCritical = a.value[index] === b.value[index];
    return {
      id: node.id,
      label: `${node.label}\n------------\n${a.value[index] ?? "?"} ┃ ${b.value[index] ?? "?"}`,
      shape: "circle",
      size: 30,
      color: {
        background: isCritical ? "#27ae60" : "#e74c3c",
        border: "#ffffff",
        highlight: { background: "#2ecc71", border: "#ffffff" },
        hover: { background: "#c0392b", border: "#ffffff" },
      },
      font: { size: 20, color: "#2c3e50", face: "Arial", bold: true },
      borderWidth: 4,
      shadow: {
        enabled: true,
        color: "rgba(0, 0, 0, 0.4)",
        size: 10,
        x: 3,
        y: 3,
      },
      physics: true,
      fixed: false,
      x: node.x ?? 0,
      y: node.y ?? 0,
    };
  });

  // Preparamos los datos de aristas
  const edgesData = [];
  for (let i = 0; i < graphStore.nodes.get().length; i++) {
    for (let j = 0; j < graphStore.nodes.get().length; j++) {
      if (adjacencyMatrix[i] && adjacencyMatrix[i][j] > 0) {
        const holgura = holguras.value[i]?.[j] ?? "∞";
        const isCriticalEdge = holgura === 0;
        edgesData.push({
          from: graphStore.nodes.get()[i].id,
          to: graphStore.nodes.get()[j].id,
          label: `${adjacencyMatrix[i][j]}\nH: ${holgura}`,
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.6
            }
          },
          color: { color: isCriticalEdge ? "#27ae60" : "#e74c3c" },
          font: { size: 16, color: "#2c3e50", align: "top" },
          width: isCriticalEdge ? 5 : 3,
          smooth: { enabled: true, type: "dynamic" },
          dashes: isCriticalEdge ? false : [5, 5],
        });
      }
    }
  }

  // Opciones del grafo
  const options = {
    nodes: {
      shape: "dot",
      size: 35,
      borderWidth: 3,
      font: { size: 20, color: "#2c3e50" },
    },
    edges: {
      arrows: "to",
      smooth: { type: "continuous" },
    },
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -2200,
        centralGravity: 0.15,
        springLength: 210,
        springConstant: 0.03,
        damping: 0.08,
      },
      stabilization: {
        enabled: true,
        iterations: 200
      }
    },
    interaction: {
      hover: true,
      dragNodes: true,
      zoomView: true,
      tooltipDelay: 200,
    },
    layout: {
      improvedLayout: true,
    },
  };

  // Destruir la red si ya existe
  if (network) network.destroy();

  // Crear la red con DataSets vacíos
  network = new Network(graphContainer.value, { nodes, edges }, options);
  console.log("🔄 Red inicializada, comenzando animación...");

  // Función para añadir nodos con animación
  function addNodesWithAnimation(index) {
    if (index < nodesData.length) {
      // Preparar el nodo con propiedades de animación iniciales
      const nodeData = {...nodesData[index]};

      // Propiedades para animación de entrada
      nodeData.opacity = 0;
      nodeData.size = 10; // Tamaño inicial pequeño

      // Añadir el nodo con propiedades iniciales
      nodes.add(nodeData);
      console.log(`🔵 Nodo ${index + 1}/${nodesData.length} añadido:`, nodeData.label);

      const nodeId = nodeData.id;
      const originalSize = nodesData[index].size;

      // Primera fase - aparecer con opacidad
      setTimeout(() => {
        nodes.update({
          id: nodeId,
          opacity: 0.7,
          size: 20 // Tamaño intermedio
        });

        // Segunda fase - crecer hasta tamaño completo
        setTimeout(() => {
          nodes.update({
            id: nodeId,
            opacity: 1,
            size: originalSize
          });

          // Programar la adición del siguiente nodo
          setTimeout(() => {
            addNodesWithAnimation(index + 1);
          }, 80); // Ajustado para un mejor ritmo visual

        }, 150);
      }, 80);

    } else {
      // Todos los nodos han sido añadidos, ahora añadir las aristas
      console.log("👉 Todos los nodos añadidos. Añadiendo aristas...");
      addEdgesSequentially(0);
    }
  }

  // Función para añadir aristas secuencialmente
  function addEdgesSequentially(index) {
    if (index < edgesData.length) {
      // Añadir una arista
      edges.add(edgesData[index]);
      console.log(`➡️ Arista ${index + 1}/${edgesData.length} añadida`);

      // Programar la adición de la siguiente arista
      setTimeout(() => {
        addEdgesSequentially(index + 1);
      }, 300); // Tiempo entre aristas
    } else {
      // Todas las aristas han sido añadidas
      console.log("✅ Grafo generado con éxito.");

      // Centrar la vista
      setTimeout(() => {
        network.fit();
      }, 500);
    }
  }

  // Comenzar la animación después de una breve pausa para permitir la inicialización
  setTimeout(() => {
    addNodesWithAnimation(0);
  }, 1000);
}

    onMounted(() => {
  console.log("✅ Nodos antes de crear el grafo:", graphStore.nodes.get());
  console.log("✅ Aristas antes de crear el grafo:", graphStore.edges.get());

  if (graphStore.nodes.get().length === 0) {
    console.error("⚠️ ERROR: No hay nodos para mostrar en el grafo.");
    alert("⚠️ No hay nodos en el grafo.");
    return;
  }
  if (graphStore.edges.get().length === 0) {
    console.error("⚠️ ERROR: No hay aristas para mostrar en el grafo.");
    alert("⚠️ No hay aristas en el grafo.");
    return;
  }

  resolver();
  createGraph();
});


    return { graphContainer };
  },
};
</script>

<style>
.graph-wrapper {
  padding: 20px;
  background: #ecf0f1;
  border-radius: 12px;
}
.graph-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}
.graph-container {
  width: 100%;
  height: 600px;
  border: 2px solid #bdc3c7;
  border-radius: 12px;
  background-color: #ffffff;
}
.graph-legend {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
}
.legend-color {
  width: 20px;
  height: 20px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
