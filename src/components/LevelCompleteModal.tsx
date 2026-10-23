/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Sparkles, Trophy, ArrowRight, RotateCcw, Home, CheckCircle2, Timer } from 'lucide-react';
import { LevelConfig, SCORING, DifficultyMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface LevelCompleteModalProps {
  level: LevelConfig;
  crystalsCollected: number;
  totalCrystals: number;
  levelScore: number;
  timeBonus: number;
  timeRemaining: number;
  difficulty: DifficultyMode;
  totalScore: number;
  isFinalLevel: boolean;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  crystalsCollected,
  totalCrystals,
  levelScore,
  timeBonus,
  timeRemaining,
  difficulty,
  totalScore,
  isFinalLevel,
  onNextLevel,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    soundManager.playLevelComplete();
  }, []);

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 sm:p-6 select-none animate-fadeIn overflow-y-auto">
      <div className="relative max-w-md w-full bg-stone-900/95 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.25)] text-center my-auto">
        {/* Crest */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-emerald-900 to-amber-900 border-2 border-amber-400/60 flex items-center justify-center mb-4 shadow-[0_0_24px_rgba(251,191,36,0.35)] animate-bounce">
          <Trophy className="w-8 h-8 text-amber-300" />
        </div>

        {/* Exact Required Title & Message */}
        <h2 className="font-fantasy font-black text-3xl sm:text-4xl text-emerald-300 tracking-wide mb-1">
          LEVEL COMPLETED!
        </h2>
        <p className="text-base text-stone-200 font-medium mb-1">
          Congratulations! You completed the level.
        </p>
        <p className="text-xs text-amber-400/90 font-medium mb-5">
          {level.worldName} • Level {level.id}: {level.name}
        </p>

        {/* Detailed Score Breakdown Card */}
        <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 mb-6 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Crystals Gathered:</span>
            </span>
            <span className="font-fantasy font-bold text-emerald-300">
              {crystalsCollected} / {totalCrystals} (+{crystalsCollected * SCORING.CRYSTAL_POINTS})
            </span>
          </div>

          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Realm Clear Bonus:</span>
            </span>
            <span className="font-fantasy font-bold text-amber-300">
              +{SCORING.LEVEL_COMPLETE_BONUS} PTS
            </span>
          </div>

          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-sky-400" />
              <span>Speed Bonus ({formatTime(timeRemaining)} left):</span>
            </span>
            <span className="font-fantasy font-bold text-sky-300">
              +{timeBonus} PTS
            </span>
          </div>

          <div className="flex justify-between items-center text-stone-400 text-xs pt-1 border-t border-stone-800/60">
            <span>Difficulty Mode:</span>
            <span className="uppercase font-bold text-stone-200">
              {difficulty} ({SCORING.DIFFICULTY_MULTIPLIER[difficulty]}x Multiplier)
            </span>
          </div>

          <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-stone-100 font-bold">
            <span>Total Campaign Score:</span>
            <span className="font-fantasy font-black text-lg text-amber-400">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Exact Required Buttons */}
        <div className="space-y-3">
          {/* NEXT LEVEL */}
          {!isFinalLevel && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onNextLevel();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-stone-50 font-fantasy font-bold text-sm sm:text-base rounded-xl border border-amber-400/50 shadow-[0_4px_18px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* PLAY AGAIN */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onPlayAgain();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-300 font-fantasy font-bold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
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
              className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800/80 hover:bg-stone-750 text-stone-300 hover:text-amber-300 font-fantasy font-bold text-xs sm:text-sm rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
