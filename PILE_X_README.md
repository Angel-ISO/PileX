# 🎨 **pileX - Sistema de Dibujo Colaborativo**

## 📋 **Descripción**

**pileX** es un sistema completo de dibujo colaborativo en tiempo real que integra tres proyectos principales:

- **Backend**: API REST con WebSocket para comunicación en tiempo real
- **Frontend**: Interfaz React moderna con herramientas de dibujo avanzadas
- **Baseplate**: Lógica de juego de Agar.io adaptada para dibujo colaborativo

## 🚀 **Características Principales**

### ✅ **Funcionalidades Implementadas**

#### **🎨 Herramientas de Dibujo**
- **Pincel**: Dibujo a mano alzada con tamaño configurable
- **Borrador**: Eliminar píxeles (pinta en blanco)
- **Relleno**: Rellenar áreas conectadas
- **Selector de Color**: Elegir color de píxeles existentes
- **Conversor de Imágenes**: Subir imágenes y convertirlas a píxeles

#### **🌈 Interfaz de Usuario**
- **Paleta de Colores**: 18 colores predefinidos + selector personalizado
- **Control de Tamaño**: Pincel de 1-10 píxeles
- **Vista en Tiempo Real**: Canvas 500x500 píxeles
- **Estadísticas**: Usuarios conectados, píxeles pintados, progreso
- **Responsive**: Funciona en desktop y móvil

#### **👥 Colaboración en Tiempo Real**
- **Sincronización**: Todos ven los cambios instantáneamente
- **Lista de Usuarios**: Ver quién está conectado
- **Rate Limiting**: Previene spam (100 píxeles/segundo máximo)
- **Conexión Persistente**: Reconexión automática

#### **🔧 Optimizaciones Técnicas**
- **Batching**: Envío de píxeles en lotes para mejor rendimiento
- **Compresión**: Datos optimizados para WebSocket
- **Canvas Virtual**: Renderizado eficiente con 2x escala
- **Web Workers**: Procesamiento de imágenes sin bloquear UI

---

## 🏗️ **Arquitectura del Sistema**

### **Backend Structure**
```
backend/
├── src/
│   ├── server.js                 # Servidor principal con WebSocket
│   ├── core/
│   │   ├── GameEngine.js        # Motor de juego (adaptado)
│   │   ├── EventBus.js          # Sistema de eventos
│   │   └── entities/
│   │       ├── Player.js        # Jugador con multi-cell
│   │       └── Food.js          # Sistema de comida
│   ├── infrastructure/
│   │   ├── SocketManager.js     # Gestor WebSocket
│   │   └── GameServer.js        # Orquestador principal
│   └── shared/
│       └── config/gameConfig.js # Configuración del juego
```

### **Frontend Structure**
```
frontend/
├── src/
│   ├── hooks/
│   │   └── useWebSocket.js      # Hook WebSocket optimizado
│   ├── components/game/
│   │   ├── PixelCanvas.jsx      # Componente principal
│   │   ├── GameCanvas.jsx       # Canvas de dibujo
│   │   ├── ToolSelector.jsx     # Selector de herramientas
│   │   ├── ColorPalette.jsx     # Paleta de colores
│   │   ├── BrushSizeSelector.jsx # Control de tamaño
│   │   ├── ImageToPixelConverter.jsx # Conversor de imágenes
│   │   ├── GameUI.jsx           # Interfaz de usuario
│   │   └── GameControls.jsx     # Controles generales
│   └── layouts/
│       └── MainLayout.jsx       # Sistema de rutas
```

---

## 📡 **API WebSocket - Eventos Principales**

### **Cliente → Servidor**

#### **`joinCanvas`** - Unirse al Canvas
```javascript
socket.emit('joinCanvas', {});

```

#### **`paintPixel`** - Pintar un Píxel
```javascript
socket.emit('paintPixel', { x: 100, y: 200, color: '#FF6B6B' });
```

#### **`paintPixelBatch`** - Pintar Múltiples Píxeles
```javascript
socket.emit('paintPixelBatch', {
  pixels: [
    { x: 100, y: 200, color: '#FF6B6B' },
    { x: 101, y: 200, color: '#FF6B6B' }
  ],
  timestamp: Date.now()
});
```

### **Servidor → Cliente**

#### **`canvasWelcome`** - Bienvenida
```javascript
{
  canvasSize: { width: 500, height: 500 },
  userId: "user_id",
  username: "username"
}
```

#### **`canvasState`** - Estado Completo del Canvas
```javascript
{
  width: 500,
  height: 500,
  canvas: Array[500][500],
  stats: {
    paintedPixels: 1247,
    connectedUsers: 5,
    paintedPercentage: "0.50%"
  }
}
```

#### **`pixelUpdate`** - Actualización de Píxel
```javascript
{
  x: 100,
  y: 200,
  color: '#FF6B6B',
  userId: 'user123',
  timestamp: 1234567890
}
```

---

## 🚀 **Cómo Usar pileX**

### **1. Configuración Inicial**

#### **Instalar Dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### **Variables de Entorno**
```bash
# backend/.env
PORT=8001
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/pilex

VITE_WS_URL=http://localhost:8001
VITE_API_URL=http://localhost:8001/api
```

### **2. Iniciar Servicios**

#### **Terminal 1: Backend**
```bash
cd backend
npm run start

```

#### **Terminal 2: Frontend**
```bash
cd frontend
npm run dev

```

### **3. Flujo de Uso**

#### **Paso 1: Autenticación**
1. Ir a `http://localhost:5173`
2. Registrarse o iniciar sesión
3. Navegar a `/game`

#### **Paso 2: Unirse al Canvas**
1. Hacer click en "Unirse al Canvas"
2. Esperar sincronización inicial
3. Canvas se carga completamente

#### **Paso 3: Dibujar**
1. **Seleccionar herramienta** del panel izquierdo
2. **Elegir color** de la paleta
3. **Ajustar tamaño** del pincel (1-10)
4. **Hacer click** o **arrastrar** en el canvas

#### **Paso 4: Subir Imágenes**
1. Seleccionar herramienta "Imagen" (🖼️)
2. Hacer click en "Seleccionar Imagen"
3. Elegir imagen (máx. 5MB)
4. Ajustar tamaño y configuración
5. Hacer click en "Convertir"

---

## 🎮 **Controles e Interfaz**

### **Panel Izquierdo**
```
🎨 Herramientas:
├── 🖌️ Pincel - Dibujo manual
├── 🧽 Borrador - Eliminar píxeles
├── 🪣 Relleno - Rellenar áreas
├── 👆 Selector - Elegir color
└── 🖼️ Imagen - Convertir imágenes

🌈 Paleta de Colores:
└── 18 colores + selector personalizado

📏 Tamaño de Pincel:
└── 1-10 píxeles con preajustes
```

### **Panel Derecho**
```
👥 Usuarios Conectados:
├── Lista de usuarios activos
├── Estado de conexión
└── Hora de conexión

📊 Estadísticas:
├── Píxeles pintados
├── Progreso del canvas
└── Usuarios conectados
```

### **Controles de Teclado**
```
Espacio: Alternar pincel/borrador
W: Activar relleno
Flechas: Mover vista (futuro)
Escape: Cerrar modales
```

---

## 🔧 **Configuración Avanzada**

### **Rate Limiting**
```javascript
// En useWebSocket.js
const rateLimiter = new PixelRateLimiter({
  maxPixelsPerSecond: 100,
  maxBatchSize: 50
});
```

### **Tamaño del Canvas**
```javascript
// En gameConfig.js
export const WORLD_SIZE = {
  width: 500,
  height: 500
};
```

### **Compresión de Datos**
```javascript
// Solo enviar píxeles modificados
const compressedPixels = pixels.filter(p => p.color !== '#FFFFFF');
socket.emit('canvasState', { compressedPixels });
```

---

## 📈 **Optimizaciones de Rendimiento**

### **1. Batching Inteligente**
- ✅ Píxeles individuales → batch automático
- ✅ Imágenes grandes → chunks de 50 píxeles
- ✅ Rate limiting → cola de envío

### **2. Renderizado Eficiente**
- ✅ Canvas virtual con escala 2x
- ✅ Solo re-renderizar píxeles modificados
- ✅ Web Workers para procesamiento pesado

### **3. Sincronización Optimizada**
- ✅ Estado inicial completo
- ✅ Actualizaciones diferenciales
- ✅ Reconexión automática

---

## 🐛 **Solución de Problemas**

### **Problema: No se conecta WebSocket**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8001

# Verificar CORS
# Asegurarse que el frontend tenga VITE_WS_URL correcto
```

### **Problema: Canvas no se carga**
```javascript
// Verificar estado de autenticación
console.log('User authenticated:', userSession.authenticated);

// Verificar conexión WebSocket
console.log('WebSocket connected:', isConnected);
```

### **Problema: Píxeles no se envían**
```javascript
// Verificar rate limiter
console.log('Rate limiter status:', rateLimiterStatus);

// Verificar conexión
console.log('Connection status:', connectionStatus);
```

---

## 🎯 **Casos de Uso**

### **1. Dibujo Colaborativo**
- ✅ Múltiples usuarios dibujando simultáneamente
- ✅ Sincronización en tiempo real
- ✅ Historial completo preservado

### **2. Creación de Arte Comunitario**
- ✅ Proyectos artísticos colaborativos
- ✅ Votación y moderación
- ✅ Exportación de obras completas

### **3. Educación**
- ✅ Enseñanza de arte digital
- ✅ Colaboración en proyectos escolares
- ✅ Seguimiento de progreso estudiantil

---

## 🚀 **Próximas Funcionalidades**

### **Fase 2: Características Avanzadas**
- [ ] **Capas**: Sistema de capas para dibujos complejos
- [ ] **Herramientas Avanzadas**: Líneas, círculos, formas
- [ ] **Historial**: Deshacer/rehacer acciones
- [ ] **Zoom y Pan**: Navegación en canvas grandes
- [ ] **Chat Integrado**: Comunicación entre artistas
- [ ] **Moderación**: Herramientas para administradores

### **Fase 3: Escalabilidad**
- [ ] **Clusters**: Soporte para múltiples servidores
- [ ] **Base de Datos**: Persistencia de dibujos
- [ ] **APIs REST**: Integración con otros servicios
- [ ] **Analytics**: Métricas detalladas de uso

---

## 📞 **Soporte**

Para soporte técnico o preguntas:
- 📧 **Email**: soporte@pilex.com
- 💬 **Discord**: [pileX Community](https://discord.gg/pilex)
- 📖 **Docs**: [Documentación Completa](https://docs.pilex.com)

---

## 📄 **Licencia**

**pileX** está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

**¡Gracias por usar pileX! 🎨✨**

*Construido con ❤️ para la comunidad de artistas digitales*