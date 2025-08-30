import HeroCover from './components/HeroCover';
import TetrisGame from './components/TetrisGame';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroCover />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-16">
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <TetrisGame />
        </section>
      </main>
    </div>
  );
}
