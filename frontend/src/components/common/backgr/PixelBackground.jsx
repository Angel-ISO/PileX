import React, { useEffect, useRef } from 'react';

const PixelBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const pixelSize = 4;
    const gridWidth = Math.ceil(canvas.width / pixelSize);
    const gridHeight = Math.ceil(canvas.height / pixelSize);

    const pixelColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#FF8C42', '#F67280', '#00A8E8', '#FF5E5B', '#6B5B95'
    ];

    const pixels = [];
    const activePixels = new Set();

    const createPixels = () => {
      pixels.length = 0;
      activePixels.clear();

      const numActivePixels = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));

      for (let i = 0; i < numActivePixels; i++) {
        const x = Math.floor(Math.random() * gridWidth);
        const y = Math.floor(Math.random() * gridHeight);
        const color = pixelColors[Math.floor(Math.random() * pixelColors.length)];

        pixels.push({
          x,
          y,
          color,
          brightness: Math.random() * 0.5 + 0.5, 
          life: Math.random() * 300 + 100, 
          maxLife: Math.random() * 300 + 100,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2
        });

        activePixels.add(`${x},${y}`);
      }
    };

    const drawPixel = (pixel, alpha = 1) => {
      const screenX = pixel.x * pixelSize;
      const screenY = pixel.y * pixelSize;

      const brightness = pixel.brightness * (pixel.life / pixel.maxLife);
      const r = parseInt(pixel.color.slice(1, 3), 16);
      const g = parseInt(pixel.color.slice(3, 5), 16);
      const b = parseInt(pixel.color.slice(5, 7), 16);

      const brightR = Math.min(255, Math.floor(r * brightness));
      const brightG = Math.min(255, Math.floor(g * brightness));
      const brightB = Math.min(255, Math.floor(b * brightness));

      ctx.fillStyle = `rgba(${brightR}, ${brightG}, ${brightB}, ${alpha})`;
      ctx.fillRect(screenX, screenY, pixelSize, pixelSize);

      ctx.strokeStyle = `rgba(${brightR}, ${brightG}, ${brightB}, ${alpha * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(screenX, screenY, pixelSize, pixelSize);
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < canvas.width; x += pixelSize * 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += pixelSize * 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const createBrushStroke = () => {
      if (Math.random() < 0.02) { 
        const startX = Math.floor(Math.random() * gridWidth);
        const startY = Math.floor(Math.random() * gridHeight);
        const length = Math.floor(Math.random() * 8) + 3; 
        const direction = Math.floor(Math.random() * 4);

        for (let i = 0; i < length; i++) {
          let x = startX;
          let y = startY;

          switch (direction) {
            case 0: y -= i; break; 
            case 1: x += i; break; 
            case 2: y += i; break; 
            case 3: x -= i; break; 
          }

          if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
            const key = `${x},${y}`;
            if (!activePixels.has(key)) {
              const color = pixelColors[Math.floor(Math.random() * pixelColors.length)];
              pixels.push({
                x,
                y,
                color,
                brightness: Math.random() * 0.8 + 0.2,
                life: Math.random() * 200 + 50,
                maxLife: Math.random() * 200 + 50,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                phase: Math.random() * Math.PI * 2
              });
              activePixels.add(key);
            }
          }
        }
      }
    };

    const updatePixels = () => {
      for (let i = pixels.length - 1; i >= 0; i--) {
        const pixel = pixels[i];

        pixel.life--;

        pixel.phase += pixel.twinkleSpeed;
        pixel.brightness = 0.3 + 0.7 * (Math.sin(pixel.phase) * 0.5 + 0.5);

        if (pixel.life <= 0) {
          activePixels.delete(`${pixel.x},${pixel.y}`);
          pixels.splice(i, 1);
        }
      }

      if (pixels.length < 150 && Math.random() < 0.1) {
        const x = Math.floor(Math.random() * gridWidth);
        const y = Math.floor(Math.random() * gridHeight);
        const key = `${x},${y}`;

        if (!activePixels.has(key)) {
          const color = pixelColors[Math.floor(Math.random() * pixelColors.length)];
          pixels.push({
            x,
            y,
            color,
            brightness: Math.random() * 0.5 + 0.5,
            life: Math.random() * 400 + 200,
            maxLife: Math.random() * 400 + 200,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            phase: Math.random() * Math.PI * 2
          });
          activePixels.add(key);
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      createBrushStroke();

      updatePixels();
      pixels.forEach(pixel => drawPixel(pixel));

      animationRef.current = requestAnimationFrame(animate);
    };

    createPixels();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-15"
      style={{ background: 'transparent' }}
    />
  );
};

export default PixelBackground;