/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, Music, Sparkles, AlertTriangle, Trophy, Shield, Flame, Timer, Trees as TreePine, Award } from 'lucide-react';
import { GameSaveData, DifficultyMode } from '../types/game';
import { ACHIEVEMENTS } from '../engine/achievements';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  saveData: GameSaveData;
  onUpdateSound: (settings: Partial<GameSaveData['soundSettings']>) => void;
  onUpdateAccessibility: (settings: Partial<GameSaveData['accessibility']>) => void;
  onUpdateDifficulty: (difficulty: DifficultyMode) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSound,
  onUpdateAccessibility,
  onUpdateDifficulty,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'achievements'>('settings');

  const handleToggleMusic = () => {
    soundManager.playUiClick();
    onUpdateSound({ music: !saveData.soundSettings.music });
  };

  const handleToggleSfx = () => {
    soundManager.playUiClick();
    onUpdateSound({ sfx: !saveData.soundSettings.sfx });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSound({ masterVolume: val });
  };

  const handleToggleReducedMotion = () => {
    soundManager.playUiClick();
    onUpdateAccessibility({ reducedMotion: !saveData.accessibility.reducedMotion });
  };

  const handleConfirmReset = () => {
    soundManager.playUiClick();
    onResetProgress();
    setShowConfirmReset(false);
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'TreePine':
        return <TreePine className="w-4 h-4 text-emerald-400" />;
      case 'Timer':
        return <Timer className="w-4 h-4 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-sky-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Award':
      case 'Trophy':
      default:
        return <Trophy className="w-4 h-4 text-amber-400" />;
    }
  };

  const unlockedCount = Object.keys(saveData.achievements || {}).filter(k => saveData.achievements[k]).length;
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 sm:p-6 select-none overflow-y-auto">
      <div className="relative max-w-lg w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
              Seeker Preferences
            </span>
            <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100">
              Settings & Codex
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            aria-label="Close Settings"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 mb-5 gap-2">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('settings');
            }}
            className={`pb-2 px-3 text-xs font-fantasy font-bold uppercase transition-colors cursor-pointer border-b-2 ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('achievements');
            }}
            className={`pb-2 px-3 text-xs font-fantasy font-bold uppercase transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Achievements</span>
            <span className="bg-amber-950 border border-amber-500/40 text-[10px] px-1.5 rounded-full text-amber-300">
              {unlockedCount}/{totalAchievements}
            </span>
          </button>
        </div>

        {activeTab === 'settings' ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Difficulty Mode Selection */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2.5">
              <h3 className="font-fantasy font-bold text-xs uppercase tracking-wider text-amber-300">
                Difficulty Mode
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'normal', 'hard'] as DifficultyMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      soundManager.playUiClick();
                      onUpdateDifficulty(mode);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      saveData.selectedDifficulty === mode
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200 shadow'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="font-fantasy font-bold text-xs uppercase block">{mode}</span>
                    <span className="text-[10px] text-stone-400">
                      {mode === 'easy' ? '4 Hearts • +35% Time' : mode === 'hard' ? '2 Hearts • 1.6x Score' : '3 Hearts • Balanced'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Controls */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3.5">
              <h3 className="font-fantasy font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Audio Controls</span>
              </h3>

              {/* Music Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-stone-200">Atmospheric Music</span>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    saveData.soundSettings.music ? 'bg-emerald-600' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      saveData.soundSettings.music ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* SFX Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-stone-200">Sound Effects (SFX)</span>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    saveData.soundSettings.sfx ? 'bg-emerald-600' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      saveData.soundSettings.sfx ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Master Volume */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Master Volume</span>
                  <span className="font-mono text-amber-300">
                    {Math.round(saveData.soundSettings.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={saveData.soundSettings.masterVolume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-500 bg-stone-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3">
              <h3 className="font-fantasy font-bold text-xs uppercase tracking-wider text-amber-300">
                Accessibility
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-stone-200 block">Reduced Motion</span>
                  <span className="text-xs text-stone-400">Softens ambient floating particles</span>
                </div>
                <button
                  onClick={handleToggleReducedMotion}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                    saveData.accessibility.reducedMotion ? 'bg-emerald-600' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      saveData.accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Clear Progress */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4">
              {!showConfirmReset ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-stone-200 block">Saved Progress</span>
                    <span className="text-xs text-stone-400">Reset unlocked levels, achievements & scores</span>
                  </div>
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Data
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Are you sure? This will reset all 100 unlocked realms and high scores.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmReset}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Yes, Reset Progress
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Achievements List */
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {Object.values(ACHIEVEMENTS).map(ach => {
              const isUnlocked = !!saveData.achievements?.[ach.id];
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                    isUnlocked
                      ? 'bg-stone-950/80 border-amber-500/40'
                      : 'bg-stone-950/40 border-stone-800 opacity-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                    isUnlocked
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-600'
                  }`}>
                    {renderIcon(ach.icon)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-fantasy font-bold text-sm text-stone-200">
                        {ach.title}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400">
                      {ach.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-fantasy font-bold text-sm rounded-xl border border-stone-600 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
