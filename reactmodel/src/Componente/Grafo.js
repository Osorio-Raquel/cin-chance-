import React, { useState, useRef } from "react";
import { Stage, Layer, Circle, Line, Text } from "react-konva";
import "./grafo.css"; 
import Grafo from "./claseGrafo"; 

const GrafoComponent = () => { 
  const [grafo] = useState(new Grafo()); // Creamos una instancia de la clase Grafo
  const [nodosInformacion, setNodosInformacion] = useState([]); // Aquí guardamos los nodos que vamos agregando
  const [matriz, setMatriz] = useState([]); // Esta es la matriz de adyacencia que vamos a mostrar
  const [nodosSeleccionados, setNodosSeleccionados] = useState([]); // Guardamos los nodos seleccionados
  const [lineas, setLineas] = useState([]); // Aquí guardamos las lineas entre nodos
  const [lineaArrastrando, setLineaArrastrando] = useState(null); // Para saber si estamos arrastrando una línea
  const [mostrarMatriz, setMostrarMatriz] = useState(false); // Controlamos si se muestra la matriz
  const nombres = "abcdefghijklmnopqrstuvwxyz"; // Usamos letras para los nombres de los nodos
  const stageRef = useRef(null); // Creamos una referencia al escenario para manejar la posición del puntero

  const agregarNodo = (e) => {
    if (nodosInformacion.length >= nombres.length) return; // Si ya tenemos todos los nodos no hacemos nada
    
    const escenario = stageRef.current; // Obtenemos el escenario
    const punteroPos = escenario.getPointerPosition(); // Obtenemos la posición del puntero
    const x = punteroPos.x; // X del puntero
    const y = punteroPos.y; // Y del puntero
    
    // vemos si el nuevo nodo está cerca de otro estro es para no crear un nodo sobre orto
    const estaCerca = nodosInformacion.some(nodo => {
      const distancia = Math.hypot(nodo.x - x, nodo.y - y); // Calculamos la distancia
      return distancia < 40; // Si está muy cerca, no lo agregamos
    });
  
    if (!estaCerca) { // Si no está cerca, agregamos el nodo
      const nuevoNodo = nombres[nodosInformacion.length]; // Le damos un nombre al nodo
      grafo.agregarNodo(nuevoNodo); // Lo agregamos al grafo
      setNodosInformacion([...nodosInformacion, { nombre: nuevoNodo, x, y }]); // Actualizamos los nodos
      setMatriz([]); // Limpiamos la matriz
    }
  };

  // Función para seleccionar un nodo
  const seleccionarNodo = (nodo) => {
    if (nodosSeleccionados.length < 1) { // Si no hay ningún nodo seleccionado
      setNodosSeleccionados([nodo]); // Seleccionamos el nodo
    }
  };

  // Cuando presionamos el mouse abajo
  const manejarMousePresionar = (e) => {
    if (nodosSeleccionados.length === 1) { // Si hay un nodo seleccionado
      const escenario = stageRef.current; // Obtenemos el escenario
      const punteroPos = escenario.getPointerPosition(); // Obtenemos la posición del puntero
      const nodoSeleccionado = nodosSeleccionados[0]; // Tomamos el nodo seleccionado
      setLineaArrastrando({ x1: nodoSeleccionado.x, y1: nodoSeleccionado.y, x2: punteroPos.x, y2: punteroPos.y }); // Creamos la línea
    }
  };

  // Cuando movemos el mouse
  const manejarMouseMovimiento = (e) => {
    if (lineaArrastrando) { // Si estamos arrastrando una línea
      const escenario = stageRef.current; // Obtenemos el escenario
      const punteroPos = escenario.getPointerPosition(); // Obtenemos la posición del puntero
      setLineaArrastrando(prevState => ({ ...prevState, x2: punteroPos.x, y2: punteroPos.y })); // Actualizamos la línea
    }
  };

  // Cuando soltamos el mouse
  const manejarMouseSoltar = (e) => {
    if (lineaArrastrando) { // Si estamos arrastrando una línea
      const escenario = stageRef.current; // Obtenemos el escenario
      const punteroPos = escenario.getPointerPosition(); // Obtenemos la posición del puntero
      let nodoDestino = null; // Este será el nodo destino
      nodosInformacion.forEach(nodo => { // Recorremos los nodos
        if (Math.hypot(nodo.x - punteroPos.x, nodo.y - punteroPos.y) < 30) { // Si está cerca del puntero
          nodoDestino = nodo; // Es el nodo destino
        }
      });

      if (nodoDestino && nodoDestino !== nodosSeleccionados[0]) { // Si encontramos un nodo y no es el nodo de origen
        grafo.relacionarNodos(nodosSeleccionados[0].nombre, nodoDestino.nombre); // Los conectamos
        setLineas([...lineas, { from: nodosSeleccionados[0], to: nodoDestino }]); // Actualizamos las líneas
      }

      setLineaArrastrando(null); // Terminamos de arrastrar la línea
      setNodosSeleccionados([]); // Limpiamos los nodos seleccionados
    }
  };

  // Función para mostrar la matriz de adyacencia
  const mostrarMatrizHandler = () => {
    setMatriz(grafo.getMatriz()); // Obtenemos la matriz del grafo
    setMostrarMatriz(true); // Mostramos la matriz
  };

  return (
    <div className="grafo-matriz-container"> 
      <Stage
        width={600}
        height={500}
        ref={stageRef} // Referencia al escenario
        className="grafo-container"
        onDblClick={agregarNodo} // Al hacer doble click agregamos un nodo
        onMouseDown={manejarMousePresionar} // Al presionar el mouse abajo se inicia el arrastre
        onMouseMove={manejarMouseMovimiento} // Movemos la línea mientras arrastramos
        onMouseUp={manejarMouseSoltar} // Al soltar el mouse, se suelta la línea
      >
        <Layer>
          {/* Aquí dibujamos las líneas entre los nodos */}
          {lineas.map((linea, index) => (
              <Line
                key={index}
                points={[linea.from.x, linea.from.y, linea.to.x, linea.to.y]}
                stroke="black"
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                // Haciendo que sea una flecha
                pointerLength={10} // Largo de la punta de la flecha
                pointerWidth={10} // Ancho de la punta de la flecha
                dash={[5, 5]} // Línea discontinua
              />
            ))}


          {/* Aquí dibujamos los nodos */}
          {nodosInformacion.map((nodo, index) => (
            <React.Fragment key={index}>
              <Circle
                x={nodo.x}
                y={nodo.y}
                radius={20}
                fill={nodosSeleccionados.includes(nodo) ? "red" : "blue"} // Si está seleccionado, es rojo
                onClick={() => seleccionarNodo(nodo)} // Al hacer click se selecciona el nodo
              />
              <Text
                x={nodo.x - 5}
                y={nodo.y - 5}
                text={nodo.nombre.toUpperCase()}
                fontSize={15}
                fill="white"
              />
            </React.Fragment>
          ))}

          {/* Si estamos arrastrando una línea, la mostramos */}
          {lineaArrastrando && (
            <Line
              points={[lineaArrastrando.x1, lineaArrastrando.y1, lineaArrastrando.x2, lineaArrastrando.y2]}
              stroke="black"
              strokeWidth={2}
              dash={[5, 5]} // Línea discontinua
            />
          )}
        </Layer>
      </Stage>

      {/* Botón para crear la matriz */}
      <div className="mt-4">
        <button
          onClick={mostrarMatrizHandler}
          disabled={nodosInformacion.length === 0} // Si no hay nodos, no puede crear la matriz
          className="botón-conectar"
        >
          Crear Matriz
        </button>
      </div>

      {/* Si la matriz está activa, la mostramos */}
      {mostrarMatriz && (
        <div className="matriz-container">
          <h3 className="text-lg font-semibold mb-4">Matriz de Adyacencia</h3>
          <div className="overflow-x-auto">
            <table className="matriz-table">
              <thead>
                <tr>
                  <th className="p-2 border"></th>
                  {grafo.nodos.map((nodo, index) => (
                    <th key={index} className="p-2 border">{nodo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matriz.map((fila, i) => (
                  <tr key={i}>
                    <th className="p-2 border">{grafo.nodos[i]}</th>
                    {fila.map((valor, j) => (
                      <td key={j} className="p-2 border text-center">{valor}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrafoComponent;
