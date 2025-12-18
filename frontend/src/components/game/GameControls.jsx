import React from 'react';


const GameControls = ({ onJoinCanvas, onGetStats, isConnected, canvasState }) => {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-white text-sm">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        <div className="space-y-2">
          {!canvasState && (
            <button
              onClick={onJoinCanvas}
              disabled={!isConnected}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
                         disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              🎨 Unirse al Canvas
            </button>
          )}

          <button
            onClick={onGetStats}
            disabled={!isConnected}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700
                       disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            📊 Actualizar Estadísticas
          </button>
        </div>

        {canvasState && (
          <div className="text-xs text-gray-300 border-t border-gray-600 pt-2">
            <div>Canvas: {canvasState.width}x{canvasState.height}</div>
            <div>Píxeles pintados: {canvasState.stats?.paintedPixels || 0}</div>
          </div>
        )}

        <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
          <div className="font-semibold mb-1">Controles:</div>
          <div>• Click para pintar</div>
          <div>• Arrastre para líneas</div>
          <div>• Usa las herramientas del panel izquierdo</div>
        </div>
      </div>
    </div>
  );
};

export default GameControls;