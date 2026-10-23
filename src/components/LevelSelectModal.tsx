/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Lock, CheckCircle2, Play, Sparkles, Trophy } from 'lucide-react';
import { LevelId, GameSaveData } from '../types/game';
import { LEVELS } from '../data/levels';
import { soundManager } from '../audio/soundManager';

interface LevelSelectModalProps {
  saveData: GameSaveData;
  onSelectLevel: (levelId: LevelId) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onClose,
}) => {
  const levelIds: LevelId[] = [1, 2, 3, 4, 5];

  const handleSelect = (id: LevelId, isLocked: boolean) => {
    if (isLocked) return;
    soundManager.playUiClick();
    onSelectLevel(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 sm:p-6 select-none overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
              Expedition Map
            </span>
            <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100">
              Select a Region
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            aria-label="Close Level Selection"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {levelIds.map(id => {
            const level = LEVELS[id];
            const isUnlocked = id <= saveData.highestUnlockedLevel;
            const isCompleted = saveData.completedLevels.includes(id);
            const score = saveData.levelScores[id] || 0;

            return (
              <div
                key={id}
                onClick={() => handleSelect(id, !isUnlocked)}
                className={`group relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-stone-900/90 border-amber-600/30 hover:border-amber-400 hover:bg-stone-800/90 hover:-translate-y-1 shadow-lg hover:shadow-amber-900/30 cursor-pointer'
                    : 'bg-stone-950/60 border-stone-800/80 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-fantasy font-bold text-xs uppercase px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      Level {id}
                    </span>

                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Cleared</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>

                  {/* Level Name & Subtitle */}
                  <h3 className="font-fantasy font-black text-lg text-stone-100 group-hover:text-amber-300 transition-colors mb-1">
                    {level.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-medium mb-3">
                    {level.subtitle}
                  </p>
                  <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                    {level.description}
                  </p>
                </div>

                {/* Bottom stats & action */}
                <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-stone-400">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Best:</span>
                    <span className="font-fantasy font-bold text-amber-300">
                      {score > 0 ? score.toLocaleString() : '—'}
                    </span>
                  </div>

                  {isUnlocked && (
                    <div className="flex items-center gap-1 text-xs font-bold font-fantasy text-emerald-400 group-hover:text-emerald-300">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Replay' : 'Embark'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-fantasy font-bold text-sm rounded-xl border border-stone-600 transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
