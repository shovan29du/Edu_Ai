import React, { useEffect, useRef, useState } from 'react';

const TOOLS = ['pencil', 'brush', 'fill', 'eraser'];

function getPixelIndex(x, y, width) {
  return (y * width + x) * 4;
}

function colorsMatch(data, idx, target, tolerance = 32) {
  return (
    Math.abs(data[idx] - target[0]) <= tolerance &&
    Math.abs(data[idx + 1] - target[1]) <= tolerance &&
    Math.abs(data[idx + 2] - target[2]) <= tolerance &&
    Math.abs(data[idx + 3] - target[3]) <= tolerance
  );
}

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function floodFill(ctx, startX, startY, fillColor) {
  const canvas = ctx.canvas;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const startIdx = getPixelIndex(startX, startY, width);
  const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]];
  if (colorsMatch(data, startIdx, fillColor, 0)) return;

  const stack = [[startX, startY]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = getPixelIndex(x, y, width);
    if (!colorsMatch(data, idx, target)) continue;

    data[idx] = fillColor[0];
    data[idx + 1] = fillColor[1];
    data[idx + 2] = fillColor[2];
    data[idx + 3] = fillColor[3];

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(imageData, 0, 0);
}

export default function ColouringCanvas() {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#1d4ed8');
  const [brushSize, setBrushSize] = useState(6);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: Math.floor(clientX - rect.left), y: Math.floor(clientY - rect.top) };
  }

  function handlePointerDown(e) {
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);

    if (tool === 'fill') {
      floodFill(ctx, x, y, hexToRgba(color));
      return;
    }

    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (!drawingRef.current || tool === 'fill') return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineWidth = tool === 'brush' ? brushSize * 2 : brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawingRef.current = false;
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <section aria-label="Colouring canvas" className="rounded border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-lg font-bold">Colouring &amp; Drawing</h2>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Drawing tool">
          {TOOLS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tool === t}
              onClick={() => setTool(t)}
              className={`mr-1 rounded border px-2 py-1 capitalize focus:outline focus:outline-2 focus:outline-blue-500 ${
                tool === t ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1">
          <span className="text-sm">Colour</span>
          <input
            type="color"
            aria-label="Colour picker"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-1">
          <span className="text-sm">Size</span>
          <input
            type="range"
            min="1"
            max="30"
            aria-label="Brush size"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>

        <button
          type="button"
          onClick={handleClear}
          className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded border px-2 py-1 focus:outline focus:outline-2 focus:outline-blue-500"
        >
          Save as PNG
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        role="img"
        aria-label="Drawing area"
        className="touch-none rounded border bg-white"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </section>
  );
}
