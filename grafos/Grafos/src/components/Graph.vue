 <!-- 12/02 Osorio -->

<template>
  <div class="container">
    <transition name="fade" appear>
      <div v-if="showIntro" class="intro">
        <img src="https://i0.wp.com/lpz.ucb.edu.bo/wp-content/uploads/2024/05/UCB-Ereccion-Canonica_Escudo-01.png?resize=1080%2C1450&ssl=1" class="logo" alt="UCB Logo" />
        <h1 class="ucb-name">{{ typedUCB }}</h1>
        <h2 class="full-name">{{ typedFullName }}</h2>
      </div>
    </transition>

    <!-- Canvas -->
    <div id="graph" class="graph"></div>

    <!-- Ociones -->
    <div class="controls">
      <!-- Contenedor de Opciones -->
      <div class="button-container">
        <button @click="clearGraph" class="btn">Limpiar todo</button>
        <button @click="generateAdjacencyMatrix" class="btn">Matriz Adyacente</button>
        <button @click="showHelp" class="btn">Ayuda</button>
      </div>

      <!-- Matriz -->
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
              <td>{{ nodes[index]?.label}}</td> <!-- añade la columna por nodo ;D -->
              <td v-for="(value,colIndex) in row" :key="colIndex">
                <span>{{ value!== 0 ? value : '' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Boton de Ayuda -->
      <div v-if="helpVisible" class="help-modal">
        <h2>Ayuda</h2>
        <ul>
          <li><strong>Editar:</strong> Abre las opciones para ingresar datos al gráfico.</li>
          <li><strong>Añadir nodo:</strong> Crea un nodo nuevo en el gráfico y te permite ingresar un nombre y seleccionar un color.</li>
          <li><strong>Añadir arista:</strong> Crea un arco dirigido entre dos nodos seleccionados y solicita el peso del arco.</li>
          <li><strong>Eliminar:</strong> Permite eliminar nodos o arcos seleccionados del gráfico.</li>
          <li><strong>Manipulation Toolbar:</strong> La barra de herramientas de manipulación permite interactuar con el gráfico de manera más dinámica:
        <ul>
          <li><strong>Limpiar todo:</strong> Elimina todos los nodos, arcos y la matriz de adyacencia, dejando el gráfico vacío.</li>
        <li><strong>Mover nodos:</strong> Permite mover los nodos dentro del área de visualización para una mejor organización del gráfico.</li>
        <li><strong>Seleccionar nodos:</strong> Permite seleccionar nodos en el gráfico para editarlos o eliminarlos.</li>
        <li><strong>Matriz Adyacente:</strong> Muestra la matriz de adyacencia que representa las conexiones entre los nodos del gráfico, indicando si existe una arista entre dos nodos y su peso.</li>
        </ul>
        </li>
        </ul>

        <button @click="showHelp" class="close-btn">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Network } from "vis-network/standalone";
import gsap from "gsap";

export default {
  data() {
    return {

      showIntro: true,
      showLogin: false,
      typedUCB: "",
      typedFullName: "",
      ucbText: "UCB",
      fullNameText : "Analisis de algoritmos",
  


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
    this.animateIntro();
    this.createNetwork();
  },
  methods: {

    async animateIntro() {
      gsap.from(".logo", { opacity: 0, scale: 0.8, duration: 1.5, ease: "power4.out" });
      await this.typeText("ucbText", "typedUCB", 150);
      gsap.to(".ucb-name", { textShadow: "0px 0px 0px #ffd700", duration: 0.8 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.typeText("fullNameText", "typedFullName", 100);
      setTimeout(() => {
        gsap.to(".intro", {
          opacity: 0,
          scale: 0.9,
          duration: 1.5,
          ease: "power3.inOut",
          onComplete: () => {
            this.showIntro = false;
            this.showLogin = true;
          },
        });
      }, 2000);
    },
    async typeText(sourceKey, targetKey, delay) {
      for (let i = 0; i < this[sourceKey].length; i++) {
        this[targetKey] += this[sourceKey][i];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    },
    transitionToRegisterPage() {
      gsap.to(".graph", {
        opacity: 0,
        scale: 0.9,
        duration: 1.5,
        ease: "power3.inOut",
      });
    },

    createNetwork() {
      const options = {
        interaction: {
          hover: true,
        },
        edges: {
          arrows: { to: true }, 
      font: { align: "top" },
        },
        manipulation: {
          enabled: true,
          addNode: this.addNode,
          addEdge: this.addEdge,
          editNode: (data, callback) => {
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
  const title = document.createElement("h3");
  title.innerText = "Selecciona un color";
  title.style.color = "black";
  modal.appendChild(title);
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = data.color || "#ff0000";
  colorPicker.style.margin = "10px";
  modal.appendChild(colorPicker);
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
  modal.appendChild(saveButton);
  modal.appendChild(cancelButton);
  document.body.appendChild(modal);
},

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
    generateAdjacencyMatrix() {
      this.updateAdjacencyMatrix();
      this.matrixVisible = true; 
    },
    updateAdjacencyMatrix() {
  const size = this.nodes.length;
  this.adjacencyMatrix = [];

  for (let i = 0; i <= size; i++) {
    const row = new Array(size + 1).fill(0);
    this.adjacencyMatrix.push(row);
  }

this.edges.forEach(edge => {
  const fromIndex = this.nodes.findIndex(node => node.id === edge.from);
  const toIndex = this.nodes.findIndex(node => node.id === edge.to);
  if (fromIndex !== -1 && toIndex !== -1) {
    this.adjacencyMatrix[fromIndex][toIndex] = parseFloat(edge.label); 
  }
});

  for (let i = 0; i < size; i++) {
    let rowSum = 0;
    let colSum = 0;

    for (let j = 0; j < size; j++) {
      rowSum += this.adjacencyMatrix[i][j]; 
      colSum += this.adjacencyMatrix[j][i]; 
    }

    this.adjacencyMatrix[i][size] = rowSum;
    this.adjacencyMatrix[size][i] = colSum;
  }

  this.adjacencyMatrix[size][size] = this.adjacencyMatrix[size].reduce((acc, val) => acc + val, 0);
}

,
    showHelp() {
      this.helpVisible = !this.helpVisible;
    }
  },
};
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Lora:wght@400;500&display=swap');


.intro {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); 
  height: 100%;
}

/* 🔹 Logo */
.logo {
  width: 30vw;  
  max-width: 200px;  
  margin-bottom: 10px;
}

.ucb-name {
  font-size: 3vw; 
  font-family: 'Poppins', sans-serif;  
  font-weight: 800; 
  background: linear-gradient(to right, #1e3c72 0%, #00aaff 40%, #ffc107 100%); 
  -webkit-background-clip: text; 
  color: transparent;  
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, text-shadow 0.3s ease;
}

.ucb-name:hover {
  transform: scale(1.1); 
  text-shadow: 4px 4px 10px rgba(0, 0, 0, 0.6);
}


.full-name {
  font-size: 2.5vw; 
  color: #37474f;
  margin: 0;
}


.container {
  display: flex;
  justify-content: space-between;
}

.graph {
  width: 60%;
  height: 600px;
  border: 2px solid #444;
  background-color: #f0f0f0;
}

.controls {
  width: 35%;
  padding: 20px;background-color: #3b8acc;

}

.button-container {
  margin-bottom: 20px;
}

button {
  width: 100%;
  padding: 10px;
  margin: 5px;
  background-color: #5c9ded;
  border: none;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #3b8acc;
}

.matrix {
  margin-top: 20px;
}

.matrix table {
  width: 100%;
  border-collapse: collapse;
}

.matrix th, .matrix td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ccc;
}

.help-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

.close-btn {
  background-color: red;
  padding: 10px;
  border: none;
  color: white;
  cursor: pointer;
}

.close-btn:hover {
  background-color: darkred;
}
</style>
