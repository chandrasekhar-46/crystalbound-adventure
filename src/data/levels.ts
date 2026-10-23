/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, LevelId, DifficultyMode } from '../types/game';
import { generateLevel, WORLDS } from '../engine/levelGenerator';

export { WORLDS };

// Cache of generated levels to avoid re-generating repeatedly
const levelCache: Record<string, LevelConfig> = {};

export function getLevel(id: LevelId, difficulty: DifficultyMode = 'normal'): LevelConfig {
  const boundedId = Math.max(1, Math.min(100, Math.floor(id)));
  const cacheKey = `${boundedId}_${difficulty}`;
  if (!levelCache[cacheKey]) {
    levelCache[cacheKey] = generateLevel(boundedId, difficulty);
  }
  return levelCache[cacheKey];
}

// Proxy object for backward compatibility with `LEVELS[id]`
export const LEVELS: Record<number, LevelConfig> = new Proxy({} as Record<number, LevelConfig>, {
  get: (_target, prop) => {
    const id = Number(prop);
    if (!isNaN(id) && id >= 1 && id <= 100) {
      return getLevel(id, 'normal');
    }
    return undefined;
  },
});
