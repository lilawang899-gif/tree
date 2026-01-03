
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TreeState, PhotoItem, HandData } from '../types';

interface PhotoCloudProps {
  photos: PhotoItem[];
  treeState: TreeState;
  selectedPhotoId: string | null;
  setSelectedPhotoId: (id: string | null) => void;
  setTreeState: (state: TreeState) => void;
  handData: HandData | null;
}

const PhotoItemComp: React.FC<{
    photo: PhotoItem; 
    index: number; 
    treeState: TreeState; 
    isSelected: boolean;
    onSelect: () => void;
    handData: HandData | null;
}> = ({ photo, index, treeState, isSelected, onSelect, handData }) => {
    const meshRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    const positions = useMemo(() => {
        // Closed state: spiral around the tree
        const height = (index / 20) * 10;
        const angle = (index / 20) * Math.PI * 4;
        const radius = (1 - height/12) * 5 + 0.5;
        const closed = new THREE.Vector3(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
        
        // Scattered
        const scattered = new THREE.Vector3((Math.random()-0.5)*25, (Math.random()-0.5)*25 + 5, (Math.random()-0.5)*25);
        
        return { closed, scattered };
    }, [index]);

    useFrame((state) => {
        if (!meshRef.current) return;

        let targetPos = treeState === TreeState.CLOSED ? positions.closed : positions.scattered;
        let targetScale = 1;

        if (isSelected && treeState === TreeState.PHOTO_ZOOM) {
            const camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);
            targetPos = camera.position.clone().add(camDir.multiplyScalar(3));
            targetScale = 2.5;
            meshRef.current.lookAt(camera.position);
        } else {
            meshRef.current.lookAt(0, 5, 0);
        }

        meshRef.current.position.lerp(targetPos, 0.08);
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Pinch interaction: check proximity if hand is pinching
        if (handData?.isPinching && treeState === TreeState.SCATTERED) {
            // Check distance from hand center (projected)
            // Simplified: if pinching, and hand is roughly in front of photo
            // For a production app, we would raycast from the hand position.
        }
    });

    return (
        <group ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <Image url={photo.url} transparent opacity={0.9} side={THREE.DoubleSide} />
            <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1.1, 1.1]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
            </mesh>
        </group>
    );
};

const PhotoCloud: React.FC<PhotoCloudProps> = ({ photos, treeState, selectedPhotoId, setSelectedPhotoId, setTreeState, handData }) => {
  return (
    <group>
      {photos.map((photo, i) => (
        <PhotoItemComp 
            key={photo.id} 
            photo={photo} 
            index={i} 
            treeState={treeState} 
            isSelected={selectedPhotoId === photo.id}
            onSelect={() => {
                setSelectedPhotoId(photo.id);
                setTreeState(TreeState.PHOTO_ZOOM);
            }}
            handData={handData}
        />
      ))}
    </group>
  );
};

export default PhotoCloud;
