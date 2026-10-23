/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Sparkles, Heart, Timer as TimerIcon } from 'lucide-react';
import { LevelConfig, DifficultyMode } from '../types/game';

interface HUDProps {
  level: LevelConfig;
  score: number;
  highScore: number;
  timeRemaining: number;
  difficulty: DifficultyMode;
  crystalsCollected: number;
  totalCrystals: number;
  health: number;
  maxHealth: number;
  portalUnlocked: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  notificationMessage?: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  score,
  highScore,
  timeRemaining,
  difficulty,
  crystalsCollected,
  totalCrystals,
  health,
  maxHealth,
  portalUnlocked,
  soundEnabled,
  onToggleSound,
  onPause,
  notificationMessage,
}) => {
  // Format MM:SS
  const safeTime = Math.max(0, Math.floor(timeRemaining));
  const minutes = Math.floor(safeTime / 60);
  const seconds = safeTime % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isLowTime = safeTime <= 20;

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-4 pointer-events-none z-20 flex flex-col justify-between h-full">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-2 max-w-7xl mx-auto w-full">
        {/* Brand & Level Info */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-amber-600/30 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-fantasy font-black tracking-wider text-amber-400 text-xs sm:text-sm">
                CRYSTALBOUND
              </span>
              <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-[10px] px-1.5 py-0.2 rounded">
                LVL {level.id}
              </span>
              <span className="hidden sm:inline bg-stone-800 text-stone-400 font-mono text-[9px] px-1 rounded uppercase">
                {difficulty}
              </span>
            </div>
            <div className="text-stone-300 font-medium text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[180px]">
              {level.name}
            </div>
          </div>
        </div>

        {/* Center: Timer, Crystals & Portal Status */}
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {/* Countdown Timer Widget */}
            <div
              className={`backdrop-blur-md border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-xl flex items-center gap-2 transition-all ${
                isLowTime
                  ? 'bg-rose-950/95 border-rose-500 text-rose-200 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-stone-900/90 border-amber-600/30 text-amber-300'
              }`}
            >
              <TimerIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}`} />
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 leading-none">Time</span>
                <span className={`font-mono font-black text-sm sm:text-base leading-tight ${isLowTime ? 'text-rose-300' : 'text-amber-200'}`}>
                  {timeFormatted}
                </span>
              </div>
            </div>

            {/* Crystal Count & Portal Widget */}
            <div className="bg-stone-900/90 backdrop-blur-md border border-emerald-500/30 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-xl flex items-center gap-2 sm:gap-3">
              {/* Crystals */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-pulse" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider leading-none">Crystals</span>
                  <span className="font-fantasy font-black text-emerald-300 text-sm sm:text-base leading-tight">
                    {crystalsCollected} / {totalCrystals}
                  </span>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-stone-700/60" />

              {/* Portal Status */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                    portalUnlocked
                      ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping'
                      : 'bg-stone-600'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden xs:inline ${
                    portalUnlocked ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {portalUnlocked ? (level.id === 100 ? 'Heart Awakened!' : 'Open!') : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* Warning / Hint Notification banner */}
          {notificationMessage && (
            <div className="bg-amber-950/90 border border-amber-500/60 text-amber-200 px-3 py-1 rounded-lg text-xs font-medium shadow-lg animate-bounce">
              {notificationMessage}
            </div>
          )}
        </div>

        {/* Right: Score, Health & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Health & Score Card */}
          <div className="hidden sm:flex bg-stone-900/90 backdrop-blur-md border border-amber-600/30 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-xl items-center gap-3">
            {/* Hearts */}
            <div className="flex items-center gap-1">
              {Array.from({ length: maxHealth }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < health
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                      : 'text-stone-600'
                  }`}
                />
              ))}
            </div>

            <div className="h-6 w-[1px] bg-stone-700/60" />

            {/* Score */}
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider leading-none">Score</span>
              <span className="font-fantasy font-black text-amber-300 text-sm sm:text-base leading-tight">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 sm:p-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-amber-300 border border-amber-600/30 rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-stone-500" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="p-2 sm:p-2.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-amber-300 border border-amber-600/30 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline text-xs font-semibold uppercase pr-1">Pause</span>
          </button>
        </div>
      </div>

      {/* Mobile Hearts & Score Bar (visible on small screens) */}
      <div className="sm:hidden pointer-events-auto flex items-center justify-between bg-stone-900/90 backdrop-blur-md border border-amber-600/30 rounded-xl px-3 py-1.5 shadow-lg w-full mt-auto mb-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: maxHealth }).map((_, i) => (
            <Heart
              key={i}
              className={`w-3.5 h-3.5 ${i < health ? 'text-rose-500 fill-rose-500' : 'text-stone-600'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-stone-400 font-bold">Score:</span>
          <span className="font-fantasy font-bold text-amber-300 text-xs">
            {score.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
