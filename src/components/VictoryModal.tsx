/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, Home, Award } from 'lucide-react';
import { SCORING } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  totalScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  totalScore,
  onPlayAgain,
  onMainMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundManager.playGameVictory();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    // Magical confetti and starlight motes
    const confetti = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 200,
      vy: 1.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 1.5,
      size: 3 + Math.random() * 4,
      color: ['#fbbf24', '#34d399', '#38bdf8', '#c084fc', '#f43f5e'][Math.floor(Math.random() * 5)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      confetti.forEach(c => {
        c.y += c.vy;
        c.x += c.vx;
        c.rot += c.rotSpeed;

        if (c.y > h + 20) {
          c.y = -10;
          c.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 1.5);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-lg p-4 sm:p-6 select-none overflow-y-auto">
      {/* Celebration Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative max-w-lg w-full bg-stone-900/95 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(245,158,11,0.3)] text-center my-auto">
        {/* Radiant Crystal Heart Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/40 via-emerald-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-bounce">
            <Sparkles className="w-10 h-10 text-stone-950" />
          </div>
        </div>

        {/* Exact Required Title & Message */}
        <div className="space-y-2 mb-6">
          <h1 className="font-fantasy font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
            CONGRATULATIONS!
          </h1>
          <p className="font-fantasy text-lg sm:text-xl text-emerald-300 font-bold drop-shadow">
            You completed CRYSTALBOUND: THE QUEST BEGINS!
          </p>
          <p className="text-sm sm:text-base text-stone-300 font-medium italic drop-shadow">
            &ldquo;Your journey has restored the Crystal Heart.&rdquo;
          </p>
        </div>

        {/* Campaign Stats */}
        <div className="bg-stone-950/70 border border-amber-600/30 rounded-2xl p-5 mb-8 space-y-3 text-xs sm:text-sm text-stone-300">
          <div className="flex justify-between items-center">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Grand Campaign Bonus:</span>
            </span>
            <span className="font-fantasy font-bold text-amber-300">
              +{SCORING.GAME_VICTORY_BONUS.toLocaleString()} PTS
            </span>
          </div>

          <div className="flex justify-between items-center text-stone-100 font-bold text-base pt-1 border-t border-stone-800">
            <span>Final Legendary Score:</span>
            <span className="font-fantasy font-black text-2xl text-amber-400">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Exact Required Buttons */}
        <div className="space-y-3">
          {/* PLAY AGAIN */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onPlayAgain();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-600 hover:from-emerald-500 hover:to-amber-500 text-stone-50 font-fantasy font-black text-base rounded-xl border border-amber-400/50 shadow-[0_6px_25px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-amber-200" />
            <span>PLAY AGAIN</span>
          </button>

          {/* MAIN MENU */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onMainMenu();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-300 font-fantasy font-bold text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
