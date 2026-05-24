// Formatear fecha y hora en formato español
export const formatearFechaHora = (fecha: string): string => {
  const date = new Date(fecha);
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

// Obtener fecha actual formateada
export const obtenerFechaFormateada = (): string => {
  const fecha = new Date();
  
  const opciones: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  // Formatear con la primera letra mayúscula
  const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
};

// Formatear hora en formato 24h
export const formatearHora = (fecha: string): string => {
  const date = new Date(fecha);
  
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};

// Obtener mes y año para informes
export const obtenerMesAño = (fecha: string): string => {
  const date = new Date(fecha);
  
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};