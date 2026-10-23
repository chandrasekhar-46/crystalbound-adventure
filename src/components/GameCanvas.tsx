/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LevelConfig, Player, Crystal, Hazard, Particle, FloatingText, SCORING, DifficultyMode } from '../types/game';
import { GameRenderer } from '../engine/renderer';
import { updatePhysics, createInitialPlayer, InputState } from '../engine/physics';
import { HUD } from './HUD';
import { MobileControls } from './MobileControls';
import { soundManager } from '../audio/soundManager';

interface GameCanvasProps {
  level: LevelConfig;
  difficulty: DifficultyMode;
  sessionScore: number;
  highScore: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
  isPaused: boolean;
  onPause: () => void;
  onToggleSound: () => void;
  onLevelComplete: (levelScore: number, timeBonus: number, remainingSeconds: number, tookDamage: boolean) => void;
  onTimeUp: (attemptScore: number, crystalsCollected: number) => void;
  onGameOver: () => void;
  onCrystalCollected?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  difficulty,
  sessionScore,
  highScore,
  soundEnabled,
  reducedMotion,
  isPaused,
  onPause,
  onToggleSound,
  onLevelComplete,
  onTimeUp,
  onGameOver,
  onCrystalCollected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Difficulty parameters
  const maxHealth = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 2 : 3;
  const hazardSpeedMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.25 : 1.0;
  const timeLimitMultiplier = difficulty === 'easy' ? 1.35 : difficulty === 'hard' ? 0.8 : 1.0;
  const totalTimeLimit = Math.round(level.timeLimit * timeLimitMultiplier);

  // Gameplay State
  const [player, setPlayer] = useState<Player>(() => createInitialPlayer(level.playerSpawn, maxHealth));
  const [crystals, setCrystals] = useState<Crystal[]>(() =>
    level.crystals.map(c => ({
      id: c.id,
      x: c.x,
      y: c.y,
      radius: c.radius || 14,
      color: c.color || '#34d399',
      glowColor: c.glowColor || 'rgba(52, 211, 153, 0.6)',
      collected: false,
      pulseOffset: Math.random() * Math.PI * 2,
      value: c.value || SCORING.CRYSTAL_POINTS,
    }))
  );

  const [hazards, setHazards] = useState<Hazard[]>(() =>
    level.hazards.map(h => ({
      ...h,
      progress: h.progress || 0,
      direction: h.direction || 1,
    }))
  );

  const [levelScore, setLevelScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(totalTimeLimit);
  const [notification, setNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  // Active elapsed gameplay time (excluding pause and menu)
  const activeElapsedRef = useRef(0);
  const isLevelFinishedRef = useRef(false);

  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Inputs
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Re-initialize state whenever level or difficulty changes or restarts
  useEffect(() => {
    setPlayer(createInitialPlayer(level.playerSpawn, maxHealth));
    setCrystals(
      level.crystals.map(c => ({
        id: c.id,
        x: c.x,
        y: c.y,
        radius: c.radius || 14,
        color: c.color || '#34d399',
        glowColor: c.glowColor || 'rgba(52, 211, 153, 0.6)',
        collected: false,
        pulseOffset: Math.random() * Math.PI * 2,
        value: c.value || SCORING.CRYSTAL_POINTS,
      }))
    );
    setHazards(
      level.hazards.map(h => ({
        ...h,
        progress: h.progress || 0,
        direction: h.direction || 1,
      }))
    );
    setLevelScore(0);
    setTimeRemaining(totalTimeLimit);
    activeElapsedRef.current = 0;
    particlesRef.current = [];
    floatingTextsRef.current = [];
    isLevelFinishedRef.current = false;
    setNotification(null);
  }, [level, totalTimeLimit, maxHealth]);

  // Show temporary HUD notification
  const showNotification = useCallback((msg: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification(msg);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2800);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        onPause();
        return;
      }

      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        inputRef.current.up = true;
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        inputRef.current.down = true;
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        inputRef.current.left = true;
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        inputRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        inputRef.current.up = false;
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        inputRef.current.down = false;
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        inputRef.current.left = false;
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        inputRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      inputRef.current = { up: false, down: false, left: false, right: false };
    };
  }, [onPause]);

  // Mobile D-Pad input handler
  const handleMobileInput = useCallback((action: keyof InputState, active: boolean) => {
    inputRef.current[action] = active;
  }, []);

  // Main Game Animation, Timer & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer(ctx);
    } else {
      rendererRef.current.setContext(ctx);
    }

    let animId: number;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Update timer and physics only when not paused and game is active
      if (!isPaused && !isLevelFinishedRef.current) {
        // Accumulate active gameplay time safely (bounded)
        const stepDt = Math.min(dt, 0.1);
        activeElapsedRef.current += stepDt;

        const currentRemaining = Math.max(0, totalTimeLimit - activeElapsedRef.current);
        setTimeRemaining(currentRemaining);

        // Check for Time Expired
        if (currentRemaining <= 0) {
          isLevelFinishedRef.current = true;
          const collectedCount = crystals.filter(c => c.collected).length;
          onTimeUp(levelScore, collectedCount);
          return;
        }

        // Run physics simulation
        setPlayer(prevPlayer => {
          const result = updatePhysics(
            stepDt,
            prevPlayer,
            inputRef.current,
            level,
            crystals,
            hazards,
            particlesRef.current,
            floatingTextsRef.current,
            collectedCrystal => {
              setLevelScore(s => s + collectedCrystal.value);
              if (onCrystalCollected) onCrystalCollected();
            },
            () => {
              showNotification(level.id === 100 ? 'The Eternal Heart Awakens!' : 'Exit Portal Unlocked!');
            },
            () => {
              // Level Completed
              if (!isLevelFinishedRef.current) {
                isLevelFinishedRef.current = true;
                const timeBonus = Math.floor(currentRemaining) * SCORING.TIME_BONUS_PER_SECOND;
                const multiplier = SCORING.DIFFICULTY_MULTIPLIER[difficulty];
                const finalLevelScore = Math.round((levelScore + SCORING.LEVEL_COMPLETE_BONUS + timeBonus) * multiplier);
                onLevelComplete(finalLevelScore, timeBonus, currentRemaining, prevPlayer.tookDamageThisLevel || false);
              }
            },
            _newHealth => {},
            hazardSpeedMultiplier,
            () => {
              if (!isLevelFinishedRef.current) {
                isLevelFinishedRef.current = true;
                onGameOver();
              }
            }
          );
          return result.player;
        });
      }

      // Camera follow calculation
      const canvasW = canvas.width;
      const canvasH = canvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const targetZoom = Math.min(canvasW / (level.mapWidth * 0.95), canvasH / (level.mapHeight * 0.95), 1.25 * dpr);
      const zoom = Math.max(0.65 * dpr, targetZoom);

      const viewW = canvasW / zoom;
      const viewH = canvasH / zoom;

      let camX = player.x - viewW / 2;
      let camY = player.y - viewH / 2;

      camX = Math.max(0, Math.min(level.mapWidth - viewW, camX));
      camY = Math.max(0, Math.min(level.mapHeight - viewH, camY));

      const collectedCount = crystals.filter(c => c.collected).length;
      const allCrystalsCollected = collectedCount >= level.targetCrystals;

      // Sealed portal warning
      if (!allCrystalsCollected) {
        const portal = level.exitPortal;
        const dist = Math.hypot(player.x - portal.x, player.y - portal.y);
        if (dist < player.radius + 40 && !notification) {
          const remaining = level.targetCrystals - collectedCount;
          showNotification(`Sealed! Collect ${remaining} more crystal${remaining > 1 ? 's' : ''}`);
        }
      }

      // Render Frame
      rendererRef.current?.render(
        level,
        player,
        crystals,
        hazards,
        particlesRef.current,
        floatingTextsRef.current,
        allCrystalsCollected,
        { x: camX, y: camY, zoom },
        currentTime * 0.001,
        reducedMotion
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [
    level,
    difficulty,
    crystals,
    hazards,
    player,
    isPaused,
    reducedMotion,
    levelScore,
    totalTimeLimit,
    notification,
    hazardSpeedMultiplier,
    onLevelComplete,
    onTimeUp,
    onCrystalCollected,
    showNotification,
  ]);

  const collectedCount = crystals.filter(c => c.collected).length;
  const isUnlocked = collectedCount >= level.targetCrystals;

  return (
    <div className="relative w-full h-full min-h-screen bg-stone-950 overflow-hidden select-none">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Fantasy HUD Overlay */}
      <HUD
        level={level}
        score={sessionScore + levelScore}
        highScore={highScore}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        crystalsCollected={collectedCount}
        totalCrystals={level.targetCrystals}
        health={player.health}
        maxHealth={player.maxHealth}
        portalUnlocked={isUnlocked}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onPause={onPause}
        notificationMessage={notification}
      />

      {/* Mobile Virtual D-Pad */}
      <MobileControls onInput={handleMobileInput} />
    </div>
  );
};
