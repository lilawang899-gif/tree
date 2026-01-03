
import React, { useEffect, useRef } from 'react';
import { HandData } from '../types';
import { GESTURE_THRESHOLD } from '../constants';

interface Props {
  onUpdate: (data: HandData) => void;
  onActive: (active: boolean) => void;
}

const HandManager: React.FC<Props> = ({ onUpdate, onActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Simple Gesture Detection
        // Fist: Distance between thumb tip and pinky tip is small, and all fingers curled
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        const wrist = landmarks[0];

        const getDist = (p1: any, p2: any) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
        
        const indexToWrist = getDist(indexTip, wrist);
        const middleToWrist = getDist(middleTip, wrist);
        const pinkyToWrist = getDist(pinkyTip, wrist);

        const isFist = indexToWrist < 0.2 && middleToWrist < 0.2 && pinkyToWrist < 0.2;
        const isOpen = indexToWrist > 0.4 && middleToWrist > 0.4 && pinkyToWrist > 0.4;
        const isPinching = getDist(thumbTip, indexTip) < GESTURE_THRESHOLD.PINCH_DIST;

        // Rotation (Angle between wrist and middle finger mcp)
        const rotation = Math.atan2(landmarks[9].y - wrist.y, landmarks[9].x - wrist.x);

        onUpdate({
          isFist,
          isOpen,
          isPinching,
          rotation,
          position: { x: landmarks[9].x, y: landmarks[9].y, z: landmarks[9].z },
          rawLandmarks: landmarks
        });
      }
    });

    const camera = new (window as any).Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start().then(() => onActive(true));

    return () => {
      camera.stop();
    };
  }, [onUpdate, onActive]);

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-x-[-1]" />
    </div>
  );
};

export default HandManager;
