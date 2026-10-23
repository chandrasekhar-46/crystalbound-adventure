/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Timer, RotateCcw, Map, Home, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface TimeUpModalProps {
  level: LevelConfig;
  crystalsCollected: number;
  totalCrystals: number;
  attemptScore: number;
  onRestart: () => void;
  onWorldMap: () => void;
  onMainMenu: () => void;
}

export const TimeUpModal: React.FC<TimeUpModalProps> = ({
  level,
  crystalsCollected,
  totalCrystals,
  attemptScore,
  onRestart,
  onWorldMap,
  onMainMenu,
}) => {
  useEffect(() => {
    soundManager.playHazardHit();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 sm:p-6 select-none animate-fadeIn">
      <div className="relative max-w-md w-full bg-stone-900/95 border-2 border-rose-600/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(225,29,72,0.25)] text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-rose-950 to-stone-900 border-2 border-rose-500/60 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(225,29,72,0.4)] animate-pulse">
          <Timer className="w-8 h-8 text-rose-400" />
        </div>

        {/* Title & Level Subtitle */}
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-rose-400 block mb-1">
          The Sands of Time Have Run Out
        </span>
        <h2 className="font-fantasy font-black text-3xl sm:text-4xl text-rose-100 mb-1">
          TIME&apos;S UP!
        </h2>
        <p className="text-xs text-stone-400 font-medium mb-6">
          Level {level.id}: {level.name}
        </p>

        {/* Attempt Statistics */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 mb-6 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Crystals Gathered:</span>
            </span>
            <span className="font-fantasy font-bold text-stone-100">
              {crystalsCollected} / {totalCrystals}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-stone-100 font-bold">
            <span>Score This Attempt:</span>
            <span className="font-fantasy font-black text-lg text-amber-400">
              {attemptScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          {/* 1. Restart Level */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onRestart();
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-fantasy font-black text-sm sm:text-base rounded-xl border border-amber-400/50 shadow-[0_4px_18px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* 2. Return to World Map */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onWorldMap();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-300 font-fantasy font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <Map className="w-3.5 h-3.5" />
              <span>World Map</span>
            </button>

            {/* 3. Return to Main Menu */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onMainMenu();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-300 font-fantasy font-semibold text-xs rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
