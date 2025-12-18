import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useStore } from '../../context/store.js';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import ColorPalette from './ColorPalette';
import BrushSizeSelector from './BrushSizeSelector';
import ToolSelector from './ToolSelector';
import ImageToPixelConverter from './ImageToPixelConverter';
import Header from '../common/head/Header.jsx';
import { useNavbarVisibility } from '../../hooks/useNavbarVisibility.js';
import { useNavigate } from 'react-router-dom';
import { PIXEL_SIZE, BASE_DISPLAY_SIZE, CANVAS_SIZE } from './pixelConfig';


const PixelCanvas = () => {
  const { state, dispatch  } = useStore();
  const { userSession } = state;
  const navigate = useNavigate();
   const userConfig = useMemo(() => ({
    name: userSession?.username || "Usuario",
    onProfile: () => navigate("/profile"),
    onLogout: () => {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("token");
      navigate("/");
    }
  }), [userSession?.username, navigate, dispatch]);

  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
  const {
    canvasState,
    connectedUsers,
    userStats,
    joinCanvas,
    paintPixel,
    paintPixelsBatch,
    getCanvasStats,
    isConnected,
    sendMessage
  , registerRemotePixelHandler, unregisterRemotePixelHandler } = useWebSocket(wsUrl);

  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState(1);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [showImageConverter, setShowImageConverter] = useState(false);

  const canvasRef = useRef(null);

  const tools = [
    { id: 'brush', name: 'Pincel', icon: '🖌️' },
    { id: 'eraser', name: 'Borrador', icon: '🧽' },
  ];

  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#D7BDE2',
    '#000000', '#FFFFFF', '#808080'
  ];

  useEffect(() => {
    if (isConnected && userSession.authenticated) {
      console.log('Joining canvas...');
      joinCanvas();

      setTimeout(() => {
        console.log('Solicitando estado del canvas...');
        sendMessage('getCanvasState');
      }, 1000);
    }
  }, [isConnected, userSession.authenticated, joinCanvas, sendMessage]);

  useEffect(() => {
    if (isConnected && userSession.authenticated && !canvasState) {
      console.log('Auto-joining canvas for authenticated user...');
      joinCanvas();
    }
  }, [isConnected, userSession.authenticated, canvasState, joinCanvas]);

  useEffect(() => {
    if (isConnected && userSession.authenticated && !canvasState) {
      console.log('Immediate fallback: Requesting canvas state...');
      sendMessage('getCanvasState');
    }
  }, [isConnected, userSession.authenticated, canvasState, sendMessage]);

  useEffect(() => {
    if (canvasState) {
      console.log('Canvas state updated:', {
        width: canvasState.width,
        height: canvasState.height,
        hasCanvas: !!canvasState.canvas,
        canvasType: Array.isArray(canvasState.canvas) ? 'ARRAY' : typeof canvasState.canvas,
        canvasLength: Array.isArray(canvasState.canvas) ? canvasState.canvas.length : 'N/A',
        firstRowLength: Array.isArray(canvasState.canvas) && canvasState.canvas.length > 0 ? canvasState.canvas[0].length : 'N/A',
        samplePixel: Array.isArray(canvasState.canvas) && canvasState.canvas.length > 0 && canvasState.canvas[0].length > 0 ? canvasState.canvas[0][0] : 'N/A',
        stats: canvasState.stats
      });

      if (Array.isArray(canvasState.canvas) && canvasState.canvas.length > 0) {
        const firstRow = canvasState.canvas[0];
        if (Array.isArray(firstRow)) {
          console.log(`Canvas validation: First row has ${firstRow.length} pixels`);
          console.log(`Canvas validation: Expected ${CANVAS_SIZE} pixels, got ${firstRow.length}`);
          console.log(`Canvas validation: Total canvas size: ${canvasState.canvas.length} x ${firstRow.length} = ${canvasState.canvas.length * firstRow.length} pixels`);

          if (canvasState.canvas.length === CANVAS_SIZE && firstRow.length === CANVAS_SIZE) {
            console.log(`Canvas dimensions are correct: ${CANVAS_SIZE}x${CANVAS_SIZE}`);
            console.log('Canvas should now be visible in the frontend!');
            console.log('If canvas is still not visible, check for rendering errors in GameCanvas component');
            console.log('Check browser console for any JavaScript errors in GameCanvas.jsx');
            console.log('The canvas state has been successfully received and validated!');
            console.log('READY TO DRAW! Try clicking on the canvas to paint pixels.');
          } else {
            console.log(`❌ Canvas dimensions mismatch: ${canvasState.canvas.length}x${firstRow.length} (expected ${CANVAS_SIZE}x${CANVAS_SIZE})`);
            console.log('🔧 Backend is sending wrong canvas dimensions - check PixelCanvas initialization');
            console.log('💡 Try restarting the backend server to reinitialize PixelCanvas');
            console.log('🔄 If restarting doesn\'t work, check PixelCanvas constructor parameters');
            console.log('📝 Check the PixelCanvas constructor in backend/src/core/game/PixelCanvas.js');
          }
        } else {
          console.log('❌ Canvas validation: First row is not an array');
        }
      } else {
        console.log('❌ Canvas validation: Canvas is not a valid array');
      }
    } else {
      console.log('🎨 Canvas state is null/undefined');
    }
  }, [canvasState]);

  const handlePixelPaint = useCallback((x, y) => {
    if (!isConnected || !userSession.authenticated) return;

    let colorToPaint = selectedColor;

    switch (selectedTool) {
      case 'eraser':
        colorToPaint = '#FFFFFF'; 
        break;
      case 'picker':
       
        return;
      case 'fill':
        handleFill(x, y, selectedColor);
        return;
      default:
        break;
    }

    if (brushSize === 1) {
      // optimistic local draw
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = colorToPaint;
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      } catch (err) {
        console.error('Optimistic local draw error', err);
      }

      paintPixel(x, y, colorToPaint);
    } else {
      const pixels = [];
      const radius = Math.floor(brushSize / 2);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const pixelX = x + dx;
          const pixelY = y + dy;

          if (pixelX >= 0 && pixelX < CANVAS_SIZE && pixelY >= 0 && pixelY < CANVAS_SIZE) {
            pixels.push({ x: pixelX, y: pixelY, color: colorToPaint });
          }
        }
      }

      // optimistic draw for batch: draw each pixel locally in small chunks
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          for (const p of pixels) {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x * PIXEL_SIZE, p.y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          }
        }
      } catch (err) {
        console.error('Optimistic batch draw error', err);
      }

      paintPixelsBatch(pixels);
    }
  }, [selectedColor, brushSize, selectedTool, isConnected, userSession.authenticated, paintPixel, paintPixelsBatch]);

  const handleFill = useCallback((startX, startY, fillColor) => {
    if (!canvasState?.canvas) return;

    const canvas = canvasState.canvas;
    const targetColor = canvas[startY]?.[startX];

    if (!targetColor || targetColor === fillColor) return;

    const pixels = [];
    const visited = new Set();
    const queue = [{ x: startX, y: startY }];

    while (queue.length > 0 && pixels.length < 10000) { 
      const { x, y } = queue.shift();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);

  if (x < 0 || x >= CANVAS_SIZE || y < 0 || y >= CANVAS_SIZE) continue;
      if (canvas[y][x] !== targetColor) continue;

      pixels.push({ x, y, color: fillColor });

      queue.push({ x: x + 1, y });
      queue.push({ x: x - 1, y });
      queue.push({ x, y: y + 1 });
      queue.push({ x, y: y - 1 });
    }

    if (pixels.length > 0) {
      paintPixelsBatch(pixels);
    }
  }, [canvasState, paintPixelsBatch]);

  const handleImageConverted = useCallback((pixels) => {
    if (pixels && pixels.length > 0) {
      console.log(`🎨 Painting ${pixels.length} pixels from image`);
      paintPixelsBatch(pixels);
      setShowImageConverter(false);
    }
  }, [paintPixelsBatch]);

  const handleToolChange = useCallback((toolId) => {
    setSelectedTool(toolId);
    if (toolId === 'image') {
      setShowImageConverter(true);
    } else {
      setShowImageConverter(false);
    }
  }, []);

  const handleColorPick = useCallback((color) => {
    setSelectedColor(color);
    setSelectedTool('brush'); 
  }, []);

  const currentUser = connectedUsers.find(user => user.id === userStats?.userId);

  return (
<div className="flex flex-col w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="flex-shrink-0 h-16 z-30">
        <Header
          title="pileX Board"
          isVisible={true}
          isGameView={false}
          userConfig={userConfig}
        />
      </div>

      <div className="flex flex-1 overflow-hidden pt-2">
        <div className="w-20 bg-black/30 backdrop-blur-sm flex flex-col items-center py-4 gap-4 border-r border-gray-700/50">
          <ToolSelector
            tools={tools}
            selectedTool={selectedTool}
            onToolChange={handleToolChange}
          />

          <ColorPalette
            colors={colorPalette}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />

          <BrushSizeSelector
            size={brushSize}
            onSizeChange={setBrushSize}
            min={1}
            max={10}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 pt-6">
          <div style={{ width: `${BASE_DISPLAY_SIZE}px`, height: `${BASE_DISPLAY_SIZE}px`, overflow: 'hidden' }}>
            <GameCanvas
              ref={canvasRef}
              canvasState={canvasState}
              onPixelPaint={handlePixelPaint}
              onColorPick={handleColorPick}
              selectedTool={selectedTool}
              brushSize={brushSize}
              selectedColor={selectedColor}
              isConnected={isConnected}
              onRemotePixelsRegister={registerRemotePixelHandler}
              onRemotePixelsUnregister={unregisterRemotePixelHandler}
            />
          </div>
        </div>

  <div className="w-64 bg-gray-900 p-4 border-l border-gray-700 text-white flex-shrink-0 z-10">
          <GameUI
            canvasState={canvasState}
            connectedUsers={connectedUsers}
            currentUser={currentUser}
            userStats={userStats}
            onGetStats={getCanvasStats}
          />
        </div>
      </div>

      {showImageConverter && (
        <ImageToPixelConverter
          onImageConverted={handleImageConverted}
          onClose={() => setShowImageConverter(false)}
          maxCanvasSize={CANVAS_SIZE}
        />
      )}

    </div>
  );
};

export default PixelCanvas;