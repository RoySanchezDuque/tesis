import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generarDatosSimulacion } from '../utils/simulationUtils';
import { Nodo, Metrica, EventoLog } from '../types';

interface SimulationContextType {
  trafico: number[];
  latenciaPromedio: number;
  cargaBalanceada: number;
  nodos: Nodo[];
  metricas: Metrica[];
  eventos: EventoLog[];
  algoritmoActual: string;
  modoAutomatico: boolean;
  tipoSimulacion: 'normal' | 'pico' | 'fallo';
  cargaSimulacion: number;
  frecuenciaActualizacion: number;
  // Métodos para cambiar configuración
  setAlgoritmoActual: (algoritmo: string) => void;
  setModoAutomatico: (automatico: boolean) => void;
  setTipoSimulacion: (tipo: 'normal' | 'pico' | 'fallo') => void;
  setCargaSimulacion: (carga: number) => void;
  setFrecuenciaActualizacion: (frecuencia: number) => void;
  // Acciones
  ejecutarBalanceo: () => void;
  simularFallo: (nodoId: number) => void;
  resetearSimulacion: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation debe ser usado dentro de un SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider = ({ children }: SimulationProviderProps) => {
  // Estado de simulación
  const [trafico, setTrafico] = useState<number[]>([]);
  const [latenciaPromedio, setLatenciaPromedio] = useState<number>(0);
  const [cargaBalanceada, setCargaBalanceada] = useState<number>(0);
  const [nodos, setNodos] = useState<Nodo[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [eventos, setEventos] = useState<EventoLog[]>([]);
  
  // Configuración
  const [algoritmoActual, setAlgoritmoActual] = useState<string>('ia');
  const [modoAutomatico, setModoAutomatico] = useState<boolean>(true);
  const [tipoSimulacion, setTipoSimulacion] = useState<'normal' | 'pico' | 'fallo'>('normal');
  const [cargaSimulacion, setCargaSimulacion] = useState<number>(50);
  const [frecuenciaActualizacion, setFrecuenciaActualizacion] = useState<number>(5);

  // Intervalos de simulación
  const [simulacionActiva, setSimulacionActiva] = useState<boolean>(true);

  // Inicialización
  useEffect(() => {
    const datos = generarDatosSimulacion();
    setTrafico(datos.trafico);
    setLatenciaPromedio(datos.latenciaPromedio);
    setCargaBalanceada(datos.cargaBalanceada);
    setNodos(datos.nodos);
    setMetricas(datos.metricas);
    setEventos(datos.eventos);
  }, []);

  // Simulación en tiempo real
  useEffect(() => {
    if (!simulacionActiva) return;

    const intervalo = setInterval(() => {
      const datos = generarDatosSimulacion(
        tipoSimulacion,
        cargaSimulacion,
        algoritmoActual
      );
      
      // Actualizar solo los datos que cambian en tiempo real
      setTrafico(prev => [...prev.slice(1), datos.trafico[datos.trafico.length - 1]]);
      setLatenciaPromedio(datos.latenciaPromedio);
      setCargaBalanceada(datos.cargaBalanceada);
      
      // Actualizar nodos con nueva carga
      setNodos(prevNodos => 
        prevNodos.map((nodo, i) => ({
          ...nodo,
          carga: datos.nodos[i].carga,
          estado: datos.nodos[i].estado
        }))
      );
      
      // Agregar nuevas métricas
      const nuevaMetrica = datos.metricas[datos.metricas.length - 1];
      setMetricas(prev => [...prev, nuevaMetrica]);
      
      // Si modo automático está activado, ejecutar balanceo
      if (modoAutomatico && Math.random() > 0.7) {
        ejecutarBalanceo();
      }
      
    }, frecuenciaActualizacion * 1000);

    return () => clearInterval(intervalo);
  }, [simulacionActiva, tipoSimulacion, cargaSimulacion, algoritmoActual, modoAutomatico, frecuenciaActualizacion]);

  // Función para ejecutar balanceo manualmente
  const ejecutarBalanceo = () => {
    // Crear evento de log
    const nuevoEvento: EventoLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      tipo: 'balanceo',
      mensaje: `Balanceo ejecutado usando algoritmo ${algoritmoActual.toUpperCase()}`,
      nodoId: null,
      severidad: 'info'
    };
    
    setEventos(prev => [nuevoEvento, ...prev]);
    
    // Actualizar cargas de los nodos
    setNodos(prev => 
      prev.map(nodo => {
        // Algoritmo de balanceo simulado
        let nuevaCarga;
        if (algoritmoActual === 'roundrobin') {
          nuevaCarga = Math.floor(Math.random() * 60) + 20;
        } else if (algoritmoActual === 'leastconnections') {
          nuevaCarga = Math.floor(Math.random() * 40) + 10;
        } else {
          // Algoritmo IA - mejor distribución
          nuevaCarga = Math.floor(Math.random() * 30) + 10;
        }
        
        return {
          ...nodo,
          carga: nuevaCarga,
          estado: nuevaCarga > 80 ? 'crítico' : nuevaCarga > 60 ? 'advertencia' : 'normal'
        };
      })
    );
  };

  // Función para simular fallo en un nodo
  const simularFallo = (nodoId: number) => {
    // Actualizar nodo con fallo
    setNodos(prev => 
      prev.map(nodo => {
        if (nodo.id === nodoId) {
          return {
            ...nodo,
            estado: 'crítico',
            carga: 0
          };
        }
        return nodo;
      })
    );
    
    // Crear evento de log
    const nuevoEvento: EventoLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      tipo: 'error',
      mensaje: `Fallo detectado en nodo ID:${nodoId}`,
      nodoId: nodoId,
      severidad: 'error'
    };
    
    setEventos(prev => [nuevoEvento, ...prev]);
    
    // Distribuir carga entre otros nodos
    setTimeout(() => {
      ejecutarBalanceo();
    }, 1500);
  };

  // Función para resetear la simulación
  const resetearSimulacion = () => {
    const datos = generarDatosSimulacion();
    setTrafico(datos.trafico);
    setLatenciaPromedio(datos.latenciaPromedio);
    setCargaBalanceada(datos.cargaBalanceada);
    setNodos(datos.nodos);
    
    // Crear evento de log
    const nuevoEvento: EventoLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      tipo: 'sistema',
      mensaje: 'Simulación reiniciada',
      nodoId: null,
      severidad: 'info'
    };
    
    setEventos(prev => [nuevoEvento, ...prev]);
  };

  return (
    <SimulationContext.Provider value={{
      trafico,
      latenciaPromedio,
      cargaBalanceada,
      nodos,
      metricas,
      eventos,
      algoritmoActual,
      modoAutomatico,
      tipoSimulacion,
      cargaSimulacion,
      frecuenciaActualizacion,
      setAlgoritmoActual,
      setModoAutomatico,
      setTipoSimulacion,
      setCargaSimulacion,
      setFrecuenciaActualizacion,
      ejecutarBalanceo,
      simularFallo,
      resetearSimulacion
    }}>
      {children}
    </SimulationContext.Provider>
  );
};