/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, FastForward, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface StoryIntroModalProps {
  onStartGame: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ onStartGame }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    soundManager.startMusic();
    const timer = setTimeout(() => {
      setStep(1);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    soundManager.playUiClick();
    onStartGame();
  };

  const handleNext = () => {
    soundManager.playUiClick();
    if (step === 0) {
      setStep(1);
    } else {
      onStartGame();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-6 select-none animate-fadeIn">
      <div className="relative max-w-xl w-full bg-stone-900/90 border-2 border-amber-600/40 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center text-center">
        {/* Glowing Crest */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-900 to-amber-900 border border-amber-400/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
          <Sparkles className="w-8 h-8 text-amber-300" />
        </div>

        {/* Story Text Sequence */}
        <div className="min-h-[160px] flex flex-col justify-center items-center">
          {step === 0 && (
            <div className="transition-all duration-700 ease-in-out opacity-100">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-400 mb-3 block">
                The Lore of Aetherfall
              </span>
              <p className="font-fantasy text-xl sm:text-2xl text-stone-100 leading-relaxed font-semibold italic drop-shadow">
                &ldquo;Beyond the forgotten mountains lies a world shaped by magic.&rdquo;
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="transition-all duration-700 ease-in-out opacity-100">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-amber-400 mb-3 block">
                The Call of the Seeker
              </span>
              <p className="font-fantasy text-xl sm:text-2xl text-stone-100 leading-relaxed font-semibold italic drop-shadow mb-3">
                &ldquo;The Crystal Heart has shattered. Its power is fading. Only a true Crystal Seeker can restore the light.&rdquo;
              </p>
              <p className="text-sm text-stone-400 font-normal">
                Your journey begins in the Whispering Woods...
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-stone-800">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-400 hover:text-stone-200 px-3 py-2 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
            <span>Skip Intro</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-stone-50 font-fantasy font-bold text-sm rounded-xl border border-amber-400/40 shadow-lg hover:shadow-amber-900/40 transition-all cursor-pointer hover:scale-105"
          >
            <span>{step === 0 ? 'Next' : 'Enter Aetherfall'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
