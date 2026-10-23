/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Shield, Compass, Navigation, KeyRound } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 sm:p-6 select-none overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
              Seeker&apos;s Codex
            </span>
            <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100">
              How to Play
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            aria-label="Close How to Play"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-stone-300">
          {/* 1. Core Mission */}
          <div className="bg-stone-950/60 border border-emerald-500/30 rounded-xl p-4 flex gap-4 items-start">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-fantasy font-bold text-base text-emerald-300 mb-1">
                The Quest
              </h3>
              <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
                As <strong className="text-amber-300">The Crystal Seeker</strong>, guide your hero across five mystical realms of Aetherfall. Collect all ancient crystals scattered throughout each level to awaken the exit portal and ultimately restore the fractured <strong className="text-amber-300">Crystal Heart</strong>.
              </p>
            </div>
          </div>

          {/* 2. Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Desktop */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Navigation className="w-4 h-4" />
                <h4 className="font-fantasy font-bold text-sm text-stone-100">Desktop Controls</h4>
              </div>
              <ul className="space-y-2 text-xs text-stone-300">
                <li className="flex justify-between items-center">
                  <span>Movement:</span>
                  <span className="font-mono bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-amber-200">W, A, S, D</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Arrow Keys:</span>
                  <span className="font-mono bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-amber-200">&uarr; &larr; &darr; &rarr;</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Pause Game:</span>
                  <span className="font-mono bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-amber-200">P or Esc</span>
                </li>
              </ul>
            </div>

            {/* Mobile */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Navigation className="w-4 h-4" />
                <h4 className="font-fantasy font-bold text-sm text-stone-100">Touch & Mobile</h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                On touch devices, a responsive on-screen Directional Pad appears in the bottom left corner. Tap or hold any arrow to move your adventurer smoothly.
              </p>
            </div>
          </div>

          {/* 3. Mechanics & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-amber-300 mb-1">
                  Crystals & Portals
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Each crystal grants <strong className="text-stone-200">100 points</strong>. The realm exit remains sealed until every crystal is gathered. Once collected, step inside the portal to advance!
                </p>
              </div>
            </div>

            <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-fantasy font-bold text-xs uppercase tracking-wider text-rose-300 mb-1">
                  Hazards & Vitality
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Avoid arcane sentinels and pulsing rifts. If struck, your crystal shield grants brief invulnerability to recover your footing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-stone-100 font-fantasy font-bold text-sm rounded-xl border border-emerald-400/40 shadow-lg transition-all cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
