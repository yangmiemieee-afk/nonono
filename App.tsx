import React from 'react';
import Scene from './components/Scene';
import { UI } from './components/UI';

function App() {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden selection:bg-yellow-500/30">
      <UI />
      <Scene />
    </div>
  );
}

export default App;