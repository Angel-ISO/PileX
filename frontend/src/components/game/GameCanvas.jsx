import React, { useRef, useEffect, useCallback, useState, forwardRef } from 'react';
import { CANVAS_SIZE, PIXEL_SIZE, BASE_DISPLAY_SIZE } from './pixelConfig';

const GameCanvas = forwardRef(({
  canvasState,
  onPixelPaint,
  onColorPick,
  selectedTool,
  brushSize,
  selectedColor,
  isConnected
  , onRemotePixelsRegister, onRemotePixelsUnregister
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPixel, setLastPixel] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [zoom, setZoom] = useState(1); 
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); 
  const [stats, setStats] = useState({
    paintedPixels: 0,
    canvasSize: `${CANVAS_SIZE}x${CANVAS_SIZE}`,
    progress: '0.0%',
    zoom: '100%',
    totalPixels: `${(CANVAS_SIZE * CANVAS_SIZE).toLocaleString()}`
  });
  const [isUpdatingStats, setIsUpdatingStats] = useState(false);

  const DISPLAY_SIZE = BASE_DISPLAY_SIZE * zoom;

  useEffect(() => {
    if (ref) {
      ref.current = canvasRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = BASE_DISPLAY_SIZE;
    canvas.height = BASE_DISPLAY_SIZE;

    // Make sure browser doesn't smooth scaled canvas (pixel art)
    canvas.style.imageRendering = 'pixelated';
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      try { ctx.webkitImageSmoothingEnabled = false; } catch (e) {}
      try { ctx.msImageSmoothingEnabled = false; } catch (e) {}
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, BASE_DISPLAY_SIZE, BASE_DISPLAY_SIZE);

    drawGrid(ctx);
  }, [canvasRef.current]); 

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);

  const handleMouseDown = useCallback((event) => {
    if (event.button === 1) {
      event.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((event) => {
    if (isPanning && lastPanPoint) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [isPanning, lastPanPoint, panOffset]);

  const handleMouseUp = useCallback((event) => {
    if (event.button === 1) {
      setIsPanning(false);
      setLastPanPoint(null);
    }
  }, []);

  useEffect(() => {
    if (!canvasState?.canvas) return;

    const updateStats = () => {
      setIsUpdatingStats(true);

      setTimeout(() => {
        let paintedPixels = 0;
        const totalPixels = CANVAS_SIZE * CANVAS_SIZE;

        for (let y = 0; y < CANVAS_SIZE; y++) {
          for (let x = 0; x < CANVAS_SIZE; x++) {
            const color = canvasState.canvas[y][x];
            if (color && color !== '#FFFFFF') {
              paintedPixels++;
            }
          }
        }

        const progressPercentage = ((paintedPixels / totalPixels) * 100).toFixed(1);

        setStats({
          paintedPixels,
          canvasSize: `${CANVAS_SIZE}x${CANVAS_SIZE}`,
          zoom: `${Math.round(zoom * 100)}%`,
          progress: `${progressPercentage}%`,
          totalPixels: totalPixels.toLocaleString()
        });

        setIsUpdatingStats(false);
      }, 100);
    };

    updateStats();
    const interval = setInterval(updateStats, 15000); 

    return () => clearInterval(interval);
  }, [canvasState, zoom]);

  function drawGrid(ctx) {
    // minor grid lines (very faint)
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i <= CANVAS_SIZE; i++) {
      const pos = i * PIXEL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, BASE_DISPLAY_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(BASE_DISPLAY_SIZE, pos);
      ctx.stroke();
    }

    // darker major grid every 10 pixels (for pixel-art blocks)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i <= CANVAS_SIZE; i += 10) {
      const pos = i * PIXEL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, BASE_DISPLAY_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(BASE_DISPLAY_SIZE, pos);
      ctx.stroke();
    }
  }

  useEffect(() => {
    // Full redraw only when a fresh canvasState with full canvas arrives
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // If there is a full canvas array, draw it once (initial load)
    if (canvasState?.canvas && Array.isArray(canvasState.canvas)) {
      // Resize and clear
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,BASE_DISPLAY_SIZE,BASE_DISPLAY_SIZE);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, BASE_DISPLAY_SIZE, BASE_DISPLAY_SIZE);

      // apply pan/zoom via css transform; draw at pixel scale
      for (let y = 0; y < CANVAS_SIZE; y++) {
        const row = canvasState.canvas[y];
        for (let x = 0; x < CANVAS_SIZE; x++) {
          const color = row[x];
          if (color && color !== '#FFFFFF') {
            ctx.fillStyle = color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          }
        }
      }

      // draw grid on top
      drawGrid(ctx);

      setIsLoading(false);
    }
  }, [canvasState, canvasRef.current, zoom, panOffset]);

  // incremental remote pixel drawing
  useEffect(() => {
    if (!canvasRef.current || !onRemotePixelsRegister) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handler = (updates) => {
      try {
        // draw updates directly; each update: {x,y,color}
        ctx.save();
        for (const u of updates) {
          ctx.fillStyle = u.color || '#FFFFFF';
          ctx.fillRect(u.x * PIXEL_SIZE, u.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
        ctx.restore();
      } catch (err) {
        console.error('Error drawing remote pixels', err);
      }
    };

    // register and return unregister
    const unregister = onRemotePixelsRegister(handler);
    return () => {
      if (onRemotePixelsUnregister) onRemotePixelsUnregister(handler);
      if (typeof unregister === 'function') unregister();
    };
  }, [canvasRef.current, onRemotePixelsRegister, onRemotePixelsUnregister]);

  const getCanvasCoordinates = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const canvasX = (clientX - rect.left - panOffset.x) / zoom;
    const canvasY = (clientY - rect.top - panOffset.y) / zoom;

    const pixelX = Math.floor(canvasX / PIXEL_SIZE);
    const pixelY = Math.floor(canvasY / PIXEL_SIZE);

    if (pixelX >= 0 && pixelX < CANVAS_SIZE && pixelY >= 0 && pixelY < CANVAS_SIZE) {
      return { x: pixelX, y: pixelY };
    }

    return null;
  }, [zoom, panOffset]);

  const handlePointerDown = useCallback((event) => {
    event.preventDefault();

    if (!isConnected) return;

    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;

    setIsDrawing(true);

    if (selectedTool === 'picker') {
      
      handleColorPick(coords.x, coords.y);
    } else {
      
      handlePixelPaint(coords.x, coords.y);
    }

    setLastPixel(coords);
  }, [isConnected, selectedTool, getCanvasCoordinates, zoom, panOffset]);

  const handlePointerMove = useCallback((event) => {
    event.preventDefault();

    if (!isDrawing || !isConnected) return;

    const coords = getCanvasCoordinates(event.clientX, event.clientY);
    if (!coords) return;

    
    if (lastPixel && lastPixel.x === coords.x && lastPixel.y === coords.y) {
      return;
    }

    if (selectedTool === 'picker') {
      handleColorPick(coords.x, coords.y);
    } else {
      handlePixelPaint(coords.x, coords.y);
    }

    setLastPixel(coords);
  }, [isDrawing, isConnected, lastPixel, selectedTool, getCanvasCoordinates, zoom, panOffset]);

  const handlePointerUp = useCallback((event) => {
    event.preventDefault();
    setIsDrawing(false);
    setLastPixel(null);
  }, [setIsPanning, setLastPanPoint]);

  
  const handlePixelPaint = useCallback((x, y) => {
    if (onPixelPaint) onPixelPaint(x, y);
  }, [onPixelPaint, selectedColor]);

  
  const handleColorPick = useCallback((x, y) => {
    if (canvasState?.canvas && onColorPick) {
      const color = canvasState.canvas[y][x] || '#FFFFFF';
      onColorPick(color);
    }
  }, [canvasState, onColorPick]);

  
  useEffect(() => {
    const handleKeyDown = (event) => {
      
      if (event.key === ' ' || event.key.toLowerCase() === 'b' ||
          event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'f') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPanning, setLastPanPoint]);

  
  if (!canvasState) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Esperando datos del servidor...</p>
          <p className="text-gray-500 text-sm mt-2">Conectando al canvas colaborativo</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`
          border-2 border-gray-300 rounded-lg cursor-crosshair
          ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedTool === 'picker' ? 'cursor-copy' : ''}
          ${selectedTool === 'eraser' ? 'cursor-grab' : ''}
          ${isPanning ? 'cursor-grabbing' : ''}
        `}
        style={{
          width: `${BASE_DISPLAY_SIZE}px`,
          height: `${BASE_DISPLAY_SIZE}px`,
          imageRendering: 'pixelated',
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
        onMouseDown={(e) => {
          handleMouseDown(e);
          handlePointerDown(e);
        }}
        onMouseMove={(e) => {
          handleMouseMove(e);
          handlePointerMove(e);
        }}
        onMouseUp={(e) => {
          handleMouseUp(e);
          handlePointerUp(e);
        }}
        onMouseLeave={(e) => {
          handleMouseUp(e);
          handlePointerUp(e);
        }}
        onWheel={handleWheel}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handlePointerDown({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
        }}
        onTouchEnd={handlePointerUp}
      />

      {!isConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Desconectado</p>
              <p className="text-xs text-gray-300">Reintentando conexión...</p>
            </div>
          </div>
        </div>
      )}


      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
        {selectedTool === 'brush' && `Pincel (${brushSize}px)`}
        {selectedTool === 'eraser' && 'Borrador'}
        {selectedTool === 'fill' && 'Relleno'}
        {selectedTool === 'picker' && 'Selector de color'}
        {selectedTool === 'image' && 'Convertir imagen'}
      </div>

      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <button
          onClick={() => setZoom(Math.min(5, zoom * 1.2))}
          className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs hover:bg-opacity-90"
        >
          🔍+
        </button>
        <button
          onClick={() => setZoom(Math.max(0.1, zoom * 0.8))}
          className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs hover:bg-opacity-90"
        >
          🔍-
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs hover:bg-opacity-90"
        >
          ⌂
        </button>
      </div>

      {lastPixel && (
        <div className="absolute bottom-16 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          ({lastPixel.x}, {lastPixel.y})
        </div>
      )}
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;