/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Play, RotateCcw, Map, HelpCircle, Settings, Award, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GameSaveData } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface MainMenuProps {
  saveData: GameSaveData;
  onPlay: () => void;
  onContinue: () => void;
  onLevelSelect: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  saveData,
  onPlay,
  onContinue,
  onLevelSelect,
  onHowToPlay,
  onSettings,
  onCredits,
  onToggleSound,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasSavedProgress = saveData.completedLevels.length > 0 || saveData.highestUnlockedLevel > 1 || saveData.totalScore > 0;

  // Animated atmospheric fantasy background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles for magical atmosphere
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1.5 + Math.random() * 3,
      alpha: 0.2 + Math.random() * 0.6,
      color: Math.random() > 0.5 ? '#fbbf24' : Math.random() > 0.5 ? '#34d399' : '#c084fc',
      seed: Math.random() * 100,
    }));

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      // Base gradient: Emerald / forest green to deep obsidian
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a1610');
      bgGrad.addColorStop(0.5, '#0e2218');
      bgGrad.addColorStop(1, '#080d0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant mystical mountains / fantasy ruins silhouettes
      ctx.save();
      ctx.fillStyle = '#06130d';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.68);
      ctx.lineTo(width * 0.25, height * 0.52);
      ctx.lineTo(width * 0.45, height * 0.65);
      ctx.lineTo(width * 0.72, height * 0.48);
      ctx.lineTo(width, height * 0.64);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Foreground mountain ridge
      ctx.fillStyle = '#030a07';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.82);
      ctx.lineTo(width * 0.35, height * 0.72);
      ctx.lineTo(width * 0.6, height * 0.84);
      ctx.lineTo(width * 0.85, height * 0.76);
      ctx.lineTo(width, height * 0.88);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Floating crystal monolith in center background
      const crystalBob = Math.sin(elapsed * 1.5) * 12;
      const cx = width / 2;
      const cy = height * 0.32 + crystalBob;

      // Crystal radial aura
      const crystalAura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      crystalAura.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
      crystalAura.addColorStop(0.6, 'rgba(251, 191, 36, 0.12)');
      crystalAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = crystalAura;
      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw floating crystal shards
      ctx.save();
      const crystalH = 46;
      const crystalW = 24;
      ctx.beginPath();
      ctx.moveTo(cx, cy - crystalH);
      ctx.lineTo(cx + crystalW, cy);
      ctx.lineTo(cx, cy + crystalH);
      ctx.lineTo(cx - crystalW, cy);
      ctx.closePath();

      const cGrad = ctx.createLinearGradient(cx - crystalW, cy - crystalH, cx + crystalW, cy + crystalH);
      cGrad.addColorStop(0, '#ffffff');
      cGrad.addColorStop(0.3, '#34d399');
      cGrad.addColorStop(0.7, '#059669');
      cGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = cGrad;
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - crystalH);
      ctx.lineTo(cx, cy + crystalH);
      ctx.moveTo(cx - crystalW, cy);
      ctx.lineTo(cx + crystalW, cy);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
      ctx.restore();

      // Drifting particles
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(elapsed + p.seed) * 0.3;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClick = (action: () => void) => () => {
    soundManager.playUiClick();
    action();
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden flex flex-col justify-between items-center text-stone-100 select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400/80 bg-stone-900/60 border border-emerald-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Realm of Aetherfall</span>
        </div>

        <button
          onClick={() => {
            soundManager.playUiClick();
            onToggleSound();
          }}
          aria-label={saveData.soundSettings.music || saveData.soundSettings.sfx ? 'Mute Audio' : 'Unmute Audio'}
          className="p-2.5 bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-amber-600/30 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 backdrop-blur-sm"
        >
          {saveData.soundSettings.music || saveData.soundSettings.sfx ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-stone-500" />
          )}
          <span className="text-xs font-medium pr-1">Audio</span>
        </button>
      </header>

      {/* Hero Title Section */}
      <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl my-auto">
        <div className="inline-block mb-3 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-950/80 via-amber-950/80 to-emerald-950/80 border border-amber-500/40 backdrop-blur-md shadow-lg">
          <span className="font-fantasy font-bold tracking-[0.25em] text-amber-300 text-xs sm:text-sm uppercase">
            A FANTASY ADVENTURE
          </span>
        </div>

        <h1 className="font-fantasy font-black text-4xl sm:text-6xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] tracking-wide mb-1">
          CRYSTALBOUND
        </h1>

        <h2 className="font-fantasy font-bold text-lg sm:text-2xl md:text-3xl text-emerald-300 tracking-[0.18em] uppercase drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)] mb-4">
          THE QUEST BEGINS
        </h2>

        <p className="text-stone-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed mb-8 drop-shadow italic text-balance">
          &ldquo;Explore the unknown. Discover the crystals. Restore the light.&rdquo;
        </p>

        {/* The 6 Main Menu Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
          {/* 1. Play (New Game) */}
          <button
            onClick={handleClick(onPlay)}
            className="group relative flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-stone-50 font-bold font-fantasy text-sm sm:text-base rounded-xl border border-emerald-400/50 shadow-[0_4px_18px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Play</span>
          </button>

          {/* 2. Continue */}
          <button
            onClick={hasSavedProgress ? handleClick(onContinue) : undefined}
            disabled={!hasSavedProgress}
            className={`group flex items-center justify-center gap-3 px-6 py-3.5 font-bold font-fantasy text-sm sm:text-base rounded-xl border transition-all duration-200 ${
              hasSavedProgress
                ? 'bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-600/40 shadow-lg hover:shadow-amber-900/40 hover:-translate-y-0.5 cursor-pointer'
                : 'bg-stone-900/40 text-stone-500 border-stone-800 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${hasSavedProgress ? 'group-hover:rotate-[-45deg] transition-transform text-amber-400' : ''}`} />
            <span>Continue</span>
          </button>

          {/* 3. Level Selection */}
          <button
            onClick={handleClick(onLevelSelect)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-stone-900/85 hover:bg-stone-800 text-stone-200 hover:text-amber-300 font-semibold font-fantasy text-sm rounded-xl border border-stone-700/60 hover:border-amber-600/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Level Selection</span>
          </button>

          {/* 4. How to Play */}
          <button
            onClick={handleClick(onHowToPlay)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-stone-900/85 hover:bg-stone-800 text-stone-200 hover:text-amber-300 font-semibold font-fantasy text-sm rounded-xl border border-stone-700/60 hover:border-amber-600/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>How to Play</span>
          </button>

          {/* 5. Settings */}
          <button
            onClick={handleClick(onSettings)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-stone-900/85 hover:bg-stone-800 text-stone-200 hover:text-amber-300 font-semibold font-fantasy text-sm rounded-xl border border-stone-700/60 hover:border-amber-600/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-stone-400" />
            <span>Settings</span>
          </button>

          {/* 6. Credits */}
          <button
            onClick={handleClick(onCredits)}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-stone-900/85 hover:bg-stone-800 text-stone-200 hover:text-amber-300 font-semibold font-fantasy text-sm rounded-xl border border-stone-700/60 hover:border-amber-600/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Credits</span>
          </button>
        </div>

        {/* High Score / Progress Status */}
        {saveData.highScore > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400 bg-stone-900/70 border border-amber-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <span>Highest Score:</span>
            <span className="font-fantasy font-bold text-amber-300">{saveData.highScore.toLocaleString()}</span>
            <span className="text-stone-600">•</span>
            <span>Realms Cleared:</span>
            <span className="font-fantasy font-bold text-emerald-400">{saveData.completedLevels.length} / 100</span>
            <span className="text-stone-600">•</span>
            <span>Difficulty:</span>
            <span className="font-fantasy font-bold text-amber-200 uppercase">{saveData.selectedDifficulty}</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-stone-500">
        CRYSTALBOUND: THE QUEST BEGINS &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
};
