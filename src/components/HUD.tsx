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
    <div className="absolute inset-x-0 top-0 pointer-events-none z-30 select-none flex flex-col">
      {/* 1. Desktop & Tablet Top HUD Bar */}
      <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-stone-950/85 backdrop-blur-md border-b border-amber-600/30 shadow-2xl">
        {/* Left: Brand & Current Realm Info */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-fantasy font-black tracking-wider text-amber-400 text-sm lg:text-base drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
              CRYSTALBOUND
            </span>
            <span className="bg-amber-950/90 border border-amber-500/40 text-amber-300 font-bold text-xs px-2 py-0.5 rounded shadow">
              LVL {level.id}
            </span>
            <span className="bg-stone-850 border border-stone-700/60 text-stone-400 font-mono text-[10px] px-1.5 py-0.5 rounded uppercase">
              {difficulty}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-stone-700/60" />

          <div className="text-stone-300 font-medium text-xs lg:text-sm truncate max-w-[220px]">
            {level.name}
          </div>
        </div>

        {/* Center: Countdown Timer, Crystals & Portal Indicator */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
              isLowTime
                ? 'bg-rose-950/95 border-rose-500 text-rose-200 animate-pulse shadow-[0_0_18px_rgba(244,63,94,0.45)]'
                : 'bg-stone-900/90 border-amber-600/35 text-amber-300'
            }`}
          >
            <TimerIcon className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-amber-400'}`} />
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 leading-none">Timer</span>
              <span className={`font-mono font-black text-sm lg:text-base leading-tight ${isLowTime ? 'text-rose-300' : 'text-amber-200'}`}>
                {timeFormatted}
              </span>
            </div>
          </div>

          {/* Crystals Counter & Portal Status */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 bg-stone-900/90 border border-emerald-500/35 rounded-xl backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400 leading-none">Crystals</span>
                <span className="font-fantasy font-black text-emerald-300 text-sm lg:text-base leading-tight">
                  {crystalsCollected} / {totalCrystals}
                </span>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-stone-700/60" />

            {/* Portal Indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  portalUnlocked
                    ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-ping'
                    : 'bg-stone-600'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  portalUnlocked ? 'text-amber-300' : 'text-stone-400'
                }`}
              >
                {portalUnlocked ? (level.id === 100 ? 'Heart Awakened!' : 'Portal Open!') : 'Portal Sealed'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Health, Score & Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-stone-900/80 px-2.5 py-1.5 rounded-xl border border-stone-800">
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

          {/* Score */}
          <div className="flex flex-col items-end bg-stone-900/80 px-3 py-1 rounded-xl border border-stone-800">
            <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider leading-none">Score</span>
            <span className="font-fantasy font-black text-amber-300 text-sm lg:text-base leading-tight">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-amber-300 border border-amber-600/30 rounded-xl shadow transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            aria-label="Pause Game"
            className="px-3 py-2 bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-amber-300 border border-amber-600/30 rounded-xl shadow transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Pause className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Pause</span>
          </button>
        </div>
      </header>

      {/* 2. Mobile Streamlined Top HUD Bar */}
      <header className="md:hidden flex flex-col w-full bg-stone-950/90 backdrop-blur-md border-b border-amber-600/30 shadow-xl px-2.5 py-1.5 gap-1.5">
        {/* Row 1: Brand/Level + Score + Sound + Pause */}
        <div className="flex items-center justify-between w-full">
          <div className="pointer-events-auto flex items-center gap-1.5">
            <span className="font-fantasy font-black tracking-wider text-amber-400 text-xs">
              CRYSTALBOUND
            </span>
            <span className="bg-amber-950/90 border border-amber-500/40 text-amber-300 font-bold text-[10px] px-1.5 py-0.2 rounded">
              L{level.id}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Score */}
            <div className="bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800 text-right">
              <span className="font-fantasy font-bold text-amber-300 text-xs">
                {score.toLocaleString()}
              </span>
            </div>

            {/* Sound */}
            <button
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="p-1.5 bg-stone-900/90 text-stone-200 border border-amber-600/30 rounded-lg cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
              )}
            </button>

            {/* Pause */}
            <button
              onClick={onPause}
              aria-label="Pause Game"
              className="p-1.5 bg-stone-900/90 text-stone-200 border border-amber-600/30 rounded-lg cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Timer + Crystals + Portal + Hearts */}
        <div className="pointer-events-auto flex items-center justify-between bg-stone-900/80 border border-stone-800 rounded-lg px-2.5 py-1 text-xs">
          {/* Timer */}
          <div className="flex items-center gap-1">
            <TimerIcon className={`w-3.5 h-3.5 ${isLowTime ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-mono font-bold text-xs ${isLowTime ? 'text-rose-300 font-black' : 'text-amber-200'}`}>
              {timeFormatted}
            </span>
          </div>

          {/* Crystals */}
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-fantasy font-bold text-emerald-300 text-xs">
              {crystalsCollected}/{totalCrystals}
            </span>
          </div>

          {/* Portal Status */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                portalUnlocked
                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping'
                  : 'bg-stone-600'
              }`}
            />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${portalUnlocked ? 'text-amber-300' : 'text-stone-400'}`}>
              {portalUnlocked ? 'OPEN' : 'LOCKED'}
            </span>
          </div>

          {/* Hearts */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3 h-3 ${
                  i < health ? 'text-rose-500 fill-rose-500' : 'text-stone-600'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Floating Temporary Warning / Notification Banner */}
      {notificationMessage && (
        <div className="pointer-events-auto self-center mt-3 bg-amber-950/95 border border-amber-500/70 text-amber-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-2xl animate-bounce">
          {notificationMessage}
        </div>
      )}
    </div>
  );
};
