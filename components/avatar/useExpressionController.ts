import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCommentaryStore } from '@/store/useCommentaryStore';

export function useExpressionController(nodes: any) {
  const commentaries = useCommentaryStore((state) => state.commentaries);
  const targetExpression = useRef({ browInnerUp: 0, browOuterUpLeft: 0, browOuterUpRight: 0, mouthSmile: 0, mouthFrown: 0 });
  const headBobPhase = useRef(0);
  const nextBlinkTime = useRef(0);
  const isBlinking = useRef(false);

  useEffect(() => {
    if (!commentaries || commentaries.length === 0) return;
    
    const latest = commentaries[0];
    
    // Map sentiment to blend shapes
    switch(latest.sentiment) {
      case 'excited':
      case 'celebrating':
        targetExpression.current = { browInnerUp: 0.6, browOuterUpLeft: 0.8, browOuterUpRight: 0.8, mouthSmile: 0.7, mouthFrown: 0 };
        break;
      case 'disappointed':
      case 'tense':
        targetExpression.current = { browInnerUp: 0.8, browOuterUpLeft: 0, browOuterUpRight: 0, mouthSmile: 0, mouthFrown: 0.6 };
        break;
      default:
        targetExpression.current = { browInnerUp: 0, browOuterUpLeft: 0, browOuterUpRight: 0, mouthSmile: 0.2, mouthFrown: 0 };
    }
  }, [commentaries]);

  useFrame((state) => {
    if (!nodes.Wolf3D_Head || !nodes.Wolf3D_Head.morphTargetDictionary || !nodes.Wolf3D_Head.morphTargetInfluences) return;

    const dict = nodes.Wolf3D_Head.morphTargetDictionary;
    const influences = nodes.Wolf3D_Head.morphTargetInfluences;

    const applyMorph = (name: string, targetValue: number, lerpFactor = 0.1) => {
      const idx = dict[name];
      if (idx !== undefined) {
        influences[idx] = THREE.MathUtils.lerp(influences[idx], targetValue, lerpFactor);
      }
    };

    // Apply expressions
    applyMorph('browInnerUp', targetExpression.current.browInnerUp);
    applyMorph('browOuterUpLeft', targetExpression.current.browOuterUpLeft);
    applyMorph('browOuterUpRight', targetExpression.current.browOuterUpRight);
    applyMorph('mouthSmile', targetExpression.current.mouthSmile);
    applyMorph('mouthFrown', targetExpression.current.mouthFrown);

    // Blinking logic
    const time = state.clock.elapsedTime;
    if (time > nextBlinkTime.current && !isBlinking.current) {
      isBlinking.current = true;
      nextBlinkTime.current = time + 3 + Math.random() * 4; // next blink in 3-7 seconds
    }

    let blinkTarget = 0;
    if (isBlinking.current) {
      blinkTarget = 1;
      // Close eyes quickly, open slightly slower
      applyMorph('eyeBlinkLeft', blinkTarget, 0.4);
      applyMorph('eyeBlinkRight', blinkTarget, 0.4);
      
      // If eyes are mostly closed, stop blinking phase to let them open
      if (influences[dict['eyeBlinkLeft']] > 0.8) {
        isBlinking.current = false;
      }
    } else {
      // Open eyes
      applyMorph('eyeBlinkLeft', blinkTarget, 0.15);
      applyMorph('eyeBlinkRight', blinkTarget, 0.15);
    }

    // Subtle head bobbing while talking
    if (nodes.Head) {
      const isTalking = commentaries.length > 0 && (Date.now() - new Date(commentaries[0].timestamp).getTime() < 3000);
      if (isTalking) {
        headBobPhase.current += 0.05;
        const offset = Math.sin(headBobPhase.current) * 0.02;
        nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, offset, 0.1);
      } else {
        nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, 0, 0.05);
      }
    }
  });
}
