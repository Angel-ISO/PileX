import React, { useEffect, useState } from 'react';


const GameUI = ({ canvasState, connectedUsers, currentUser, userStats, onGetStats }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (onGetStats) {
      onGetStats();
    }
  }, [onGetStats]);

  useEffect(() => {
    if (canvasState?.stats) {
      setStats(canvasState.stats);
    }
  }, [canvasState]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="h-full flex flex-col text-white">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">pileX Canvas</h2>
        <div className="text-sm text-gray-300">
          Dibujo colaborativo en tiempo real
        </div>
      </div>

      {stats && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Estadísticas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Píxeles pintados:</span>
              <span className="font-mono">{formatNumber(stats.paintedPixels)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progreso:</span>
              <span className="font-mono">{stats.paintedPercentage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Usuarios:</span>
              <span className="font-mono">{stats.connectedUsers}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: stats.paintedPercentage }}
              />
            </div>
          </div>
        </div>
      )}

      {currentUser && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Tu información</h3>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">{currentUser.username}</span>
            </div>
            <div className="text-xs text-gray-400">
              Conectado desde: {new Date(currentUser.connectedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Connected Users */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">
          Usuarios Conectados ({connectedUsers.length})
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {connectedUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                user.id === currentUser?.id
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              } transition-colors`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.username}
                  {user.id === currentUser?.id && (
                    <span className="text-xs text-blue-300 ml-1">(tú)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(user.connectedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {connectedUsers.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <div className="text-sm">No hay usuarios conectados</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="text-xs text-gray-500 text-center">
          pileX v1.0 - Dibujo colaborativo
        </div>
      </div>
    </div>
  );
};

export default GameUI;