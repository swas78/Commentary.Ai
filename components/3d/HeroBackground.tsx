// @ts-nocheck
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Box, Torus, Sphere } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

// ── Particle System ───────────────────────────────────────────
function Particles() {
  const count = 700;
  const mesh = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const isSpark = i < 500;
      const isBall = i >= 500 && i < 650;
      
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      
      let scale = 0.05;
      let color = new THREE.Color();
      
      if (isSpark) {
        scale = 0.02 + Math.random() * 0.03;
        color.set('#00d4ff'); // Cyan
      } else if (isBall) {
        scale = 0.08 + Math.random() * 0.05;
        color.set('#cc2222'); // Red ball
      } else {
        scale = 0.15 + Math.random() * 0.1;
        color.set('#00ff88'); // Glow orb
      }

      const speed = isBall ? 0.02 : 0.005 + Math.random() * 0.01;
      const phase = Math.random() * Math.PI * 2;

      temp.push({ x, y, z, scale, color, speed, phase });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((p, i) => {
      // Upward drift
      p.y += p.speed;
      if (p.y > 10) p.y = -10;
      
      // Sine wave movement on X/Z
      const xOffset = Math.sin(state.clock.elapsedTime * 0.5 + p.phase) * 0.02;
      const zOffset = Math.cos(state.clock.elapsedTime * 0.3 + p.phase) * 0.01;
      
      dummy.position.set(p.x + xOffset, p.y, p.z + zOffset);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
      mesh.current!.setColorAt(i, p.color);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial 
        roughness={0.2} 
        emissiveIntensity={1.5}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// ── Floating Shapes ───────────────────────────────────────────
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const offset = i * Math.PI * 0.2;
      // Orbital motion
      child.position.x += Math.sin(time * 0.5 + offset) * 0.005;
      child.position.y += Math.cos(time * 0.3 + offset) * 0.005;
      
      // Slow rotation
      child.rotation.x += 0.003;
      child.rotation.y += 0.005;
      child.rotation.z += 0.002;
    });
  });

  const wireframeMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00d4ff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.3 
  }), []);

  const emissiveMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#ff006e',
    emissive: '#ff006e',
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8,
    wireframe: true
  }), []);

  return (
    <group ref={groupRef}>
      <Icosahedron args={[0.8, 0]} position={[-3, 2, -5]} material={wireframeMaterial} />
      <Icosahedron args={[0.5, 0]} position={[4, 1, -8]} material={emissiveMaterial} />
      <Icosahedron args={[0.3, 0]} position={[-2, -2, -3]} material={wireframeMaterial} />
      <Icosahedron args={[0.4, 0]} position={[3, -1, -4]} material={wireframeMaterial} />
      
      <Torus args={[0.6, 0.02, 16, 32]} position={[-4, 0, -6]} material={wireframeMaterial} />
      <Torus args={[0.4, 0.02, 16, 32]} position={[2, 3, -7]} material={emissiveMaterial} />
      <Torus args={[0.8, 0.01, 16, 32]} position={[0, -3, -5]} material={wireframeMaterial} />
      
      <Box args={[0.5, 0.5, 0.5]} position={[5, -2, -6]} material={wireframeMaterial} />
      <Box args={[0.3, 0.3, 0.3]} position={[-5, -1, -4]} material={emissiveMaterial} />
      <Box args={[0.4, 0.4, 0.4]} position={[1, 4, -5]} material={wireframeMaterial} />

      <Sphere args={[0.3, 16, 16]} position={[-1, 1, -2]} material={new THREE.MeshStandardMaterial({ color: '#880000', emissive: '#440000', emissiveIntensity: 0.5, wireframe: true })} />
      <Sphere args={[0.2, 16, 16]} position={[2, -2, -3]} material={new THREE.MeshStandardMaterial({ color: '#880000', emissive: '#440000', emissiveIntensity: 0.5, wireframe: true })} />
    </group>
  );
}

// ── Mouse Parallax ────────────────────────────────────────────
function CameraController() {
  const mouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const targetX = mouse.current.x * 1.5;
    const targetY = mouse.current.y * 1.5;
    
    state.camera.position.x += (targetX - state.camera.position.x) * 0.05;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Main Component ────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff006e" />
      
      <Particles />
      <FloatingShapes />
      <CameraController />

      {/* Infinite Grid Plane */}
      <gridHelper args={[50, 50, '#00d4ff', '#1a2b4c']} position={[0, -3, 0]} />

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.4} 
          luminanceSmoothing={0.9} 
          intensity={1.0} 
          radius={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function HeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: false }} // antialias false for performance with post-processing
        dpr={[1, 2]} // limit pixel ratio for performance
      >
        <Scene />
      </Canvas>
    </div>
  );
}
