import React, { useState, useRef, useCallback } from 'react';


const ImageToPixelConverter = ({ onImageConverted, onClose, maxCanvasSize = 500 }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState({
    maxSize: 100,
    dithering: false,
    colorReduction: false
  });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande (máximo 5MB)');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const convertImage = useCallback(async () => {
    if (!selectedFile || !preview) return;

    setIsProcessing(true);
    setProgress(10);

    try {
      const pixels = await processImageToPixels(selectedFile, settings.maxSize);
      setProgress(90);

      if (onImageConverted) {
        onImageConverted(pixels);
      }

      setProgress(100);
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('Error converting image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [selectedFile, preview, settings.maxSize, onImageConverted, onClose]);

  const processImageToPixels = useCallback((file, maxSize) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          const { width, height } = calculateDimensions(
            img.width,
            img.height,
            maxSize,
            maxSize
          );

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const pixels = extractPixelsFromImageData(imageData, width, height);

          resolve(pixels);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
    const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    return {
      width: Math.floor(originalWidth * ratio),
      height: Math.floor(originalHeight * ratio)
    };
  };

  const extractPixelsFromImageData = (imageData, width, height) => {
    const pixels = [];
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (a < 128) continue;

        const canvasX = Math.floor((maxCanvasSize - width) / 2) + x;
        const canvasY = Math.floor((maxCanvasSize - height) / 2) + y;

        if (canvasX >= 0 && canvasX < maxCanvasSize &&
            canvasY >= 0 && canvasY < maxCanvasSize) {

          pixels.push({
            x: canvasX,
            y: canvasY,
            color: rgbToHex(r, g, b)
          });
        }
      }
    }

    return pixels;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Convertir Imagen a Píxeles</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* File Input */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            📸 Seleccionar Imagen
          </button>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">Vista previa:</div>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-contain bg-gray-700 rounded border"
            />
          </div>
        )}

        {/* Settings */}
        {selectedFile && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Tamaño máximo: {settings.maxSize}px
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={settings.maxSize}
                onChange={(e) => handleSettingChange('maxSize', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dithering"
                checked={settings.dithering}
                onChange={(e) => handleSettingChange('dithering', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="dithering" className="text-sm text-gray-300">
                Dithering (mejor calidad)
              </label>
            </div>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">Procesando imagen...</div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Cancelar
          </button>

          <button
            onClick={convertImage}
            disabled={!selectedFile || isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                       disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isProcessing ? 'Procesando...' : 'Convertir'}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-400">
          <div>• Máximo 5MB por imagen</div>
          <div>• La imagen se centrará en el canvas</div>
          <div>• Los píxeles transparentes se omitirán</div>
        </div>
      </div>
    </div>
  );
};

export default ImageToPixelConverter;