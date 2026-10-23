/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    soundManager.playHazardHit();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 sm:p-6 select-none animate-fadeIn">
      <div className="relative max-w-md w-full bg-stone-900/95 border-2 border-rose-600/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(225,29,72,0.3)] text-center my-auto">
        {/* Warning Icon Crest */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-rose-950 to-stone-900 border-2 border-rose-500/60 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(225,29,72,0.4)] animate-pulse">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>

        {/* Exact Required Game Over Text */}
        <h2 className="font-fantasy font-black text-3xl sm:text-4xl text-rose-100 tracking-wide mb-2">
          GAME OVER!
        </h2>
        <p className="text-base sm:text-lg text-rose-300 font-semibold mb-1">
          You hit an obstacle.
        </p>
        <p className="text-sm text-stone-300 font-normal mb-8">
          Try again and complete your quest!
        </p>

        {/* Exact Required Buttons */}
        <div className="space-y-3">
          {/* PLAY AGAIN */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onPlayAgain();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-fantasy font-black text-sm sm:text-base rounded-xl border border-amber-400/50 shadow-[0_4px_18px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
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
