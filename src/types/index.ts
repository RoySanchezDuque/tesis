// Definición de tipos para la aplicación

// Tipo para nodos de red
export interface Nodo {
  id: number;
  nombre: string;
  ip: string;
  tipo: 'router' | 'servidor' | 'balanceador' | 'switch';
  carga: number;
  estado: 'normal' | 'advertencia' | 'crítico';
  conexiones: number[];
  coordenadas: {x: number, y: number};
}

// Tipo para métricas de sistema
export interface Metrica {
  id: number;
  timestamp: string;
  latencia: number;
  trafico: number;
  cargaPromedio: number;
  algoritmoActivo: string;
}

// Tipo para eventos de log
export interface EventoLog {
  id: number;
  timestamp: string;
  tipo: 'balanceo' | 'error' | 'alerta' | 'sistema' | 'usuario';
  mensaje: string;
  nodoId: number | null;
  severidad: 'info' | 'warning' | 'error';
}

// Tipo para predicciones de IA
export interface Prediccion {
  hora: number;
  traficoPredicho: number;
  traficoReal?: number;
}

// Tipo para datos de topología
export interface Conexion {
  origen: number;
  destino: number;
  ancho: number;
  latencia: number;
}

// Tipo para datos de usuario
export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'ingeniero' | 'invitado';
  avatar: string;
}

// Tipo para configuración del sistema
export interface Configuracion {
  algoritmoActual: 'roundrobin' | 'leastconnections' | 'ia';
  modoAutomatico: boolean;
  frecuenciaActualizacion: number;
  umbralAlerta: number;
  umbralCritico: number;
  notificacionesActivas: boolean;
}

// Tipo para datos de informe
export interface Informe {
  id: number;
  fecha: string;
  tipoInforme: 'diario' | 'semanal' | 'mensual';
  metricas: {
    traficoPromedio: number;
    latenciaPromedio: number;
    eficienciaIA: number;
    incidentes: number;
  };
  url: string;
}