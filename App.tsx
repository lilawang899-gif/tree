
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TreeState, HandData, PhotoItem } from './types';
import Scene from './components/Scene';
import HandManager from './components/HandManager';
import UIOverlay from './components/UIOverlay';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CLOSED);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const handleHandUpdate = useCallback((data: HandData) => {
    setHandData(data);
    
    // Logic for State Transitions based on Hand Gestures
    if (data.isFist && treeState !== TreeState.CLOSED) {
      setTreeState(TreeState.CLOSED);
      setSelectedPhotoId(null);
    } else if (data.isOpen && treeState === TreeState.CLOSED) {
      setTreeState(TreeState.SCATTERED);
    } else if (data.isPinching && treeState === TreeState.SCATTERED && photos.length > 0) {
      // Find nearest photo logic would be inside the 3D component usually
      // For state management, we just trigger the mode
      setTreeState(TreeState.PHOTO_ZOOM);
    }
  }, [treeState, photos.length]);

  const onPhotoUpload = (url: string) => {
    setPhotos(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url }]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#01160d]">
      {/* 3D Scene */}
      <Scene 
        treeState={treeState} 
        handData={handData} 
        photos={photos}
        selectedPhotoId={selectedPhotoId}
        setSelectedPhotoId={setSelectedPhotoId}
        setTreeState={setTreeState}
      />

      {/* Camera & Hand Tracking Component (Invisible mostly) */}
      <div className={`absolute top-4 right-4 w-48 h-36 rounded-xl border-2 border-[#d4af37] overflow-hidden transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}>
        <HandManager onUpdate={handleHandUpdate} onActive={setIsCameraActive} />
      </div>

      {/* UI Overlay */}
      <UIOverlay 
        treeState={treeState} 
        onPhotoUpload={onPhotoUpload} 
        isCameraActive={isCameraActive}
      />

      {/* State Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-4xl font-serif glitter-text mb-2 uppercase tracking-widest font-bold">
          {treeState === TreeState.CLOSED ? "Harmonious Union" : treeState === TreeState.SCATTERED ? "Ethereal Chaos" : "Focused Memory"}
        </h1>
        <p className="text-[#d4af37]/60 text-sm tracking-widest">
          {treeState === TreeState.CLOSED ? "OPEN PALM TO EXPLODE" : treeState === TreeState.SCATTERED ? "FIST TO RECALL | PINCH TO FOCUS" : "FIST TO EXIT"}
        </p>
      </div>
    </div>
  );
};

export default App;
