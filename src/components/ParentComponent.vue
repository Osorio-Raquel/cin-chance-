<template>
  <Graph @updateNodes="updateNodes" @updateMatrix="updateMatrix" />
  <Johnson :nodes="nodes" :adjacencyMatrix="adjacencyMatrix" />
</template>

<script>
import Graph from "./Graph.vue";
import Johnson from "./Johnson.vue";

export default {
  components: { Graph, Johnson },
  data() {
    return {
      nodes: [],
      adjacencyMatrix: [],
    };
  },
  methods: {
    updateNodes(nodes) {
      console.log("📥 Recibidos nodos en el padre:", nodes);
      this.nodes = nodes;
    },
    updateMatrix(matrix) {
      console.log("📥 Recibida matriz en el padre:", matrix);
      this.adjacencyMatrix = matrix;
    },
  },
};
</script>
