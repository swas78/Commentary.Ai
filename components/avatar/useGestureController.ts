import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useCommentaryStore } from '@/store/useCommentaryStore';

export function useGestureController(actions: Record<string, THREE.AnimationAction | null>) {
  const commentaries = useCommentaryStore((state) => state.commentaries);
  const currentAction = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    if (!commentaries || commentaries.length === 0) {
      playAction('idle');
      return;
    }

    const latest = commentaries[0];
    const text = latest.text.toUpperCase();
    
    let targetGesture = 'idle_talk'; // Default talking

    if (text.includes('SIX') || text.includes('SIXER') || text.includes('BOUNDARY')) {
      targetGesture = 'celebration';
    } else if (text.includes('WICKET') || text.includes('OUT') || text.includes('DISMISSED')) {
      targetGesture = 'disappointShrug';
    } else if (text.includes('FOUR')) {
      targetGesture = 'pointing';
    } else if (text.includes('CENTURY') || text.includes('MILESTONE')) {
      targetGesture = 'clapping';
    }

    playAction(targetGesture);

    // Auto-return to idle after 3 seconds
    const timeout = setTimeout(() => {
      playAction('idle');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [commentaries, actions]);

  const playAction = (name: string) => {
    const action = actions[name];
    if (!action) {
      // Fallback to idle if animation missing
      if (actions['idle'] && currentAction.current !== actions['idle']) {
         actions['idle'].reset().fadeIn(0.3).play();
         if (currentAction.current) currentAction.current.fadeOut(0.3);
         currentAction.current = actions['idle'];
      }
      return;
    }

    if (currentAction.current === action) return;

    action.reset().fadeIn(0.3).play();
    if (currentAction.current) {
      currentAction.current.fadeOut(0.3);
    }
    
    // Some gestures shouldn't loop forever
    if (name !== 'idle' && name !== 'idle_talk') {
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
    } else {
      action.setLoop(THREE.LoopRepeat, Infinity);
    }

    currentAction.current = action;
  };
}
