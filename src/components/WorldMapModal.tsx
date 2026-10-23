/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Play, Sparkles, Trophy, Timer, ChevronRight, ChevronLeft, ShieldCheck, Flame } from 'lucide-react';
import { LevelId, WorldId, GameSaveData, DifficultyMode } from '../types/game';
import { WORLDS } from '../engine/levelGenerator';
import { getLevel } from '../data/levels';
import { soundManager } from '../audio/soundManager';

interface WorldMapModalProps {
  saveData: GameSaveData;
  onSelectLevel: (levelId: LevelId) => void;
  onSelectDifficulty: (difficulty: DifficultyMode) => void;
  onClose: () => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  saveData,
  onSelectLevel,
  onSelectDifficulty,
  onClose,
}) => {
  // Determine initial world tab based on highest unlocked level
  const initialWorldId = Math.min(10, Math.max(1, Math.ceil(saveData.highestUnlockedLevel / 10)));
  const [activeWorldId, setActiveWorldId] = useState<WorldId>(initialWorldId);

  const activeWorld = WORLDS[activeWorldId - 1];
  const [startLevel, endLevel] = activeWorld.levelsRange;
  const worldLevels: number[] = [];
  for (let l = startLevel; l <= endLevel; l++) {
    worldLevels.push(l);
  }

  // Count completions in active world
  const activeWorldCompletedCount = worldLevels.filter(id => saveData.completedLevels.includes(id)).length;
  const activeWorldPercent = Math.round((activeWorldCompletedCount / worldLevels.length) * 100);

  // Total game progress
  const totalCompleted = saveData.completedLevels.length;
  const totalPercent = Math.round((totalCompleted / 100) * 100);

  const formatTime = (seconds: number) => {
    if (!seconds || seconds >= 999999) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleLevelClick = (id: number, isLocked: boolean) => {
    if (isLocked) return;
    soundManager.playUiClick();
    onSelectLevel(id);
  };

  const handleDifficultyChange = (diff: DifficultyMode) => {
    soundManager.playUiClick();
    onSelectDifficulty(diff);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-2 sm:p-6 select-none overflow-y-auto">
      <div className="relative max-w-5xl w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-4 sm:p-7 shadow-[0_0_60px_rgba(245,158,11,0.2)] my-auto flex flex-col max-h-[95vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-3 border-b border-stone-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
                Aetherfall World Map
              </span>
              <span className="bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                {totalCompleted} / 100 Realms Cleared ({totalPercent}%)
              </span>
            </div>
            <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100">
              Expedition Chronicles
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Difficulty Selector */}
            <div className="hidden sm:flex items-center bg-stone-950/80 border border-stone-800 rounded-xl p-1 gap-1">
              {(['easy', 'normal', 'hard'] as DifficultyMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleDifficultyChange(mode)}
                  className={`px-2.5 py-1 text-xs font-fantasy font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                    saveData.selectedDifficulty === mode
                      ? 'bg-amber-600 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              aria-label="Close World Map"
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 10 Worlds Navigation Carousel / Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 mb-3 scrollbar-none shrink-0 border-b border-stone-800/80">
          {WORLDS.map(w => {
            const isUnlocked = saveData.unlockedWorlds.includes(w.id);
            const isCurrent = activeWorldId === w.id;
            const wLevelsCount = w.levelsRange[1] - w.levelsRange[0] + 1;
            const completedInW = saveData.completedLevels.filter(
              lvl => lvl >= w.levelsRange[0] && lvl <= w.levelsRange[1]
            ).length;

            return (
              <button
                key={w.id}
                onClick={() => {
                  soundManager.playUiClick();
                  setActiveWorldId(w.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isCurrent
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : isUnlocked
                    ? 'bg-stone-900/80 border-stone-800 text-stone-300 hover:border-amber-600/40 hover:bg-stone-850'
                    : 'bg-stone-950/40 border-stone-850 text-stone-600 opacity-60 cursor-pointer'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isUnlocked ? w.accentColor : '#525252' }}
                />
                <span className="font-fantasy font-bold">W{w.id}</span>
                <span className="hidden md:inline font-medium text-stone-400">{w.name}</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {completedInW}/{wLevelsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active World Banner */}
        <div
          className="p-3.5 sm:p-4 rounded-xl mb-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: `${activeWorld.bgColor}dd`,
            borderColor: `${activeWorld.accentColor}55`,
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: activeWorld.accentColor }}>
                World {activeWorld.id} of 10
              </span>
              <span className="text-stone-500">•</span>
              <span className="text-xs text-stone-300 font-medium">{activeWorld.subtitle}</span>
            </div>
            <h3 className="font-fantasy font-black text-xl text-stone-100">{activeWorld.name}</h3>
            <p className="text-xs text-stone-400 max-w-xl">{activeWorld.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Progress</span>
              <span className="font-fantasy font-black text-base text-amber-300">
                {activeWorldCompletedCount} / 10 Cleared ({activeWorldPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* 10 Levels Grid for the Selected World */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 overflow-y-auto pr-1 flex-1 min-h-[220px]">
          {worldLevels.map(lvlId => {
            const levelConfig = getLevel(lvlId, saveData.selectedDifficulty);
            const isUnlocked = lvlId <= saveData.highestUnlockedLevel;
            const isCompleted = saveData.completedLevels.includes(lvlId);
            const score = saveData.levelScores[lvlId] || 0;
            const bestTime = saveData.levelBestTimes[lvlId] || 0;

            return (
              <div
                key={lvlId}
                onClick={() => handleLevelClick(lvlId, !isUnlocked)}
                className={`group rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-stone-900/90 border-amber-600/30 hover:border-amber-400 hover:bg-stone-800/90 hover:-translate-y-0.5 shadow-md hover:shadow-amber-900/30 cursor-pointer'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-55 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-fantasy font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      #{lvlId}
                    </span>

                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isUnlocked ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </div>

                  <h4 className="font-fantasy font-black text-xs sm:text-sm text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                    {levelConfig.name}
                  </h4>

                  <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                    <Timer className="w-3 h-3 text-amber-400" />
                    <span>Limit: {formatTime(levelConfig.timeLimit)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span className="font-fantasy font-bold text-amber-300">
                      {score > 0 ? score.toLocaleString() : '—'}
                    </span>
                  </div>

                  {bestTime > 0 && (
                    <span className="text-emerald-400 font-mono font-semibold">
                      {formatTime(bestTime)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveWorldId(Math.max(1, activeWorldId - 1) as WorldId)}
              disabled={activeWorldId === 1}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev World</span>
            </button>
            <button
              onClick={() => setActiveWorldId(Math.min(10, activeWorldId + 1) as WorldId)}
              disabled={activeWorldId === 10}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next World</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-fantasy font-bold text-xs sm:text-sm rounded-xl border border-stone-600 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
