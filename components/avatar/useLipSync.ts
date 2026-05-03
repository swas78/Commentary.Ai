import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Map vowels to arbitrary viseme weights (ReadyPlayerMe standard visemes)
const phonemeMap: Record<string, { A: number; E: number; I: number; O: number; U: number }> = {
  A: { A: 1, E: 0, I: 0, O: 0, U: 0 },
  E: { A: 0, E: 1, I: 0, O: 0, U: 0 },
  I: { A: 0, E: 0, I: 1, O: 0, U: 0 },
  O: { A: 0, E: 0, I: 0, O: 1, U: 0 },
  U: { A: 0, E: 0, I: 0, O: 0, U: 1 },
  rest: { A: 0, E: 0, I: 0, O: 0, U: 0 },
};

export function useLipSync(nodes: any, textStream: string) {
  const [currentPhoneme, setCurrentPhoneme] = useState('rest');
  const targetInfluences = useRef({ A: 0, E: 0, I: 0, O: 0, U: 0 });

  // Simple parser: pick the last vowel of the streaming text to drive the mouth
  useEffect(() => {
    if (!textStream) {
      setCurrentPhoneme('rest');
      return;
    }

    const words = textStream.toUpperCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    
    if (!lastWord) return;

    // Find the last vowel in the word
    const match = lastWord.match(/[AEIOU]/g);
    if (match && match.length > 0) {
      setCurrentPhoneme(match[match.length - 1]);
    } else {
      setCurrentPhoneme('rest');
    }
  }, [textStream]);

  useFrame(() => {
    if (!nodes.Wolf3D_Head || !nodes.Wolf3D_Head.morphTargetDictionary || !nodes.Wolf3D_Head.morphTargetInfluences) return;
    if (!nodes.Wolf3D_Teeth || !nodes.Wolf3D_Teeth.morphTargetDictionary || !nodes.Wolf3D_Teeth.morphTargetInfluences) return;

    const target = phonemeMap[currentPhoneme] || phonemeMap.rest;
    
    // Smoothly interpolate current influences towards the target
    const lerpFactor = 0.15;
    targetInfluences.current.A = THREE.MathUtils.lerp(targetInfluences.current.A, target.A, lerpFactor);
    targetInfluences.current.E = THREE.MathUtils.lerp(targetInfluences.current.E, target.E, lerpFactor);
    targetInfluences.current.I = THREE.MathUtils.lerp(targetInfluences.current.I, target.I, lerpFactor);
    targetInfluences.current.O = THREE.MathUtils.lerp(targetInfluences.current.O, target.O, lerpFactor);
    targetInfluences.current.U = THREE.MathUtils.lerp(targetInfluences.current.U, target.U, lerpFactor);

    // Apply to morph targets (assuming standard RPM blend shapes like viseme_O)
    const applyViseme = (mesh: any, viseme: string, value: number) => {
      const index = mesh.morphTargetDictionary[viseme];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = value;
      }
    };

    // RPM specific viseme names
    applyViseme(nodes.Wolf3D_Head, 'viseme_aa', targetInfluences.current.A);
    applyViseme(nodes.Wolf3D_Head, 'viseme_E', targetInfluences.current.E);
    applyViseme(nodes.Wolf3D_Head, 'viseme_I', targetInfluences.current.I);
    applyViseme(nodes.Wolf3D_Head, 'viseme_O', targetInfluences.current.O);
    applyViseme(nodes.Wolf3D_Head, 'viseme_U', targetInfluences.current.U);

    applyViseme(nodes.Wolf3D_Teeth, 'viseme_aa', targetInfluences.current.A);
    applyViseme(nodes.Wolf3D_Teeth, 'viseme_E', targetInfluences.current.E);
    applyViseme(nodes.Wolf3D_Teeth, 'viseme_I', targetInfluences.current.I);
    applyViseme(nodes.Wolf3D_Teeth, 'viseme_O', targetInfluences.current.O);
    applyViseme(nodes.Wolf3D_Teeth, 'viseme_U', targetInfluences.current.U);
  });
}
