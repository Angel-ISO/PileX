import React from 'react';


const ToolSelector = ({ tools, selectedTool, onToolChange }) => {
  return (
    <div className="flex flex-col gap-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`
            w-12 h-12 rounded-lg border-2 transition-all duration-200
            flex items-center justify-center text-xl
            ${selectedTool === tool.id
              ? 'bg-blue-500 border-blue-400 text-white shadow-lg'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }
          `}
          title={tool.name}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default ToolSelector;