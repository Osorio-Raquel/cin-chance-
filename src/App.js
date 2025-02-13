import React from 'react';
import './App.css';
import GrafoComponent from './Componente/Grafo';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenido a la Aplicación de Grafo</h1>
        <p>
          Puedes crear nodos haciendo doble clic en el área de trabajo.
        </p>
      </header>
      {/* Aquí insertamos el componente del grafo */}
      <GrafoComponent />
    </div>
  );
}

export default App;
