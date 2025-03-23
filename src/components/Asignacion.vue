<template>
    <div class="whole">
      <div class="optionsMenu">
        <v-btn variant="tonal" @click="triggerAddNode">Añadir Nodo</v-btn>
        <v-btn variant="tonal" @click="triggerAddEdge">Añadir Arista</v-btn>
        <v-btn variant="tonal" @click="editNode">Editar Nodo</v-btn>
        <v-btn variant="tonal" @click="editEdge">Editar Arista</v-btn>
        <v-btn variant="tonal" @click="generateAdjacencyMatrix">Matriz</v-btn>
        <v-btn variant="tonal" @click="remove">Eliminar</v-btn>
        <v-btn variant="tonal" @click="clearGraph">Eliminar Todo</v-btn>
        <input type="file" @change="importGraph" class="v-btn" />
        <v-btn variant="tonal" @click="exportGraph">Exportar</v-btn>
  
        </div>
      <div class="lienzo">
        <div id="graph" class="graph"></div>
        <div v-if="matrixVisible" class="matrix">
        <h3>Matriz Adyacente</h3>
        <table>
          <thead>
            <tr>
                  <th></th>
                  <th v-for="(node, index) in nodes" :key="index">{{ node.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in adjacencyMatrix" :key="index">
                  <td>{{ nodes[index]?.label}}</td> 
                  <td v-for="(value, colIndex) in row" :key="colIndex">
    <span>{{ value }}</span>
  </td>
  
  
                </tr>
              </tbody>
            </table>
          </div>
   
      </div>
    </div>
  </template>
  
  <script lang="js">
  import { Network } from "vis-network/standalone";
  
  export default {
    data() {
      return {
        nodes: [],
        edges: [],
        adjacencyMatrix: [],
        matrixVisible: false,
        helpVisible: false,
        network: null,
        nodeColor: "#ff0000", 
      };
    },
    mounted() {
      this.createNetwork();
    },
    methods: {
      exportGraph() {
      const graphData = {
        nodes: this.nodes,
        edges: this.edges,
      };
      const json = JSON.stringify(graphData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "grafo.json";
      link.click();
      URL.revokeObjectURL(url);
    },
  
    importGraph(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const graphData = JSON.parse(e.target.result);
            this.nodes = graphData.nodes || [];
            this.edges = graphData.edges || [];
            this.updateAdjacencyMatrix();
            this.updateNetwork();
          } catch (error) {
            alert("El archivo no es un JSON válido.");
          }
        };
        reader.readAsText(file);
      }},
      createNetwork() {
        const options = {
          interaction: {
            hover: true,
          },
          physics: {
            enabled: false,
            stabilization: { iterations: 100 }, // Número de iteraciones para estabilización
          },
          edges: {
            arrows: { to: true }, 
            font: { align: "top" },
          },
          manipulation: {
            enabled: true,
            addNode: this.addNode,
            addEdge: this.addEdge,
            editNode: this.editNode,
            deleteNode: (data, callback) => {
          const nodeId = data.nodes[0]; 
          this.nodes = this.nodes.filter(node => node.id !== nodeId);
          this.edges = this.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
          this.updateAdjacencyMatrix();
          callback(data);
        },
        deleteEdge: (data, callback) => {
          const edgeId = data.edges[0]; 
          this.edges = this.edges.filter(edge => edge.id !== edgeId);
          this.updateAdjacencyMatrix();
          callback(data);
        },
          },
        };
        const container = document.getElementById("graph");
        this.network = new Network(container, { nodes: this.nodes, edges: this.edges }, options);
      },
      
    addNode(data, callback) {
    const name = prompt("Ingresa el nombre del nodo:");
    if (name) {
      const nodeExists = this.nodes.some(node => node.label === name);
      
      if (nodeExists) {
        alert("Ya existe un nodo con ese nombre. Por favor, elige otro.");
        return;e
      }
      data.label = name;
      data.color = this.nodeColor;
      this.nodes.push(data); 
      callback(data); 
      this.updateAdjacencyMatrix();
    }
  },
  
  editNode(data, callback){
                const modal = document.createElement("div");
                modal.style.position = "fixed";
                modal.style.top = "50%";
                modal.style.left = "50%";
                modal.style.transform = "translate(-50%, -50%)";
                modal.style.background = "#fff";
                modal.style.padding = "20px";
            modal.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.2)";
            modal.style.borderRadius = "8px";
            modal.style.zIndex = "1000";
            modal.style.textAlign = "center";
  
            // Título del modal
            const title = document.createElement("h3");
            title.innerText = "Selecciona un color";
            title.style.color = "black";
            modal.appendChild(title);
  
            // Selector de color
            const colorPicker = document.createElement("input");
            colorPicker.type = "color";
            colorPicker.value = data.color || "#ff0000";
            colorPicker.style.margin = "10px";
            modal.appendChild(colorPicker);
  
            // Botón Guardar
            const saveButton = document.createElement("button");
            saveButton.innerText = "Guardar";
            saveButton.style.margin = "5px";
            saveButton.style.padding = "8px 12px";
            saveButton.style.border = "none";
            saveButton.style.background = "#4CAF50";
            saveButton.style.color = "white";
            saveButton.style.borderRadius = "5px";
            saveButton.style.cursor = "pointer";
  
            saveButton.addEventListener("click", () => {
                data.color = colorPicker.value;
                document.body.removeChild(modal);
                callback(data);
            });
  
            // Botón Cancelar
            const cancelButton = document.createElement("button");
            cancelButton.innerText = "Cancelar";
            cancelButton.style.margin = "5px";
            cancelButton.style.padding = "8px 12px";
            cancelButton.style.border = "none";
            cancelButton.style.background = "#f44336";
            cancelButton.style.color = "white";
            cancelButton.style.borderRadius = "5px";
            cancelButton.style.cursor = "pointer";
  
            cancelButton.addEventListener("click", () => {
                document.body.removeChild(modal);
                callback(data);
            });
  
            // Agregar botones al modal
            modal.appendChild(saveButton);
            modal.appendChild(cancelButton);
  
            // Mostrar el modal en la página
            document.body.appendChild(modal);
          },
  
  addEdge(data, callback) {
        const weight = prompt("Ingresa el peso:");
        if (weight) {
      const numericWeight = parseFloat(weight);
  
      if (isNaN(numericWeight) || numericWeight <= 0) {
        alert("Por favor, ingresa un número positivo para el peso.");
        return; 
      }
        if (weight) {
          data.label = weight;
          this.edges.push(data); 
          this.updateAdjacencyMatrix();
          callback(data);
        }
      }
      },
  
      updateNetwork() {
        if (this.network) {
          this.network.destroy();
        }
        this.createNetwork();
      },
      clearGraph() {
    this.nodes = [];
    this.edges = [];
    this.adjacencyMatrix = [];
    this.matrixVisible = false; 
  
    if (this.network) {
      this.network.destroy(); 
      this.network = null; 
    }
    const container = document.getElementById("graph");
    container.innerHTML = ""; 
    this.createNetwork();
  }
  ,
  triggerAddNode() {
  if (this.network && this.network.manipulation) {
    this.network.manipulation.addNodeMode(); // Activa directamente el modo de añadir nodo
  }
  }
  
  ,
  triggerAddEdge() {
  if (this.network && this.network.manipulation) {
    this.network.manipulation.addEdgeMode(); // Activa el modo de añadir arista
  }
  }
  ,
  triggerEditNode() {
    if (this.network && this.network.manipulation) {
    this.network.manipulation.addEdgeMode(); // Activa el modo de añadir arista
  }
  }
  ,
  
    triggerEditEdge() {
      // You can implement the behavior for editing edges, depending on your UI needs
      alert("Edit edge clicked");
    },
  
    triggerGenerateAdjacencyMatrix() {
      this.updateAdjacencyMatrix();
      this.matrixVisible = true; // Show the adjacency matrix after generation
    },
  
    triggerRemove() {
      // Implement functionality to remove nodes or edges
      alert("Remove clicked");
    },
  
    triggerClearAll() {
      this.clearGraph(); // Clears all nodes and edges
    },
  
      generateAdjacencyMatrix() {
        this.updateAdjacencyMatrix();
        this.matrixVisible = true; 
      },
      updateAdjacencyMatrix() {
    const size = this.nodes.length;
    this.adjacencyMatrix = [];
  
    // Inicializa la matriz de adyacencia con ceros
    for (let i = 0; i < size; i++) {
      const row = new Array(size).fill(0);
      this.adjacencyMatrix.push(row);
    }
  
    // Actualiza la matriz con las conexiones
    this.edges.forEach(edge => {
      const fromIndex = this.nodes.findIndex(node => node.id === edge.from);
      const toIndex = this.nodes.findIndex(node => node.id === edge.to);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        // Asigna el valor de la conexión en la matriz
        this.adjacencyMatrix[fromIndex][toIndex] = parseFloat(edge.label);
      }
    });
  
    // Calcula las sumas por fila y columna
    for (let i = 0; i < size; i++) {
      let rowSum = 0;
      let colSum = 0;
  
      for (let j = 0; j < size; j++) {
        rowSum += this.adjacencyMatrix[i][j];  // Suma de cada fila
        colSum += this.adjacencyMatrix[j][i];  // Suma de cada columna
      }
  
      // Se asignan las sumas de filas y columnas en la última columna/fila
      this.adjacencyMatrix[i][size] = rowSum;
      this.adjacencyMatrix[size] = this.adjacencyMatrix[size] || [];
      this.adjacencyMatrix[size][i] = colSum;
    }
  
    // Suma total de la última celda (suma de todas las conexiones)
    this.adjacencyMatrix[size] = this.adjacencyMatrix[size] || [];
    this.adjacencyMatrix[size][size] = this.adjacencyMatrix[size].reduce((acc, val) => acc + val, 0);
  }
  
  
  ,
      showHelp() {
        this.helpVisible = !this.helpVisible;
      }
    },
  };
  
  
  </script>
  
  
  <style>
  .whole {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgb(255, 255, 255);
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
  }
  
  .matrix {
    font-family: 'Arial', sans-serif;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 80%;
  }
  
  h3 {
    text-align: center;
    color: #4A90E2;
    font-size: 24px;
    margin-bottom: 15px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  th, td {
    padding: 12px;
    text-align: center;
    border: 1px solid #ddd;
    font-size: 16px;
  }
  
  th {
    background-color: #4A90E2;
    color: white;
    font-weight: bold;
  }
  
  td {
    background-color: #f1f1f1;
    color: #333;
  }
  
  td span {
    font-weight: bold;
  }
  
  td:not(:first-child) {
    background-color: #e0e0e0;
  }
  
  tbody tr:hover {
    background-color: #e9f7fb;
  }
  
  @media (max-width: 768px) {
    .matrix {
      width: 95%;
      padding: 15px;
    }
  
    table {
      font-size: 14px;
    }
  
    th, td {
      padding: 8px;
    }
  }
  
  </style>
  