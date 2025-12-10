import React from 'react';
import { useStore } from '../store';
import HandTracker from './HandTracker';

export const UI = () => {
  const { isCameraOpen, setCameraOpen, uploadPhotos } = useStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls: string[] = [];
      Array.from(e.target.files).forEach(file => {
          newUrls.push(URL.createObjectURL(file as Blob));
      });
      uploadPhotos(newUrls);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <>
      <main className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
        
        {/* Header */}
        <header className="flex justify-end items-start w-full">
          {/* Camera Controls */}
          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <button
              onClick={() => setCameraOpen(!isCameraOpen)}
              className={`px-4 py-1.5 text-xs rounded-full font-medium transition-all duration-300 ${
                isCameraOpen 
                  ? 'bg-red-500/20 text-red-200 border-red-500/50 hover:bg-red-500/40' 
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 hover:bg-emerald-500/40'
              } border backdrop-blur-md shadow-lg`}
            >
              {isCameraOpen ? 'CLOSE CAMERA' : 'ENABLE GESTURES'}
            </button>
            
            <HandTracker />
          </div>
        </header>

        {/* Footer Controls */}
        <footer className="flex justify-between items-end">
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/5 text-white/80 max-w-xs pointer-events-auto">
             <h3 className="text-xs font-bold text-yellow-100 mb-2 border-b border-white/10 pb-1">Interaction Guide</h3>
             <ul className="space-y-1 text-xs font-light">
                <li className="flex items-center gap-2">
                    <span className="bg-white/20 p-0.5 px-1 rounded text-[10px]">MOUSE</span>
                    Hover tree to scatter
                </li>
                <li className="flex items-center gap-2">
                    <span className="bg-emerald-500/30 text-emerald-200 p-0.5 px-1 rounded text-[10px]">HAND ✋</span>
                    <b>Open Palm:</b> Explode / Swipe
                </li>
                <li className="flex items-center gap-2">
                    <span className="bg-red-500/30 text-red-200 p-0.5 px-1 rounded text-[10px]">HAND ✊</span>
                    <b>Closed Fist:</b> Reset
                </li>
             </ul>
          </div>

          <div className="pointer-events-auto">
            <label className="cursor-pointer group flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 transition-all scale-90 origin-bottom-right">
                <div className="bg-white/20 p-1.5 rounded-full group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-white">Upload Photos</p>
                    <p className="text-[10px] text-gray-300">Select up to 12</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </footer>
      </main>
    </>
  );
};