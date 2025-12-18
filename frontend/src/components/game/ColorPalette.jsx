import React from 'react';


const ColorPalette = ({ colors, selectedColor, onColorChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-gray-400 text-center mb-1">Colores</div>
      <div className="grid grid-cols-3 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              w-8 h-8 rounded border-2 transition-all duration-200
              ${selectedColor === color
                ? 'border-white shadow-lg scale-110'
                : 'border-gray-600 hover:border-gray-400'
              }
            `}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="mt-2">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-8 rounded border border-gray-600 cursor-pointer"
          title="Color personalizado"
        />
      </div>
    </div>
  );
};

export default ColorPalette;