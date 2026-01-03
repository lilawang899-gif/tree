
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { COLORS, TREE_CONFIG } from '../constants';

const TreeParticles: React.FC<{ treeState: TreeState }> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const snowRef = useRef<THREE.Points>(null);

  const numItems = TREE_CONFIG.ELEMENT_COUNT;
  
  // Pre-calculate positions for states
  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < numItems; i++) {
      // Target position: Cone
      const height = Math.random() * TREE_CONFIG.HEIGHT;
      const ratio = 1 - height / TREE_CONFIG.HEIGHT;
      const radius = ratio * TREE_CONFIG.RADIUS;
      const angle = Math.random() * Math.PI * 2;
      
      const targetPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Scattered position
      const scatteredPos = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );

      items.push({
        target: targetPos,
        scattered: scatteredPos,
        scale: Math.random() * 0.2 + 0.1,
        color: i % 3 === 0 ? COLORS.EMERALD_GREEN : i % 3 === 1 ? COLORS.METALLIC_GOLD : COLORS.CHRISTMAS_RED,
        phase: Math.random() * Math.PI * 2
      });
    }
    return items;
  }, [numItems]);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < numItems; i++) {
      const item = data[i];
      const target = treeState === TreeState.CLOSED ? item.target : item.scattered;
      
      // Interpolate position
      dummy.position.lerp(target, 0.05);
      
      // Subtle float animation
      dummy.position.y += Math.sin(time + item.phase) * 0.02;
      
      dummy.scale.setScalar(item.scale);
      dummy.rotation.x += 0.01;
      dummy.rotation.y += 0.01;
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      color.set(item.color);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    // Snow logic
    if (snowRef.current) {
        snowRef.current.rotation.y += 0.001;
        snowRef.current.position.y -= 0.01;
        if (snowRef.current.position.y < -10) snowRef.current.position.y = 10;
    }
  });

  const snowGeo = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      const pos = [];
      for(let i=0; i<TREE_CONFIG.SNOW_COUNT; i++) {
          pos.push((Math.random()-0.5)*40, (Math.random()-0.5)*40, (Math.random()-0.5)*40);
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      return geo;
  }, []);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, numItems]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.8} roughness={0.2} />
      </instancedMesh>

      <points ref={snowRef} geometry={snowGeo}>
          <pointsMaterial color={COLORS.SILVER_WHITE} size={0.05} transparent opacity={0.6} />
      </points>
    </group>
  );
};

export default TreeParticles;
