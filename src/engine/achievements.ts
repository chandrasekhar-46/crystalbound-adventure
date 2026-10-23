/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Achievement } from '../types/game';

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_crystal: {
    id: 'first_crystal',
    title: 'First Crystal',
    description: 'Gather your very first ancient crystal in Aetherfall.',
    icon: 'Sparkles',
  },
  forest_explorer: {
    id: 'forest_explorer',
    title: 'Forest Explorer',
    description: 'Conquer all 10 levels of the Whispering Woods.',
    icon: 'TreePine',
  },
  speed_seeker: {
    id: 'speed_seeker',
    title: 'Speed Seeker',
    description: 'Complete any realm with over 50% time remaining.',
    icon: 'Timer',
  },
  crystal_collector: {
    id: 'crystal_collector',
    title: 'Crystal Hoarder',
    description: 'Collect 50 ancient crystals across your expedition.',
    icon: 'Trophy',
  },
  perfect_path: {
    id: 'perfect_path',
    title: 'Untouchable Seeker',
    description: 'Complete a level with hazards without taking any damage.',
    icon: 'Shield',
  },
  halfway_hero: {
    id: 'halfway_hero',
    title: 'Halfway Hero',
    description: 'Conquer World 5 and reach Level 51.',
    icon: 'Flame',
  },
  master_aetherfall: {
    id: 'master_aetherfall',
    title: 'Master of Aetherfall',
    description: 'Restore the Eternal Crystal Heart across all 100 levels!',
    icon: 'Award',
  },
};
