import { useEffect, useRef } from 'react';

export default function GameBoard({ rows, cols, board, current, ghost, colors }) {
  const canvasRef = useRef(null);
  const size = typeof window !== 'undefined' && window.innerWidth < 480 ? 22 : 28;
  const width = cols * size;
  const height = rows * size;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Background
    ctx.fillStyle = 'rgba(10,10,10,0.8)';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = colors.GRID;
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * size + 0.5, 0);
      ctx.lineTo(x * size + 0.5, height);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * size + 0.5);
      ctx.lineTo(width, y * size + 0.5);
      ctx.stroke();
    }

    const drawCell = (x, y, color, alpha = 1) => {
      if (y < 0) return;
      const px = x * size;
      const py = y * size;
      ctx.save();
      ctx.globalAlpha = alpha;
      // Tile background (white tile
      ctx.fillStyle = '#ffffff10';
      ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
      // Actual block
      ctx.fillStyle = color;
      ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
      // Bevel
      const grd = ctx.createLinearGradient(px, py, px, py + size);
      grd.addColorStop(0, 'rgba(255,255,255,0.35)');
      grd.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = grd;
      ctx.fillRect(px + 2, py + 2, size - 4, (size - 4) * 0.35);
      ctx.restore();
    };

    // Board filled cells
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const c = board[y][x];
        if (c) drawCell(x, y, c);
      }
    }

    // Ghost
    if (ghost) {
      for (let y = 0; y < ghost.matrix.length; y++) {
        for (let x = 0; x < ghost.matrix[y].length; x++) {
          if (ghost.matrix[y][x]) drawCell(ghost.x + x, ghost.y + y, colors.GHOST, 1);
        }
      }
    }

    // Current
    if (current) {
      for (let y = 0; y < current.matrix.length; y++) {
        for (let x = 0; x < current.matrix[y].length; x++) {
          if (current.matrix[y][x]) drawCell(current.x + x, current.y + y, current.color, 1);
        }
      }
    }

    // Frame
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, [board, cols, colors.GHOST, colors.GRID, height, width, current, ghost, rows, size]);

  return (
    <div className="flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-lg shadow-lg shadow-black/40" />
    </div>
  );
}
