import React from 'react';


const BrushSizeSelector = ({ size, onSizeChange, min = 1, max = 10 }) => {
  const handleSizeChange = (newSize) => {
    const clampedSize = Math.max(min, Math.min(max, newSize));
    onSizeChange(clampedSize);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-400">Tamaño</div>

      <div className="text-sm font-bold text-white bg-gray-700 px-2 py-1 rounded">
        {size}px
      </div>

     

      <div className="flex gap-1 mt-2">
        {[1, 3, 5].map((preset) => (
          <button
            key={preset}
            onClick={() => handleSizeChange(preset)}
            className={`w-6 h-6 text-xs rounded border ${
              size === preset
                ? 'bg-blue-500 border-blue-400 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-center">
        <div
          className="bg-blue-500 rounded-full border-2 border-white"
          style={{
            width: `${Math.max(4, size * 2)}px`,
            height: `${Math.max(4, size * 2)}px`
          }}
        />
      </div>
    </div>
  );
};

export default BrushSizeSelector;