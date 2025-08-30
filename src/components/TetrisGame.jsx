import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameBoard from './GameBoard';
import Sidebar from './Sidebar';

const ROWS = 20;
const COLS = 10;

const COLORS = {
  I: '#ef4444', // soft red accent
  O: '#f97316',
  T: '#22c55e',
  S: '#06b6d4',
  Z: '#eab308',
  J: '#8b5cf6',
  L: '#14b8a6',
  GHOST: 'rgba(255,255,255,0.15)',
  GRID: 'rgba(255,255,255,0.06)',
  EMPTY: 'transparent',
  FILLED: '#ffffff',
};

const SHAPES = {
  I: [
    [ [0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0] ],
    [ [0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0] ],
  ],
  O: [
    [ [1,1], [1,1] ],
  ],
  T: [
    [ [0,1,0], [1,1,1], [0,0,0] ],
    [ [0,1,0], [0,1,1], [0,1,0] ],
    [ [0,0,0], [1,1,1], [0,1,0] ],
    [ [0,1,0], [1,1,0], [0,1,0] ],
  ],
  S: [
    [ [0,1,1], [1,1,0], [0,0,0] ],
    [ [0,1,0], [0,1,1], [0,0,1] ],
  ],
  Z: [
    [ [1,1,0], [0,1,1], [0,0,0] ],
    [ [0,0,1], [0,1,1], [0,1,0] ],
  ],
  J: [
    [ [1,0,0], [1,1,1], [0,0,0] ],
    [ [0,1,1], [0,1,0], [0,1,0] ],
    [ [0,0,0], [1,1,1], [0,0,1] ],
    [ [0,1,0], [0,1,0], [1,1,0] ],
  ],
  L: [
    [ [0,0,1], [1,1,1], [0,0,0] ],
    [ [0,1,0], [0,1,0], [0,1,1] ],
    [ [0,0,0], [1,1,1], [1,0,0] ],
    [ [1,1,0], [0,1,0], [0,1,0] ],
  ],
};

const TYPES = Object.keys(SHAPES);

function newBag() {
  const bag = [...TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
}

export default function TetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [bag, setBag] = useState(newBag());
  const [nextPieceType, setNextPieceType] = useState(null);
  const [current, setCurrent] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const dropIntervalRef = useRef(null);

  const speed = useMemo(() => Math.max(100, 800 - (level - 1) * 70), [level]);

  const spawnPiece = useCallback((type) => {
    const t = type || (bag.length === 0 ? null : bag[0]);
    let nextBag = bag;
    if (!type) {
      nextBag = bag.slice(1);
      if (nextBag.length === 0) nextBag = newBag();
      setBag(nextBag);
    }
    const rotations = SHAPES[t];
    const matrix = rotations[0];
    const x = Math.floor((COLS - matrix[0].length) / 2);
    const y = -matrix.length; // start above board
    const color = COLORS[t] || COLORS.FILLED;
    const piece = { type: t, rotations, rotation: 0, matrix, x, y, color };
    setCurrent(piece);
  }, [bag]);

  const pickNext = useCallback(() => {
    const next = bag.length === 0 ? newBag()[0] : bag[0];
    setNextPieceType(next);
  }, [bag]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    const freshBag = newBag();
    setBag(freshBag);
    setNextPieceType(freshBag[1] || freshBag[0]);
    setCurrent(null);
  }, []);

  // Init
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Ensure a current and next
  useEffect(() => {
    if (!current && !gameOver && bag.length > 0) {
      spawnPiece();
      pickNext();
    }
  }, [current, gameOver, bag.length, spawnPiece, pickNext]);

  const collide = useCallback((brd, piece, offsetX = 0, offsetY = 0, mat = null) => {
    const m = mat || piece.matrix;
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x]) {
          const ny = piece.y + y + offsetY;
          const nx = piece.x + x + offsetX;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && brd[ny][nx]) return true;
        }
      }
    }
    return false;
  }, []);

  const merge = useCallback((brd, piece) => {
    const copy = brd.map((r) => r.slice());
    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix[y].length; x++) {
        if (piece.matrix[y][x]) {
          const by = piece.y + y;
          const bx = piece.x + x;
          if (by >= 0) copy[by][bx] = piece.color;
        }
      }
    }
    return copy;
  }, []);

  const clearLines = useCallback((brd) => {
    let cleared = 0;
    const newBoard = brd.filter((row) => {
      const full = row.every((cell) => !!cell);
      if (full) cleared += 1;
      return !full;
    });
    while (newBoard.length < ROWS) newBoard.unshift(Array.from({ length: COLS }, () => null));

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] || 0;
      setScore((s) => s + points * level);
      setLines((l) => {
        const total = l + cleared;
        const newLevel = 1 + Math.floor(total / 10);
        setLevel((lv) => (newLevel > lv ? newLevel : lv));
        return total;
      });
    }
    return newBoard;
  }, [level]);

  const hardDrop = useCallback(() => {
    if (!current || paused || gameOver) return;
    let distance = 0;
    while (!collide(board, current, 0, distance + 1)) {
      distance++;
    }
    const landed = { ...current, y: current.y + distance };
    const merged = merge(board, landed);
    const cleaned = clearLines(merged);
    setBoard(cleaned);
    spawnNextAfterLock();
  }, [board, clearLines, collide, current, gameOver, merge, paused]);

  const spawnNextAfterLock = useCallback(() => {
    const next = nextPieceType || bag[0];
    if (!next) return;
    const rotations = SHAPES[next];
    const matrix = rotations[0];
    const x = Math.floor((COLS - matrix[0].length) / 2);
    const y = -matrix.length;
    const color = COLORS[next] || COLORS.FILLED;
    const piece = { type: next, rotations, rotation: 0, matrix, x, y, color };
    if (collide(board, piece, 0, 0)) {
      setGameOver(true);
      setPaused(true);
      return;
    }
    setCurrent(piece);
    // advance bag and next
    const remaining = bag.length ? bag.slice(1) : newBag();
    setBag(remaining.length ? remaining : newBag());
    const newNext = remaining.length ? remaining[0] : newBag()[0];
    setNextPieceType(newNext);
  }, [bag, board, collide, nextPieceType]);

  const step = useCallback(() => {
    if (!current) return;
    if (!collide(board, current, 0, 1)) {
      setCurrent((p) => ({ ...p, y: p.y + 1 }));
    } else {
      const merged = merge(board, current);
      const cleaned = clearLines(merged);
      setBoard(cleaned);
      spawnNextAfterLock();
    }
  }, [board, clearLines, collide, current, merge, spawnNextAfterLock]);

  // Drop interval
  useEffect(() => {
    if (paused || gameOver || !current) return;
    if (dropIntervalRef.current) clearInterval(dropIntervalRef.current);
    dropIntervalRef.current = setInterval(step, speed);
    return () => clearInterval(dropIntervalRef.current);
  }, [paused, gameOver, speed, current, step]);

  // Controls
  useEffect(() => {
    const onKey = (e) => {
      if (gameOver) return;
      if (!current) return;
      if (e.key === 'p' || e.key === 'P') { setPaused((v) => !v); return; }
      if (paused) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!collide(board, current, -1, 0)) setCurrent((p) => ({ ...p, x: p.x - 1 }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!collide(board, current, 1, 0)) setCurrent((p) => ({ ...p, x: p.x + 1 }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!collide(board, current, 0, 1)) setCurrent((p) => ({ ...p, y: p.y + 1 }));
      } else if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        const nextRot = (current.rotation + 1) % current.rotations.length;
        const nextMat = current.rotations[nextRot];
        // wall kicks (simple)
        const kicks = [0, -1, 1, -2, 2];
        for (const k of kicks) {
          if (!collide(board, current, k, 0, nextMat)) {
            setCurrent((p) => ({ ...p, rotation: nextRot, matrix: nextMat, x: p.x + k }));
            break;
          }
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [board, collide, current, gameOver, hardDrop, paused]);

  const ghost = useMemo(() => {
    if (!current) return null;
    let dy = 0;
    while (!collide(board, current, 0, dy + 1)) dy++;
    return { ...current, y: current.y + dy };
  }, [board, collide, current]);

  const controls = {
    onPause: () => setPaused((v) => !v),
    onReset: () => resetGame(),
    onDrop: () => hardDrop(),
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <div className="rounded-2xl bg-neutral-900/60 border border-white/10 p-3 md:p-4">
        <GameBoard
          rows={ROWS}
          cols={COLS}
          board={board}
          current={current}
          ghost={ghost}
          colors={COLORS}
        />
      </div>
      <Sidebar
        score={score}
        level={level}
        lines={lines}
        paused={paused}
        gameOver={gameOver}
        nextType={nextPieceType}
        colors={COLORS}
        onPause={controls.onPause}
        onReset={controls.onReset}
        onDrop={controls.onDrop}
      />
    </div>
  );
}
