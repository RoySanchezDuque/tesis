import { Nodo, EventoLog, Metrica, Prediccion, Usuario, Informe } from '../types';
// Datos de usuarios para autenticación

export const usuarios: Usuario[] = [
  {
    id: 1,
    username: 'admin',
    nombre: 'Administrador',
    apellido: 'Sistema',
    email: 'admin@redes.com',
    rol: 'admin',
    avatar: ''
  },
  {
    id: 2,
    username: 'ingeniero',
    nombre: 'Ingeniero',
    apellido: 'Sistema',
    email: 'ingeniero@redes.com',
    rol: 'ingeniero',
    avatar: ''
  },
  {
    id: 3,
    username: 'rsduque',
    nombre: 'Roy',
    apellido: 'Sánchez Duque',
    email: 'roy.sanchez@redes.com',
    rol: 'invitado',
    avatar: ''
  }
];


// Datos iniciales para nodos de red
export const nodosIniciales: Nodo[] = [
  {
    id: 1,
    nombre: 'Router Principal',
    ip: '192.168.1.1',
    tipo: 'router',
    carga: 45,
    estado: 'normal',
    conexiones: [2, 3, 4],
    coordenadas: {x: 250, y: 100}
  },
  {
    id: 2,
    nombre: 'Balanceador 1',
    ip: '192.168.1.10',
    tipo: 'balanceador',
    carga: 60,
    estado: 'normal',
    conexiones: [1, 5, 6, 7],
    coordenadas: {x: 450, y: 200}
  },
  {
    id: 3,
    nombre: 'Balanceador 2',
    ip: '192.168.1.11',
    tipo: 'balanceador',
    carga: 35,
    estado: 'normal',
    conexiones: [1, 5, 6, 7],
    coordenadas: {x: 250, y: 300}
  },
  {
    id: 4,
    nombre: 'Switch Principal',
    ip: '192.168.1.20',
    tipo: 'switch',
    carga: 30,
    estado: 'normal',
    conexiones: [1, 8, 9, 10],
    coordenadas: {x: 50, y: 200}
  },
  {
    id: 5,
    nombre: 'Servidor Web 1',
    ip: '192.168.2.1',
    tipo: 'servidor',
    carga: 75,
    estado: 'advertencia',
    conexiones: [2, 3],
    coordenadas: {x: 350, y: 400}
  },
  {
    id: 6,
    nombre: 'Servidor Web 2',
    ip: '192.168.2.2',
    tipo: 'servidor',
    carga: 40,
    estado: 'normal',
    conexiones: [2, 3],
    coordenadas: {x: 450, y: 400}
  },
  {
    id: 7,
    nombre: 'Servidor Base de Datos',
    ip: '192.168.2.10',
    tipo: 'servidor',
    carga: 85,
    estado: 'crítico',
    conexiones: [2, 3],
    coordenadas: {x: 550, y: 400}
  },
  {
    id: 8,
    nombre: 'Servidor Caché',
    ip: '192.168.3.1',
    tipo: 'servidor',
    carga: 25,
    estado: 'normal',
    conexiones: [4],
    coordenadas: {x: 50, y: 400}
  },
  {
    id: 9,
    nombre: 'Servidor Aplicaciones',
    ip: '192.168.3.2',
    tipo: 'servidor',
    carga: 60,
    estado: 'normal',
    conexiones: [4],
    coordenadas: {x: 150, y: 400}
  },
  {
    id: 10,
    nombre: 'Servidor Backup',
    ip: '192.168.3.3',
    tipo: 'servidor',
    carga: 15,
    estado: 'normal',
    conexiones: [4],
    coordenadas: {x: 250, y: 400}
  }
];

// Datos históricos de logs
export const logsIniciales: EventoLog[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    tipo: 'balanceo',
    mensaje: 'Balanceo automático ejecutado por algoritmo IA',
    nodoId: null,
    severidad: 'info'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    tipo: 'error',
    mensaje: 'Fallo detectado en servidor ID:7',
    nodoId: 7,
    severidad: 'error'
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    tipo: 'alerta',
    mensaje: 'Carga elevada en Servidor Web 1',
    nodoId: 5,
    severidad: 'warning'
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    tipo: 'sistema',
    mensaje: 'Inicio de sesión: usuario admin',
    nodoId: null,
    severidad: 'info'
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    tipo: 'balanceo',
    mensaje: 'Cambio manual de algoritmo a Least Connections',
    nodoId: null,
    severidad: 'info'
  }
];

// Generar datos de predicción para 24 horas
export const generarPrediccion = (): Prediccion[] => {
  const predicciones: Prediccion[] = [];
  const ahora = new Date().getHours();
  
  for (let i = 0; i < 24; i++) {
    const hora = (ahora + i) % 24;
    
    // Patrón de tráfico: más alto durante horas laborales (9-18)
    let base = 30;
    if (hora >= 9 && hora <= 18) {
      base = 60;
    }
    if (hora >= 12 && hora <= 14) { // Hora pico al mediodía
      base = 80;
    }
    
    // Añadir variación aleatoria
    const traficoPredicho = base + (Math.random() * 20 - 10);
    
    // Para las horas que ya han pasado, mostrar tráfico real
    const traficoReal = i < 6 ? traficoPredicho + (Math.random() * 10 - 5) : undefined;
    
    predicciones.push({
      hora,
      traficoPredicho,
      traficoReal
    });
  }
  
  return predicciones;
};

// Generar datos históricos de métricas
export const generarMetricasHistoricas = (): Metrica[] => {
  const metricas: Metrica[] = [];
  const ahora = Date.now();
  
  // Generar datos para las últimas 24 horas, uno cada hora
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(ahora - (i * 3600000)).toISOString();
    const hora = new Date(timestamp).getHours();
    
    // Patrón similar al de predicciones
    let baseTrafico = 30;
    if (hora >= 9 && hora <= 18) {
      baseTrafico = 60;
    }
    if (hora >= 12 && hora <= 14) {
      baseTrafico = 80;
    }
    
    const trafico = baseTrafico + (Math.random() * 20 - 10);
    const latencia = 50 + (Math.random() * 30);
    const cargaPromedio = 40 + (Math.random() * 30);
    
    // Alternar algoritmos para simular cambios
    const algoritmos = ['ia', 'roundrobin', 'leastconnections'];
    const algoritmoActivo = algoritmos[i % algoritmos.length];
    
    metricas.push({
      id: Date.now() - i,
      timestamp,
      latencia,
      trafico,
      cargaPromedio,
      algoritmoActivo
    });
  }
  
  return metricas;
};

// Generar informes mensuales
export const informesIniciales: Informe[] = [
  {
    id: 1,
    fecha: '2025-04-01',
    tipoInforme: 'mensual',
    metricas: {
      traficoPromedio: 65.3,
      latenciaPromedio: 48.7,
      eficienciaIA: 87.2,
      incidentes: 3
    },
    url: '#'
  },
  {
    id: 2,
    fecha: '2025-03-01',
    tipoInforme: 'mensual',
    metricas: {
      traficoPromedio: 72.1,
      latenciaPromedio: 52.3,
      eficienciaIA: 83.9,
      incidentes: 5
    },
    url: '#'
  },
  {
    id: 3,
    fecha: '2025-02-01',
    tipoInforme: 'mensual',
    metricas: {
      traficoPromedio: 68.5,
      latenciaPromedio: 55.1,
      eficienciaIA: 81.4,
      incidentes: 4
    },
    url: '#'
  }
];