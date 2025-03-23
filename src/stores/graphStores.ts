import { defineStore } from 'pinia';
import { DataSet } from 'vis-network/standalone';
import { ref } from 'vue';

// Definimos los tipos
interface Node {
  id: number;
  label: string;
  color?: string;
  x?: number;
  y?: number;
}

interface Edge {
  id?: string;
  from: number;
  to: number;
  label?: string;
  arrows?: string;
}

// Definimos el store
export const useGraphStore = defineStore('graph', {
  state: () => ({
    nodes: new DataSet<Node>([]),
    edges: new DataSet<Edge>([]),
    adjacencyMatrix: ref<number[][]>([])  // 👈 Ahora es reactivo con ref()
  }),

});
