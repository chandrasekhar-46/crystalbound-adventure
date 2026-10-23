/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Trophy, Sparkles, Award, Shield, Timer, Flame, Trees as TreePine } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  const renderIcon = () => {
    switch (achievement.icon) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'TreePine':
        return <TreePine className="w-5 h-5 text-emerald-400" />;
      case 'Timer':
        return <Timer className="w-5 h-5 text-amber-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Award':
      case 'Trophy':
      default:
        return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none select-none animate-bounce">
      <div className="bg-stone-900/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-3 max-w-sm backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center shrink-0">
          {renderIcon()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
              Achievement Unlocked!
            </span>
          </div>
          <span className="font-fantasy font-black text-stone-100 text-sm">
            {achievement.title}
          </span>
          <span className="text-xs text-stone-300 leading-tight">
            {achievement.description}
          </span>
        </div>
      </div>
    </div>
  );
};
