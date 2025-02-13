<template>
    <div id="app">
      <GraphView />
    </div>
  </template>
  
  <script>
  import GraphView from "./views/GraphView.vue";
  
  export default {
    components: {
      GraphView
    }
  };
  </script>
  
  <style>
 
  #app {
    background-color: white; 
    color: #000;
  }
  </style>
  