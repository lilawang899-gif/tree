
import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TreeState, HandData, PhotoItem } from '../types';
import TreeParticles from './TreeParticles';
import PhotoCloud from './PhotoCloud';
import { COLORS } from '../constants';

interface SceneProps {
  treeState: TreeState;
  handData: HandData | null;
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  setSelectedPhotoId: (id: string | null) => void;
  setTreeState: (state: TreeState) => void;
}

const PostProcessing = () => {
  // Simple custom post-processing via Three.js default if needed, 
  // but let's stick to standard high-quality materials for performance in this demo
  return null;
};

const LightRig = () => (
  <>
    <ambientLight intensity={0.3} />
    <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color={COLORS.METALLIC_GOLD} castShadow />
    <pointLight position={[-10, -10, -10]} intensity={1} color={COLORS.EMERALD_GREEN} />
    <directionalLight position={[0, 10, 5]} intensity={1.5} color={COLORS.SILVER_WHITE} />
  </>
);

const SceneContent: React.FC<SceneProps> = ({ treeState, handData, photos, selectedPhotoId, setSelectedPhotoId, setTreeState }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame((state) => {
    if (handData && treeState === TreeState.SCATTERED) {
      // Rotation control via hand
      const targetRotation = (handData.position.x - 0.5) * 2;
      const targetPitch = (handData.position.y - 0.5) * -1;
      
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetRotation * 15, 0.05);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetPitch * 10 + 5, 0.05);
      state.camera.lookAt(0, 5, 0);
    } else if (treeState === TreeState.CLOSED) {
      // Auto orbit
      const t = state.clock.getElapsedTime() * 0.2;
      state.camera.position.x = Math.sin(t) * 15;
      state.camera.position.z = Math.cos(t) * 15;
      state.camera.position.y = 8;
      state.camera.lookAt(0, 5, 0);
    }
  });

  return (
    <>
      <LightRig />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <TreeParticles treeState={treeState} />
      
      <PhotoCloud 
        photos={photos} 
        treeState={treeState} 
        selectedPhotoId={selectedPhotoId}
        setSelectedPhotoId={setSelectedPhotoId}
        setTreeState={setTreeState}
        handData={handData}
      />

      <ContactShadows opacity={0.4} scale={20} blur={2} far={10} resolution={256} color="#000000" />
      <Environment preset="night" />
    </>
  );
};

const Scene: React.FC<SceneProps> = (props) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={45} />
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
