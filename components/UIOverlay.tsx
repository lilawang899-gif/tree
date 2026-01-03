
import React from 'react';
import { TreeState } from '../types';

interface Props {
  treeState: TreeState;
  onPhotoUpload: (url: string) => void;
  isCameraActive: boolean;
}

const UIOverlay: React.FC<Props> = ({ treeState, onPhotoUpload, isCameraActive }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onPhotoUpload(url);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="max-w-xs">
          <h2 className="text-2xl font-serif text-[#d4af37] leading-tight">THE GRAND CHRISTMAS ORCHESTRA</h2>
          <div className="h-px w-full bg-[#d4af37]/30 my-2" />
          <p className="text-xs text-[#d4af37]/70 uppercase tracking-widest">A Gesture-Controlled Generative Experience</p>
        </div>

        <div className="flex flex-col items-end gap-4">
           {!isCameraActive && (
               <div className="bg-[#B22222] text-white px-4 py-2 rounded-full text-xs animate-pulse">
                   INITIALIZING CAMERA...
               </div>
           )}
           <label className="bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] px-6 py-2 rounded-full cursor-pointer transition-all duration-300 pointer-events-auto backdrop-blur-sm">
             <span className="text-xs font-bold tracking-widest">+ ADD PHOTO MEMORY</span>
             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
           </label>
        </div>
      </div>

      {/* Guide */}
      <div className="flex justify-center mb-24">
         <div className="grid grid-cols-4 gap-8 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-[#d4af37]/20 pointer-events-auto">
            <div className="text-center">
                <div className="text-2xl mb-1">✊</div>
                <div className="text-[10px] text-[#d4af37]/50 uppercase">Recall Tree</div>
                <div className="text-xs font-bold">FIST</div>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-1">🖐️</div>
                <div className="text-[10px] text-[#d4af37]/50 uppercase">Release Elements</div>
                <div className="text-xs font-bold">OPEN HAND</div>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-1">👋</div>
                <div className="text-[10px] text-[#d4af37]/50 uppercase">Rotate Orbit</div>
                <div className="text-xs font-bold">MOVE HAND</div>
            </div>
            <div className="text-center">
                <div className="text-2xl mb-1">🤌</div>
                <div className="text-[10px] text-[#d4af37]/50 uppercase">Focus Memory</div>
                <div className="text-xs font-bold">PINCH</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UIOverlay;
