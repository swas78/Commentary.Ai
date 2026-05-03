// @ts-nocheck
'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Tube, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Simulated device connections
const DEVICES = [
  { id: 1, angle: 0, distance: 3, type: 'phone', color: '#00d4ff' },
  { id: 2, angle: Math.PI * 0.6, distance: 4, type: 'tablet', color: '#ff006e' },
  { id: 3, angle: Math.PI * 1.4, distance: 3.5, type: 'phone', color: '#00ff88' },
];

function ConnectionTube({ angle, distance, color }: { angle: number, distance: number, color: string }) {
  // Create a curved path from center to device
  const path = useMemo(() => {
    const endX = Math.cos(angle) * distance;
    const endZ = Math.sin(angle) * distance;
    // Control point pulls the curve slightly upward
    const midX = endX / 2;
    const midZ = endZ / 2;
    const midY = -1; 
    
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(midX, midY, midZ),
      new THREE.Vector3(endX, 0, endZ)
    );
  }, [angle, distance]);

  // Animated data packet flowing along tube
  const packetRef = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!packetRef.current) return;
    phase.current += 0.01;
    const t = (Math.sin(phase.current) + 1) / 2; // oscillates 0 to 1
    const pos = path.getPoint(t);
    packetRef.current.position.copy(pos);
  });

  return (
    <>
      {/* The physical connection tube */}
      <Tube args={[path, 20, 0.02, 8, false]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Tube>
      
      {/* Flowing data packet */}
      <Sphere ref={packetRef} args={[0.08, 8, 8]}>
        <meshBasicMaterial color={color} />
      </Sphere>
    </>
  );
}

function OrbitingDevice({ angle, distance, color }: { angle: number, distance: number, color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Base position
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;

  useFrame(() => {
    if (!groupRef.current) return;
    // Make device always face center
    groupRef.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[0.6, 1.2, 0.05]}>
          <meshStandardMaterial color="#1a2b4c" roughness={0.2} metalness={0.8} />
        </Box>
        {/* Glowing screen */}
        <Box args={[0.55, 1.15, 0.06]} position={[0, 0, 0.01]}>
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </Box>
      </Float>
    </group>
  );
}

function HostDevice() {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Base */}
        <Box args={[2, 0.1, 1.5]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#b0b5c0" metalness={0.9} roughness={0.1} />
        </Box>
        {/* Screen */}
        <Box args={[2, 1.2, 0.1]} position={[0, 0.6, -0.7]} rotation={[-0.2, 0, 0]}>
          <meshStandardMaterial color="#1a2b4c" />
        </Box>
        {/* Screen Glow */}
        <Box args={[1.9, 1.1, 0.11]} position={[0, 0.6, -0.68]} rotation={[-0.2, 0, 0]}>
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} />
        </Box>
      </group>
    </Float>
  );
}

export default function DeviceSyncScene() {
  return (
    <div className="w-full h-64 relative">
      <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
        
        <HostDevice />
        
        {DEVICES.map(device => (
          <React.Fragment key={device.id}>
            <OrbitingDevice angle={device.angle} distance={device.distance} color={device.color} />
            <ConnectionTube angle={device.angle} distance={device.distance} color={device.color} />
          </React.Fragment>
        ))}

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} intensity={1.5} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
