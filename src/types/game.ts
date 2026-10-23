/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenState = 
  | 'MENU' 
  | 'INTRO' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'LEVEL_SELECT' 
  | 'HOW_TO_PLAY' 
  | 'SETTINGS' 
  | 'CREDITS' 
  | 'LEVEL_COMPLETE' 
  | 'TIME_UP'
  | 'GAME_OVER'
  | 'GAME_VICTORY';

export type LevelId = number; // 1 to 100
export type WorldId = number; // 1 to 10

export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Player {
  x: number;
  y: number;
  radius: number;
  speed: number;
  health: number;
  maxHealth: number;
  facing: Direction;
  isMoving: boolean;
  walkCycle: number;
  invulnerableTime: number; // in seconds
  flashTimer: number;
  tookDamageThisLevel?: boolean;
}

export interface Crystal {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  collected: boolean;
  pulseOffset: number;
  value: number;
}

export type ObstacleType = 
  | 'stone_wall' 
  | 'mossy_ruin' 
  | 'ancient_tree' 
  | 'crystal_pillar' 
  | 'abyss' 
  | 'rune_pillar'
  | 'hedge'
  | 'magma_rock'
  | 'ice_block'
  | 'shadow_obelisk'
  | 'celestial_pillar';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  color?: string;
  detailColor?: string;
  isDangerous?: boolean;
}

export type HazardType = 
  | 'patrol_sentinel' 
  | 'crystal_orb' 
  | 'pulsing_rune' 
  | 'void_rift'
  | 'magma_surge'
  | 'frost_vortex';

export interface Hazard {
  id: string;
  type: HazardType;
  x: number;
  y: number;
  radius: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  speed?: number;
  progress?: number;
  direction?: 1 | -1;
  glowColor: string;
}

export interface ExitPortal {
  x: number;
  y: number;
  radius: number;
  unlocked: boolean;
  activePulse: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export type EnvironmentType = 
  | 'forest' 
  | 'ruins' 
  | 'caves' 
  | 'sky_isles' 
  | 'volcanic' 
  | 'frozen' 
  | 'shadow' 
  | 'ancient_citadel' 
  | 'celestial' 
  | 'eternal_sanctum'
  | 'crystal_heart';

export interface LevelConfig {
  id: LevelId;
  worldId: WorldId;
  worldName: string;
  name: string;
  subtitle: string;
  description: string;
  environment: EnvironmentType;
  mapWidth: number;
  mapHeight: number;
  playerSpawn: Position;
  exitPortal: Position;
  timeLimit: number; // in seconds for normal difficulty
  difficultyRating: number; // 1 to 5
  crystals: Array<{
    id: string;
    x: number;
    y: number;
    radius?: number;
    color?: string;
    glowColor?: string;
    value?: number;
  }>;
  obstacles: Obstacle[];
  hazards: Hazard[];
  targetCrystals: number;
  bgColor: string;
  accentColor: string;
}

export interface WorldInfo {
  id: WorldId;
  name: string;
  subtitle: string;
  description: string;
  environment: EnvironmentType;
  accentColor: string;
  bgColor: string;
  levelsRange: [number, number]; // e.g. [1, 10]
}

export interface SoundSettings {
  music: boolean;
  sfx: boolean;
  masterVolume: number; // 0 to 1
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface GameSaveData {
  version: number;
  highestUnlockedLevel: LevelId;
  completedLevels: LevelId[];
  unlockedWorlds: WorldId[];
  selectedDifficulty: DifficultyMode;
  levelScores: Record<number, number>;
  levelBestTimes: Record<number, number>; // in seconds
  totalScore: number;
  highScore: number;
  totalCrystalsCollectedAllTime: number;
  achievements: Record<string, boolean>;
  soundSettings: SoundSettings;
  accessibility: AccessibilitySettings;
}

export const SCORING = {
  CRYSTAL_POINTS: 100,
  LEVEL_COMPLETE_BONUS: 500,
  GAME_VICTORY_BONUS: 5000,
  TIME_BONUS_PER_SECOND: 10,
  HAZARD_PENALTY: 25,
  DIFFICULTY_MULTIPLIER: {
    easy: 1.0,
    normal: 1.25,
    hard: 1.6,
  },
} as const;

export const DEFAULT_SAVE_DATA: GameSaveData = {
  version: 2,
  highestUnlockedLevel: 1,
  completedLevels: [],
  unlockedWorlds: [1],
  selectedDifficulty: 'normal',
  levelScores: {},
  levelBestTimes: {},
  totalScore: 0,
  highScore: 0,
  totalCrystalsCollectedAllTime: 0,
  achievements: {},
  soundSettings: {
    music: true,
    sfx: true,
    masterVolume: 0.7,
  },
  accessibility: {
    reducedMotion: false,
  },
};
