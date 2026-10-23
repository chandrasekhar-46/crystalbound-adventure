/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Heart, Shield, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 sm:p-6 select-none overflow-y-auto">
      <div className="relative max-w-lg w-full bg-stone-900/95 border-2 border-amber-600/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] my-auto text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-800 text-left">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-400">
              Hall of Chronicles
            </span>
            <h2 className="font-fantasy font-black text-2xl sm:text-3xl text-stone-100">
              Credits
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            aria-label="Close Credits"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Credits Details */}
        <div className="space-y-6 text-stone-300">
          <div className="space-y-1">
            <h3 className="font-fantasy font-black text-xl text-amber-300 tracking-wider">
              CRYSTALBOUND: THE QUEST BEGINS
            </h3>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-semibold">
              An Original Fantasy Exploration Experience
            </p>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-5 space-y-4 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
              <span className="text-stone-400">Game Design & Direction</span>
              <span className="font-medium text-stone-200">The Aetherfall Studio Team</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
              <span className="text-stone-400">Lead Gameplay Programming</span>
              <span className="font-medium text-stone-200">Canvas 2D Physics & Engine</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
              <span className="text-stone-400">World & Lore Architecture</span>
              <span className="font-medium text-stone-200">Chronicles of the Crystal Heart</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
              <span className="text-stone-400">Audio & Synthesizer</span>
              <span className="font-medium text-stone-200">Web Audio Ambient Synthesizer</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-stone-400">Special Thanks</span>
              <span className="font-medium text-amber-300">All Crystal Seekers of Aetherfall</span>
            </div>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed italic">
            &ldquo;May the radiant glow of the restored Crystal Heart guide your path through the darkest realms.&rdquo;
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-800 flex justify-center">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-8 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-stone-100 font-fantasy font-bold text-sm rounded-xl border border-emerald-400/40 shadow-lg transition-all cursor-pointer"
          >
            Return
          </button>
        </div>
      </div>
    </div>
  );
};
