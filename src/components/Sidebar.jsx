import { useEffect, useRef } from 'react';

const SHAPES = {
  I: [ [0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0] ],
  O: [ [1,1], [1,1] ],
  T: [ [0,1,0], [1,1,1], [0,0,0] ],
  S: [ [0,1,1], [1,1,0], [0,0,0] ],
  Z: [ [1,1,0], [0,1,1], [0,0,0] ],
  J: [ [1,0,0], [1,1,1], [0,0,0] ],
  L: [ [0,0,1], [1,1,1], [0,0,0] ],
};

export default function Sidebar({ score, level, lines, paused, gameOver, nextType, colors, onPause, onReset, onDrop }) {
  const miniRef = useRef(null);

  useEffect(() => {
    const canvas = miniRef.current;
    const ctx = canvas.getContext('2d');
    const size = 18;
    const grid = 6;
    const width = grid * size;
    const height = grid * size;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // bg
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(20,20,20,0.8)';
    ctx.fillRect(0, 0, width, height);

    if (!nextType) return;
    const matrix = SHAPES[nextType];

    // center matrix
    const mw = matrix[0].length;
    const mh = matrix.length;
    const offsetX = Math.floor((grid - mw) / 2);
    const offsetY = Math.floor((grid - mh) / 2);

    const drawCell = (x, y) => {
      const px = (x + offsetX) * size;
      const py = (y + offsetY) * size;
      ctx.fillStyle = colors[nextType] || '#fff';
      ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    };

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) drawCell(x, y);
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(1, 1, width - 2, height - 2);
  }, [colors, nextType]);

  return (
    <aside className="rounded-2xl bg-neutral-900/60 border border-white/10 p-5 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold">Session</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-neutral-400">Score</div>
            <div className="text-lg font-bold">{score}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-neutral-400">Level</div>
            <div className="text-lg font-bold">{level}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-neutral-400">Lines</div>
            <div className="text-lg font-bold">{lines}</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm text-neutral-400">Next</h3>
        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-center">
          <canvas ref={miniRef} className="rounded" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        <button onClick={onDrop} className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition">Drop ⏬</button>
        <button onClick={onPause} className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700 transition">{paused ? 'Resume' : 'Pause'} ⏯</button>
        <button onClick={onReset} className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700 transition">Reset ♻️</button>
      </div>

      <div className="text-xs text-neutral-400">
        {gameOver ? (
          <div className="text-red-300 font-medium">Game Over — press Reset to play again.</div>
        ) : (
          <ul className="list-disc pl-4 space-y-1">
            <li>← → move</li>
            <li>↑ rotate</li>
            <li>↓ soft drop</li>
            <li>Space hard drop</li>
            <li>P pause</li>
          </ul>
        )}
      </div>
    </aside>
  );
}
