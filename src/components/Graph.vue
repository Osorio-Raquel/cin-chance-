<template>
  <div class="whole">
    <div class="optionsMenu">
      <v-btn variant="tonal" @click="startNodeCreation">Añadir Nodo</v-btn>
      <v-btn variant="tonal" @click="startEdgeCreation">Añadir Arista</v-btn>
      <v-btn variant="tonal" @click="editNode">Editar Nodo</v-btn>
      <v-btn variant="tonal" @click="editEdge">Editar Arista</v-btn>
      <v-btn variant="tonal" @click="clearGraph">Eliminar Todo</v-btn>
      <v-btn variant="tonal" @click="deleteSelectedNode">Eliminar Nodo</v-btn>
      <v-btn variant="tonal" @click="deleteSelectedEdge">Eliminar Arista</v-btn>
      <v-btn variant="tonal" @click="matrixVisible=true">Mostrar Matriz de Adyacencia</v-btn>
      <v-btn variant="tonal" @click="exportGraph">Exportar Grafo</v-btn>
      <v-btn variant="tonal" @click="importGraph">Importar Grafo</v-btn>
      <input type="file" @change="handleFileImport" />
    </div>

    <div class="lienzo">
      <div ref="container" class="graph"></div>
      <div v-if="matrixVisible" class="matrix-container">
        <h2>Matriz de Adyacencia</h2>
        <table class="adjacency-matrix">
          <thead>
            <tr>
              <th></th>
              <th v-for="node in nodeList" :key="node">{{ node }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in adjacencyMatrix" :key="index">
              <th>{{ nodeList[index] }}</th>
              <td v-for="(value, j) in row" :key="j">{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref,computed,watch } from "vue";
import { Network } from "vis-network/standalone";
import { useGraphStore } from "../stores/graphStores";

export default{
  setup() {
    const container = ref(null);


const adjacencyMatrix = computed(() => graphStore.adjacencyMatrix.value);

let network =null;

    let edgeStartNode= null;
    let creatingEdge = false;
    let waitingForNodeClick = false;
    const helpVisible = ref(false);
    let nodeList=ref([]);
    const selectedNode = ref(null);
    const matrixVisible = ref(false);

    // Usar el store de Pinia
    const graphStore = useGraphStore();
    watch(() => graphStore.nodes.get(), () => {
  calculateAdjacencyMatrix();
});

watch(() => graphStore.edges.get(), () => {
  calculateAdjacencyMatrix();
});
    onMounted(() => {

      const data = {
        nodes: graphStore.nodes,
        edges: graphStore.edges,
      };

      const options = {
        nodes: {
          shape: "circle",
          color: "blue",
          font: { size: 16},
          physics: false,
        },
        edges: {
          arrows: "to",
          smooth: { type: "dynamic" },
          physics: true,
        },
        physics: {
          enabled: true,
          solver: "barnesHut",
        },
      };

      network = new Network(container.value, data, options);

      network.on("click", (params) => {
        if (creatingEdge) {
          if (!edgeStartNode) {
            if (params.nodes.length > 0) {
              edgeStartNode = params.nodes[0];
            }
          } else {
            if (params.nodes.length > 0) {
              const weight = prompt("Ingrese el peso de la arista:", "1");
              if (weight !== null) {
  const targetNode = params.nodes[0];

  if (edgeStartNode === targetNode) {
    alert("No se puede crear una arista que conecte el nodo consigo mismo.");
    return;
  }

  // Verificar si ya existe una arista inversa
  const existingEdges = graphStore.edges.get();
  const reverseEdgeExists = existingEdges.some(edge =>
    edge.from === targetNode && edge.to === edgeStartNode
  );

  if (reverseEdgeExists) {
    alert("Ya existe una arista en dirección contraria. No se puede crear una arista bidireccional para jhonson.");
    return;
  }

  graphStore.edges.add({
    from: edgeStartNode,
    to: targetNode,
    label: weight,
    arrows: "to",
  });
}

              edgeStartNode = null;
              creatingEdge = false;
            }
          }
        } else if (waitingForNodeClick) {
          addNodeAtClick(params);
        } else if (params.nodes.length > 0) {
          selectedNode.value = params.nodes[0];
        }
      });
    });

    const startNodeCreation = () => {
      waitingForNodeClick = true;
    };

    const addNodeAtClick = (params) => {
      if (!waitingForNodeClick ) return;
      waitingForNodeClick = false;

      const { x, y } = network.DOMtoCanvas({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
      const label = prompt("Ingrese la etiqueta del nodo:", `Nodo ${graphStore.nodes.getIds().length + 1}`);

      if (!label) return;

      graphStore.nodes.add({
        id: graphStore.nodes.length + 1,
        label,
        color: "blue",
        x,
        y,
      });
    };

    const clearGraph = () => {
      graphStore.nodes.clear();
      graphStore.edges.clear();
    };

    const editNode = () => {
      if (!network) return;

      const selectedNodes = network.getSelectedNodes();
      if (selectedNodes.length === 0) {
        alert("Seleccione un nodo para editar");
        return;
      }

      const nodeId = selectedNodes[0];
      const currentNode = graphStore.nodes.get(nodeId);

      if (!currentNode) return;

      const newLabel = prompt("Ingrese la nueva etiqueta:", currentNode.label);
      const newColor = prompt("Ingrese el nuevo color:", currentNode.color || "blue");

      if (newLabel !== null && newColor !== null) {
        graphStore.nodes.update({
          id: nodeId,
          label: newLabel,
          color: newColor
        });
      }
    };

    const startEdgeCreation = () => {
      if (!network) return;

      const selectedNodes = network.getSelectedNodes();
      if (selectedNodes.length === 0) {
        alert("Seleccione un nodo de origen");
        return;
      }

      creatingEdge = true;
      edgeStartNode = selectedNodes[0];
    };

    const editEdge = () => {
      if (!network) return;

      const selectedEdges = network.getSelectedEdges();
      if (selectedEdges.length === 0) {
        alert("Seleccione una arista para editar");
        return;
      }

      const edgeId = selectedEdges[0];
      const currentEdge = graphStore.edges.get(edgeId);

      if (!currentEdge) return;

      const newWeight = prompt("Ingrese el nuevo peso de la arista:", currentEdge.label || "1");

      if (newWeight !== null) {
        graphStore.edges.update({ id: edgeId, label: newWeight });
      }
    };

    const deleteSelectedNode = () => {
      if (!network) return;

      const selectedNodes = network.getSelectedNodes();
      if (selectedNodes.length === 0) {
        alert("Seleccione un nodo para eliminar");
        return;
      }

      const nodeId = selectedNodes[0];

      // Eliminar aristas conectadas al nodo
      const connectedEdges = graphStore.edges.get({
        filter: edge => edge.from === nodeId || edge.to === nodeId
      });

      graphStore.edges.remove(connectedEdges.map(edge => edge.id ));

      // Eliminar el nodo
      graphStore.nodes.remove(nodeId);
    };

    const deleteSelectedEdge = () => {
  if (!network) return; // 👈 Verificar que `network` no sea null

  const selectedEdges = network.getSelectedEdges();
  if (selectedEdges.length === 0) {
    alert("Seleccione una arista para eliminar");
    return;
  }

  // Verifica si los IDs existen en `graphStore.edges`
  const existingEdges = graphStore.edges.get();
  const edgesToRemove = selectedEdges
    .map(id => existingEdges.find(edge => edge.id == id)) // Buscar el objeto en el DataSet
    .filter(edge => edge !== undefined); // Filtrar valores no encontrados

  if (edgesToRemove.length === 0) {
    alert("No se encontraron aristas con esos IDs.");
    return;
  }

  // Eliminar aristas del `DataSet`
  graphStore.edges.remove(edgesToRemove.map(edge => edge.id));

  console.log("Aristas eliminadas:", edgesToRemove);
};

    const calculateAdjacencyMatrix = () => {
      const nodeArray = graphStore.nodes.get();
      const edgeArray = graphStore.edges.get();
      nodeList.value = nodeArray.map(n => n.label);
      const size = nodeList.value.length;

      let matrix = Array.from({ length: size }, () => Array(size).fill(0));

      edgeArray.forEach(edge => {
        const fromIndex = nodeList.value.indexOf(nodeArray.find(n => n.id === edge.from)?.label);
        const toIndex = nodeList.value.indexOf(nodeArray.find(n => n.id === edge.to)?.label);
        if (fromIndex !== -1 && toIndex !== -1) {
          matrix[fromIndex][toIndex] = parseInt(edge.label, 10) || 1;
        }
      });


      graphStore.adjacencyMatrix.value = matrix;

    };

    const exportGraph = () => {
      const graphData = {
        nodes: graphStore.nodes.get(),
        edges: graphStore.edges.get()
      };

      const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const importGraph = (fileContent) => {
  try {
    const graphData = JSON.parse(fileContent);

    if (!graphData.nodes || !graphData.edges) {
      throw new Error("El archivo no contiene nodos o aristas válidas.");
    }

    // Limpiar el grafo antes de importar
    graphStore.nodes.clear();
    graphStore.edges.clear();

    // Asegurar que los datos tengan la estructura correcta antes de agregarlos
    const formattedNodes = graphData.nodes.map(node => ({
      id: node.id,
      label: node.label,
      color: node.color || "blue",
      x: node.x || undefined,
      y: node.y || undefined
    }));

    const formattedEdges = graphData.edges.map(edge => ({
      id: edge.id || `${edge.from}-${edge.to}`,
      from: edge.from,
      to: edge.to,
      label: edge.label || "",
      arrows: edge.arrows || "to"
    }));

    // Agregar nodos y aristas
    graphStore.nodes.add(formattedNodes);
    graphStore.edges.add(formattedEdges);

    console.log("Grafo importado correctamente.");
  } catch (error) {
    console.error("Error al importar el grafo:", error);
  }
};

    const handleFileImport = (event) => {



      const file =event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            importGraph(e.target.result);
          }
        };
        reader.readAsText(file);
      }
    };

    function showHelp() {
      helpVisible.value = !helpVisible.value;
    }

    return {
      container, startNodeCreation, clearGraph, exportGraph, importGraph,
      handleFileImport, editNode, startEdgeCreation, editEdge, deleteSelectedNode, deleteSelectedEdge,
      calculateAdjacencyMatrix, adjacencyMatrix, matrixVisible, nodeList, helpVisible, showHelp
    };
  },
};
</script>
<style>
.whole {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  width: 100vw;
  height: 100vh;
  margin-top: 64px;
}

.optionsMenu {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: rgb(154, 220, 232);
  width: 100vw;
  padding: 10px;
  gap: 10px;
}

.lienzo {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  padding: 20px;
}

.graph {
  width: 50vw;
  height: 80vh;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}
.matrix-container {
  text-align: center;
  margin-top: 20px;
}
.adjacency-matrix {
  border-collapse: collapse;
  margin: 0 auto;
}
.adjacency-matrix th, .adjacency-matrix td {
  border: 1px solid black;
  padding: 10px;
  text-align: center;
}
.adjacency-matrix th {
  background-color: #f8f9fa;
}
</style>
