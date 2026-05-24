import { Nodo, EventoLog, Metrica } from '../types';
import { nodosIniciales, logsIniciales, generarMetricasHistoricas } from '../data/mockData';

// Función para generar un array de datos de tráfico
export const generarDatosTráfico = (tipo: 'normal' | 'pico' | 'fallo' = 'normal'): number[] => {
  const result: number[] = [];
  const longitud = 20; // 20 puntos de datos
  
  // Valores base según el tipo de tráfico
  const base = tipo === 'normal' ? 50 : tipo === 'pico' ? 80 : 30;
  const variacion = tipo === 'normal' ? 20 : tipo === 'pico' ? 15 : 40;
  
  for (let i = 0; i < longitud; i++) {
    let valor;
    if (tipo === 'fallo' && i > longitud / 2) {
      // Simular recuperación gradual después de un fallo
      valor = base - variacion + (Math.random() * variacion * (i - longitud/2) / (longitud/2));
    } else {
      valor = base - variacion/2 + Math.random() * variacion;
    }
    result.push(parseFloat(valor.toFixed(1)));
  }
  
  return result;
};

// Función para generar latencia según tipo de simulación
export const generarLatencia = (tipo: 'normal' | 'pico' | 'fallo' = 'normal'): number => {
  // Valores base según el tipo
  const base = tipo === 'normal' ? 45 : tipo === 'pico' ? 70 : 120;
  const variacion = tipo === 'normal' ? 10 : tipo === 'pico' ? 20 : 30;
  
  const valor = base - variacion/2 + Math.random() * variacion;
  return parseFloat(valor.toFixed(1));
};

// Función para calcular carga balanceada según algoritmo
export const calcularCargaBalanceada = (
  tipo: 'normal' | 'pico' | 'fallo' = 'normal',
  algoritmo: string = 'ia'
): number => {
  // Eficiencia base por algoritmo (porcentaje)
  const eficienciaBase = {
    'ia': 85,
    'roundrobin': 70,
    'leastconnections': 75
  };
  
  // Modificadores según el tipo de tráfico
  const modificador = {
    'normal': 1,
    'pico': 0.85,
    'fallo': 0.7
  };
  
  // Calcular eficiencia final
  const algoritmoKey = algoritmo as keyof typeof eficienciaBase;
  const tipoKey = tipo as keyof typeof modificador;
  
  let eficiencia = (eficienciaBase[algoritmoKey] || 70) * (modificador[tipoKey] || 1);
  
  // Añadir variación aleatoria (±5%)
  eficiencia += (Math.random() * 10 - 5);
  
  // Limitar entre 0 y 100
  return Math.min(100, Math.max(0, parseFloat(eficiencia.toFixed(1))));
};

// Función principal que genera todos los datos de simulación
export const generarDatosSimulacion = (
  tipo: 'normal' | 'pico' | 'fallo' = 'normal',
  nivelCarga: number = 50, // 0-100
  algoritmo: string = 'ia'
): {
  trafico: number[];
  latenciaPromedio: number;
  cargaBalanceada: number;
  nodos: Nodo[];
  metricas: Metrica[];
  eventos: EventoLog[];
} => {
  // Aplicar nivel de carga a los datos generados
  const factorCarga = nivelCarga / 50; // normalizar para que 50 sea factor 1
  
  // Generar datos básicos
  const trafico = generarDatosTráfico(tipo).map(v => 
    Math.min(100, Math.max(0, v * factorCarga))
  );
  
  const latenciaPromedio = generarLatencia(tipo) * factorCarga;
  const cargaBalanceada = calcularCargaBalanceada(tipo, algoritmo);
  
  // Generar nodos con cargas actualizadas
  const nodos = nodosIniciales.map(nodo => {
    // Calcular nueva carga basada en tipo y factor
    let nuevaCarga;
    
    if (tipo === 'fallo' && Math.random() < 0.2) {
      nuevaCarga = Math.floor(Math.random() * 20); // Algunos nodos con poca carga en fallo
    } else if (tipo === 'pico') {
      nuevaCarga = Math.floor(60 + Math.random() * 40) * factorCarga; // Cargas altas en pico
    } else {
      nuevaCarga = Math.floor(20 + Math.random() * 60) * factorCarga;
    }
    
    // Limitar entre 0 y 100
    nuevaCarga = Math.min(100, Math.max(0, nuevaCarga));
    
    // Determinar estado según la carga
    let nuevoEstado: 'normal' | 'advertencia' | 'crítico';
    if (nuevaCarga > 80) nuevoEstado = 'crítico';
    else if (nuevaCarga > 60) nuevoEstado = 'advertencia';
    else nuevoEstado = 'normal';
    
    return {
      ...nodo,
      carga: nuevaCarga,
      estado: nuevoEstado
    };
  });
  
  // Generar métricas históricas
  const metricas = generarMetricasHistoricas();
  
  // Eventos de log
  const eventos = logsIniciales;
  
  return {
    trafico,
    latenciaPromedio,
    cargaBalanceada,
    nodos,
    metricas,
    eventos
  };
};