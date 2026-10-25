/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { InputState } from '../engine/physics';

interface MobileControlsProps {
  onInput: (action: keyof InputState, active: boolean) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput }) => {
  const handleTouch = (key: keyof InputState, active: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInput(key, active);
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-30 pointer-events-auto md:hidden select-none touch-none"
    >
      <div className="relative w-36 h-36 bg-stone-900/80 backdrop-blur-md rounded-full border-2 border-amber-600/40 p-2 shadow-2xl flex items-center justify-center">
        {/* Up Button */}
        <button
          type="button"
          onTouchStart={handleTouch('up', true)}
          onTouchEnd={handleTouch('up', false)}
          onTouchCancel={handleTouch('up', false)}
          onMouseDown={handleTouch('up', true)}
          onMouseUp={handleTouch('up', false)}
          onMouseLeave={handleTouch('up', false)}
          aria-label="Move Up"
          className="absolute top-1 w-11 h-11 bg-stone-800/90 active:bg-amber-600/80 text-amber-200 border border-amber-500/30 rounded-full flex items-center justify-center shadow transition-transform active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down Button */}
        <button
          type="button"
          onTouchStart={handleTouch('down', true)}
          onTouchEnd={handleTouch('down', false)}
          onTouchCancel={handleTouch('down', false)}
          onMouseDown={handleTouch('down', true)}
          onMouseUp={handleTouch('down', false)}
          onMouseLeave={handleTouch('down', false)}
          aria-label="Move Down"
          className="absolute bottom-1 w-11 h-11 bg-stone-800/90 active:bg-amber-600/80 text-amber-200 border border-amber-500/30 rounded-full flex items-center justify-center shadow transition-transform active:scale-95"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left Button */}
        <button
          type="button"
          onTouchStart={handleTouch('left', true)}
          onTouchEnd={handleTouch('left', false)}
          onTouchCancel={handleTouch('left', false)}
          onMouseDown={handleTouch('left', true)}
          onMouseUp={handleTouch('left', false)}
          onMouseLeave={handleTouch('left', false)}
          aria-label="Move Left"
          className="absolute left-1 w-11 h-11 bg-stone-800/90 active:bg-amber-600/80 text-amber-200 border border-amber-500/30 rounded-full flex items-center justify-center shadow transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Button */}
        <button
          type="button"
          onTouchStart={handleTouch('right', true)}
          onTouchEnd={handleTouch('right', false)}
          onTouchCancel={handleTouch('right', false)}
          onMouseDown={handleTouch('right', true)}
          onMouseUp={handleTouch('right', false)}
          onMouseLeave={handleTouch('right', false)}
          aria-label="Move Right"
          className="absolute right-1 w-11 h-11 bg-stone-800/90 active:bg-amber-600/80 text-amber-200 border border-amber-500/30 rounded-full flex items-center justify-center shadow transition-transform active:scale-95"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Gem Pivot */}
        <div className="w-7 h-7 bg-amber-600/30 border border-amber-400/50 rounded-full flex items-center justify-center pointer-events-none">
          <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b]" />
        </div>
      </div>
    </div>
  );
};
