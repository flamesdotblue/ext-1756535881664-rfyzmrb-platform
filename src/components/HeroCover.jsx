import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <header className="relative w-full h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80 pointer-events-none" />
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Tetrisphere
          </h1>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            An innovative spin on Tetris with a minimalist, tactile interface. Tap, click, or hover the cover to ripple the grid, then dive into the game below.
          </p>
        </div>
      </div>
    </header>
  );
}
