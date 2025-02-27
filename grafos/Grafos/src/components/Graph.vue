<template>
  <div class="whole">
    <div class="optionsMenu">
      <button @click="startNodeCreation">Añadir Nodo</button>
      <button @click="clearGraph">Eliminar Todo</button>
      <button @click="exportGraph">Exportar Grafo</button>
      <button @click="importGraph">Importar Grafo</button>
      <button @click="editNode">Editar Nodo</button>
      <button @click="startEdgeCreation">Añadir Arista</button>
      <input type="file" @change="handleFileImport" />
      <button @click="editEdge">Editar Arista</button>
      <button @click="deleteSelectedNode">Eliminar Nodo</button>
      <button @click="deleteSelectedEdge">Eliminar Arista</button>
      <button @click="calculateAdjacencyMatrix">Mostrar Matriz de Adyacencia</button>
    </div>
    <div class="lienzo">
      <div ref="container" class="graph"></div>
      <div v-if="matrixVisible" class="matrix-container">
      <h2>Matriz de Adyacencia</h2>
      <table class="adjacency-matrix">
        <tr>
          <th></th>
          <th v-for="node in nodeList" :key="node">{{ node }}</th>
        </tr>
        <tr v-for="(row, index) in adjacencyMatrix" :key="index">
          <th>{{ nodeList[index] }}</th>
          <td v-for="(value, j) in row" :key="j">{{ value }}</td>
        </tr>
      </table>
    </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { DataSet, Network } from "vis-network/standalone";

export default {
  setup() {
    const container = ref(null);
    let network = null;
    let nodes = new DataSet([]);
    let edges = new DataSet([]);
    let selectedNode = ref(null);
    let edgeStartNode = null;
    let creatingEdge = false;
    let waitingForNodeClick = false; 
    let adjacencyMatrix = ref([]);
    let matrixVisible = ref(false);
    let nodeList = ref([]);

    onMounted(() => {
      const data = { nodes, edges };
      const options = {
        nodes: {
          shape: "circle",
          color: "blue",
          font: { size: 16, background: "white" },
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
              alert("Seleccione el nodo destino para la arista");
            }
          } else {
            if (params.nodes.length > 0) {
              const weight = prompt("Ingrese el peso de la arista:", "1");
              if (weight !== null) {
                edges.add({ from: edgeStartNode, to: params.nodes[0], label: weight, arrows: "to" });
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
      alert("Haga clic en el área del grafo donde quiere agregar el nodo.");
    };

    const addNodeAtClick = (params) => {
      if (!waitingForNodeClick) return;
      waitingForNodeClick = false;

      const { x, y } = network.DOMtoCanvas({ x: params.pointer.DOM.x, y: params.pointer.DOM.y });
      const label = prompt("Ingrese la etiqueta del nodo:", `Nodo ${nodes.length + 1}`);
      if (!label) return;

      nodes.add({
        id: nodes.length + 1,
        label,
        color: "blue",
        x,
        y,
      });
    };

    const clearGraph = () => {
      nodes.clear();
      edges.clear();
    };

    const exportGraph = () => {
      const graphData = {
        nodes: nodes.get(),
        edges: edges.get(),
      };
      const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graph.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const importGraph = (fileContent) => {
      try {
        const graphData = JSON.parse(fileContent);
        nodes.clear();
        edges.clear();
        nodes.add(graphData.nodes);
        edges.add(graphData.edges);
      } catch (error) {
        console.error("Error importing graph: ", error);
      }
    };

    const handleFileImport = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          importGraph(e.target.result);
        };
        reader.readAsText(file);
      }
    };

    const editNode = () => {
      if (!selectedNode.value || !nodes.get(selectedNode.value)) {
        alert("Seleccione un nodo para editar");
        return;
      }
      const newLabel = prompt("Ingrese la nueva etiqueta:", nodes.get(selectedNode.value).label);
      const newColor = prompt("Ingrese el nuevo color:", nodes.get(selectedNode.value).color);
      nodes.update({ id: selectedNode.value, label: newLabel, color: newColor });
    };

    const startEdgeCreation = () => {
      if (!selectedNode.value) {
        alert("Seleccione un nodo de inicio para la arista");
        return;
      }
      creatingEdge = true;
      edgeStartNode = null;
      alert("Haga clic en un nodo para iniciar la arista y luego en otro para conectarlo");
    };

    const editEdge = () => {
      const selectedEdges = network.getSelectedEdges();
      if (selectedEdges.length === 0) {
        alert("Seleccione una arista para editar");
        return;
      }
      const edgeId = selectedEdges[0];
      const currentEdge = edges.get(edgeId);
      const newWeight = prompt("Ingrese el nuevo peso de la arista:", currentEdge.label);
      
      if (newWeight !== null) {
        edges.update({ id: edgeId, label: newWeight });
      }
    };

    const deleteSelectedNode = () => {
      if (!selectedNode.value || !nodes.get(selectedNode.value)) {
        alert("Seleccione un nodo para eliminar");
        return;
      }

      edges.remove(edges.get({ filter: (edge) => edge.from === selectedNode.value || edge.to === selectedNode.value }));
      nodes.remove(selectedNode.value);
      selectedNode.value = null;
    };

    const calculateAdjacencyMatrix = () => {
      const nodeArray = nodes.get();
      const edgeArray = edges.get();
      nodeList.value = nodeArray.map((n) => n.label); // Usar labels en lugar de IDs
      const size = nodeList.value.length;
      let matrix = Array.from({ length: size }, () => Array(size).fill(0));
      
      edgeArray.forEach(edge => {
        const fromIndex = nodeList.value.indexOf(nodeArray.find(n => n.id === edge.from)?.label);
        const toIndex = nodeList.value.indexOf(nodeArray.find(n => n.id === edge.to)?.label);
        if (fromIndex !== -1 && toIndex !== -1) {
          matrix[fromIndex][toIndex] = parseInt(edge.label, 10) || 1;
        }
      });
      
      adjacencyMatrix.value = matrix;
      matrixVisible.value = true;
    };
    const deleteSelectedEdge = () => {
      const selectedEdges = network.getSelectedEdges();
      if (selectedEdges.length === 0) {
        alert("Seleccione una arista para eliminar");
        return;
      }
      
      edges.remove(selectedEdges);
    };

    return { 
      container, startNodeCreation, clearGraph, exportGraph, importGraph, 
      handleFileImport, editNode, startEdgeCreation, editEdge, deleteSelectedNode, deleteSelectedEdge,
      calculateAdjacencyMatrix, adjacencyMatrix, matrixVisible, nodeList
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
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: antiquewhite;
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
