class Grafo {
    grafo = {};
    nodos = [];
    
    
    agregarNodo = (nodo) => {
      this.grafo[nodo] = [];
      this.nodos.push(nodo);
    }
    
    relacionarNodos = (nodo1, nodo2) => {
      if (nodo1) this.grafo[nodo1].push(nodo2);
      
    }
    
    getGrafo = () => {
      return this.grafo;
    }
    
    getMatriz = () => {
      let matriz = [];
      for (let i = 0; i < this.nodos.length; i++) {
        matriz.push([]);
        let nodo = this.nodos[i];
        for (let j = 0; j < this.nodos.length; j++) {
          if (this.grafo[nodo].includes(this.nodos[j])) {
            matriz[i].push(1);
          } else {
            matriz[i].push(0);
          }
        }
      }
      return matriz;
    }
  }
 export default Grafo; 