// @ts-nocheck
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useCommentaryStore } from '@/store/useCommentaryStore';
import { useLipSync } from './useLipSync';
import { useGestureController } from './useGestureController';
import { useExpressionController } from './useExpressionController';

// Fallback avatar model path - USER MUST PROVIDE THIS GLB
const MODEL_URL = '/models/avatar.glb';

function AvatarModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, nodes, animations } = useGLTF(MODEL_URL) as any;
  const { actions } = useAnimations(animations, group);
  
  const commentaries = useCommentaryStore(s => s.commentaries);
  const [currentText, setCurrentText] = useState('');

  // Update text stream for lip sync
  useEffect(() => {
    if (commentaries.length > 0) {
      setCurrentText(commentaries[0].text);
      const timeout = setTimeout(() => setCurrentText(''), 3000); // Stop lip sync after 3s
      return () => clearTimeout(timeout);
    }
  }, [commentaries]);

  // Hook up avatar systems
  useLipSync(nodes, currentText);
  useGestureController(actions as Record<string, THREE.AnimationAction>);
  useExpressionController(nodes);

  // Auto-pan camera slightly
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    state.camera.lookAt(0, 1.5, 0); // Look at face
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

function Lighting() {
  const commentaries = useCommentaryStore(s => s.commentaries);
  const keyLightRef = useRef<THREE.PointLight>(null);
  
  useFrame(() => {
    if (!keyLightRef.current) return;
    
    // Dynamic light color based on sentiment
    const sentiment = commentaries.length > 0 ? commentaries[0].sentiment : 'neutral';
    const targetColor = new THREE.Color();
    
    switch(sentiment) {
      case 'excited': case 'celebrating': targetColor.set('#ff5500'); break; // Intense warm
      case 'disappointed': case 'tense': targetColor.set('#0044ff'); break; // Intense cool
      default: targetColor.set('#ff9500'); break; // Default stadium warm
    }
    
    keyLightRef.current.color.lerp(targetColor, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      {/* Key light (Stadium Warm / Dynamic) */}
      <pointLight ref={keyLightRef} position={[2, 3, 2]} intensity={2.5} castShadow />
      {/* Fill light (Soft Blue) */}
      <pointLight position={[-3, 2, 2]} intensity={1} color="#0066ff" />
      {/* Rim light (Cyan) */}
      <pointLight position={[0, 4, -3]} intensity={3} color="#00d4ff" />
    </>
  );
}

export default function AvatarScene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        gl={{ antialias: false, preserveDrawingBuffer: true }}
      >
        <Lighting />
        
        {/* React Suspense boundary handled at page level, but ErrorBoundary is good practice */}
        <React.Suspense fallback={null}>
          <AvatarModel />
          <Environment preset="city" background blur={0.8} />
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        </React.Suspense>

        <EffectComposer disableNormalPass>
          <DepthOfField focusDistance={0.01} focalLength={0.05} bokehScale={2} />
        </EffectComposer>
      </Canvas>
      
      {/* Fallback overlay if model fails to load or while loading */}
      <div id="avatar-loading-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: 8 }}>
          Load `public/models/avatar.glb` with morph targets to view 3D Avatar.
        </p>
      </div>
    </div>
  );
}
