/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Settings, Home, AlertCircle, Map } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  levelName: string;
  levelNumber: number;
  score: number;
  onResume: () => void;
  onRestartLevel: () => void;
  onWorldMap: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelName,
  levelNumber,
  score,
  onResume,
  onRestartLevel,
  onWorldMap,
  onOpenSettings,
  onMainMenu,
}) => {
  const [confirmQuit, setConfirmQuit] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 select-none">
      <div className="relative max-w-sm w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center">
        {/* Title */}
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-amber-400 block mb-1">
          Journey Paused
        </span>
        <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100 mb-1">
          CRYSTALBOUND
        </h2>
        <p className="text-xs text-stone-400 font-medium mb-6">
          Level {levelNumber}: {levelName}
        </p>

        {/* Buttons */}
        {!confirmQuit ? (
          <div className="space-y-2.5">
            {/* Resume */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onResume();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-stone-100 font-fantasy font-bold text-sm rounded-xl border border-emerald-400/40 shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current text-amber-300" />
              <span>Resume Game</span>
            </button>

            {/* Restart Level */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onRestartLevel();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-2.5 bg-stone-800/90 hover:bg-stone-750 text-stone-200 hover:text-amber-300 font-fantasy font-bold text-sm rounded-xl border border-stone-700 hover:border-amber-500/40 shadow transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Level</span>
            </button>

            {/* World Map */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onWorldMap();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-2.5 bg-stone-800/90 hover:bg-stone-750 text-stone-200 hover:text-amber-300 font-fantasy font-bold text-sm rounded-xl border border-stone-700 hover:border-amber-500/40 shadow transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>World Map</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenSettings();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-2.5 bg-stone-800/90 hover:bg-stone-750 text-stone-200 hover:text-amber-300 font-fantasy font-bold text-sm rounded-xl border border-stone-700 hover:border-amber-500/40 shadow transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Main Menu */}
            <button
              onClick={() => setConfirmQuit(true)}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-2.5 bg-stone-800/50 hover:bg-stone-800 text-stone-400 hover:text-stone-200 font-fantasy font-semibold text-xs rounded-xl border border-stone-750 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Main Menu</span>
            </button>
          </div>
        ) : (
          <div className="bg-stone-950/70 border border-amber-600/30 rounded-xl p-4 text-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-300 justify-center">
              <AlertCircle className="w-4 h-4" />
              <span className="font-bold">Leave current level?</span>
            </div>
            <p className="text-stone-400 text-xs">
              Progress in this active level attempt will be reset, but all previously unlocked realms and high scores remain saved.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setConfirmQuit(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onMainMenu();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg cursor-pointer"
              >
                Quit to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
