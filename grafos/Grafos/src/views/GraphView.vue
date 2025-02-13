<template>
  <div class="graph-view">
    <Graph />
  </div>
</template>

<script>
import Graph from "../components/Graph.vue";

export default {
  name: "GraphView",
  components: {
    Graph
  }
};
</script>

<style scoped>
.graph-view {
  text-align: center;
  padding: 0; 
  height: 100vh; 
  width: 100vw;  
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

#graph {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
}
</style>

