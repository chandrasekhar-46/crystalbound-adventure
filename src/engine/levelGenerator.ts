/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, WorldInfo, WorldId, EnvironmentType, Obstacle, Hazard, Crystal, DifficultyMode } from '../types/game';

// 10 Worlds Configuration
export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Whispering Woods',
    subtitle: 'Enchanted Forest & Mossy Paths',
    description: 'Begin your quest among sun-dappled groves, ancient roots, and glowing emerald flora.',
    environment: 'forest',
    accentColor: '#10b981',
    bgColor: '#0f1a14',
    levelsRange: [1, 10],
  },
  {
    id: 2,
    name: 'The Ancient Ruins',
    subtitle: 'Labyrinth of the First Builders',
    description: 'Explore crumbling stone temples, carved runic columns, and vigilant arcane sentinels.',
    environment: 'ruins',
    accentColor: '#f59e0b',
    bgColor: '#161410',
    levelsRange: [11, 20],
  },
  {
    id: 3,
    name: 'Crystal Caverns',
    subtitle: 'The Luminous Subterrane',
    description: 'Descend into basalt chasms illuminated by glowing amethyst geodes and pulsing crystals.',
    environment: 'caves',
    accentColor: '#c084fc',
    bgColor: '#120d1c',
    levelsRange: [21, 30],
  },
  {
    id: 4,
    name: 'The Skybound Isles',
    subtitle: 'Bridges in the Clouds',
    description: 'Cross suspended stone paths high above the misty ether, braving aerial drafts and guardian orbs.',
    environment: 'sky_isles',
    accentColor: '#38bdf8',
    bgColor: '#0f172a',
    levelsRange: [31, 40],
  },
  {
    id: 5,
    name: 'Emberland',
    subtitle: 'The Molten Crags',
    description: 'Tread heated basalt stones between magma channels, dodging bursts of fiery volcanic energy.',
    environment: 'volcanic',
    accentColor: '#f97316',
    bgColor: '#180b08',
    levelsRange: [41, 50],
  },
  {
    id: 6,
    name: 'Frostfall Kingdom',
    subtitle: 'Glacial Citadel of Shards',
    description: 'Traverse shimmering permafrost and crystalline glaciers guarded by chilling frost vortexes.',
    environment: 'frozen',
    accentColor: '#67e8f9',
    bgColor: '#08141e',
    levelsRange: [51, 60],
  },
  {
    id: 7,
    name: 'Shadowforge',
    subtitle: 'The Abyssal Bastion',
    description: 'Enter subterranean obsidian halls veiled in mystic darkness with roving shadow wards.',
    environment: 'shadow',
    accentColor: '#a855f7',
    bgColor: '#0e0b16',
    levelsRange: [61, 70],
  },
  {
    id: 8,
    name: 'The Forgotten Kingdom',
    subtitle: 'Overgrown Grand Citadel',
    description: 'Venture through monumental throne halls where ancient nature and forgotten masonry entwine.',
    environment: 'ancient_citadel',
    accentColor: '#eab308',
    bgColor: '#15140e',
    levelsRange: [71, 80],
  },
  {
    id: 9,
    name: 'Celestial Frontier',
    subtitle: 'Astral Spires of Aetherfall',
    description: 'Walk upon starlit platforms among cosmic nebulae and radiant astral energy conduits.',
    environment: 'celestial',
    accentColor: '#60a5fa',
    bgColor: '#0b1022',
    levelsRange: [81, 90],
  },
  {
    id: 10,
    name: 'The Eternal Crystal',
    subtitle: 'Sanctum of the Crystal Heart',
    description: 'Conquer the final master trials and assemble the sacred relics to restore the legendary Crystal Heart!',
    environment: 'eternal_sanctum',
    accentColor: '#fbbf24',
    bgColor: '#140c26',
    levelsRange: [91, 100],
  },
];

// Linear Congruential Generator for deterministic level layout
class PRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = Math.abs(seed) % 2147483647;
    if (this.seed === 0) this.seed = 12345;
  }

  public next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  public choice<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
}

// Reachability validation on grid using Breadth-First Search (BFS)
export function validateLevelReachability(
  mapWidth: number,
  mapHeight: number,
  obstacles: Obstacle[],
  spawn: { x: number; y: number },
  exit: { x: number; y: number },
  crystals: Array<{ x: number; y: number }>
): boolean {
  const cellSize = 40;
  const cols = Math.floor(mapWidth / cellSize);
  const rows = Math.floor(mapHeight / cellSize);

  // Initialize grid: false = walkable, true = blocked
  const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  // Mark blocked cells by obstacles
  for (const obs of obstacles) {
    const minC = Math.max(0, Math.floor(obs.x / cellSize));
    const maxC = Math.min(cols - 1, Math.floor((obs.x + obs.width) / cellSize));
    const minR = Math.max(0, Math.floor(obs.y / cellSize));
    const maxR = Math.min(rows - 1, Math.floor((obs.y + obs.height) / cellSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        grid[r][c] = true;
      }
    }
  }

  const toCell = (pos: { x: number; y: number }) => ({
    c: Math.max(0, Math.min(cols - 1, Math.floor(pos.x / cellSize))),
    r: Math.max(0, Math.min(rows - 1, Math.floor(pos.y / cellSize))),
  });

  const startCell = toCell(spawn);
  const exitCell = toCell(exit);

  // If start is blocked, invalid
  if (grid[startCell.r][startCell.c]) return false;

  // BFS Reachability from startCell
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue: Array<{ r: number; c: number }> = [startCell];
  visited[startCell.r][startCell.c] = true;

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (queue.length > 0) {
    const curr = queue.shift()!;

    for (let i = 0; i < 4; i++) {
      const nr = curr.r + dr[i];
      const nc = curr.c + dc[i];

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!grid[nr][nc] && !visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push({ r: nr, c: nc });
        }
      }
    }
  }

  // Check exit is visited
  if (!visited[exitCell.r][exitCell.c]) return false;

  // Check all crystals are visited
  for (const c of crystals) {
    const cc = toCell(c);
    if (!visited[cc.r][cc.c]) return false;
  }

  return true;
}

// Generate level configuration
export function generateLevel(levelId: number, difficulty: DifficultyMode = 'normal'): LevelConfig {
  const boundedId = Math.max(1, Math.min(100, Math.floor(levelId)));
  const worldIndex = Math.min(9, Math.floor((boundedId - 1) / 10));
  const world = WORLDS[worldIndex];
  const levelInWorld = ((boundedId - 1) % 10) + 1; // 1 to 10

  const rng = new PRNG(boundedId * 7919 + 42);

  // Map dimensions
  const mapWidth = 960 + Math.min(worldIndex * 24, 240);
  const mapHeight = 640 + Math.min(worldIndex * 16, 160);

  // Number of crystals based on world & level (3 up to 8)
  const targetCrystals = Math.min(8, 3 + Math.floor(worldIndex / 2) + (levelInWorld >= 6 ? 1 : 0) + (levelInWorld === 10 ? 1 : 0));

  // Time limit guidelines from spec:
  // W1-2: 130-180s, W3-4: 140-210s, W5-6: 150-240s, W7-8: 160-270s, W9: 180-300s, W10: 190-360s
  const baseTimeByWorld = [140, 150, 160, 175, 190, 205, 220, 235, 250, 280][worldIndex];
  const timeLimit = baseTimeByWorld + levelInWorld * 6;

  // Spawn and Exit
  const playerSpawn = { x: 100, y: Math.floor(mapHeight / 2) };
  let exitPortal = { x: mapWidth - 100, y: Math.floor(mapHeight / 2) };

  // In Level 100: Grand Sanctum center exit!
  if (boundedId === 100) {
    exitPortal = { x: Math.floor(mapWidth / 2), y: Math.floor(mapHeight / 2) };
  }

  // Crystal Colors Palette per world
  const crystalColorPalette: Record<EnvironmentType, { main: string; glow: string }[]> = {
    forest: [
      { main: '#34d399', glow: 'rgba(52, 211, 153, 0.6)' },
      { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' },
    ],
    ruins: [
      { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
      { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' },
    ],
    caves: [
      { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' },
      { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
      { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.7)' },
    ],
    sky_isles: [
      { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
      { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)' },
      { main: '#34d399', glow: 'rgba(52, 211, 153, 0.7)' },
    ],
    volcanic: [
      { main: '#f97316', glow: 'rgba(249, 115, 22, 0.7)' },
      { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
      { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.7)' },
    ],
    frozen: [
      { main: '#67e8f9', glow: 'rgba(103, 232, 249, 0.7)' },
      { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
      { main: '#e0e7ff', glow: 'rgba(224, 231, 255, 0.7)' },
    ],
    shadow: [
      { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)' },
      { main: '#818cf8', glow: 'rgba(129, 140, 248, 0.7)' },
      { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' },
    ],
    ancient_citadel: [
      { main: '#eab308', glow: 'rgba(234, 179, 8, 0.7)' },
      { main: '#34d399', glow: 'rgba(52, 211, 153, 0.7)' },
      { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)' },
    ],
    celestial: [
      { main: '#60a5fa', glow: 'rgba(96, 165, 250, 0.8)' },
      { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)' },
      { main: '#fef08a', glow: 'rgba(254, 240, 138, 0.8)' },
    ],
    eternal_sanctum: [
      { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)' },
      { main: '#34d399', glow: 'rgba(52, 211, 153, 0.8)' },
      { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)' },
      { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.8)' },
    ],
    crystal_heart: [
      { main: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)' },
    ],
  };

  const palette = crystalColorPalette[world.environment] || crystalColorPalette.forest;

  // Generate bounded layout with verification
  let obstacles: Obstacle[] = [];
  let crystals: Array<{ id: string; x: number; y: number; color: string; glowColor: string; value: number }> = [];
  let hazards: Hazard[] = [];

  // Generate obstacles with corridor gaps
  const buildLevelGeometry = (attempt: number) => {
    obstacles = [];
    crystals = [];
    hazards = [];

    // 1. Boundary walls
    const borderType = world.environment === 'forest' ? 'ancient_tree'
      : world.environment === 'ruins' || world.environment === 'ancient_citadel' ? 'stone_wall'
      : world.environment === 'caves' ? 'crystal_pillar'
      : world.environment === 'sky_isles' ? 'abyss'
      : world.environment === 'volcanic' ? 'magma_rock'
      : world.environment === 'frozen' ? 'ice_block'
      : world.environment === 'shadow' ? 'shadow_obelisk'
      : 'celestial_pillar';

    obstacles.push({ id: `w_top`, x: 0, y: 0, width: mapWidth, height: 40, type: borderType });
    obstacles.push({ id: `w_bottom`, x: 0, y: mapHeight - 40, width: mapWidth, height: 40, type: borderType });
    obstacles.push({ id: `w_left`, x: 0, y: 40, width: 40, height: mapHeight - 80, type: borderType });
    obstacles.push({ id: `w_right`, x: mapWidth - 40, y: 40, width: 40, height: mapHeight - 80, type: borderType });

    // 2. Interior partitions with guaranteed passages
    const partitionCount = Math.min(5, 2 + Math.floor(worldIndex / 2.5));
    const sectionWidth = (mapWidth - 200) / (partitionCount + 1);

    for (let i = 1; i <= partitionCount; i++) {
      const px = 100 + i * sectionWidth + (rng.range(-15, 15) * (1 - attempt * 0.2));
      const gapY = rng.range(120, mapHeight - 200);
      const gapHeight = 110 + attempt * 20; // Ensure generous gap for smooth passage

      // Top segment
      if (gapY > 70) {
        obstacles.push({
          id: `part_${i}_top`,
          x: Math.floor(px),
          y: 40,
          width: 44,
          height: Math.floor(gapY - 40),
          type: borderType,
        });
      }

      // Bottom segment
      const bottomY = gapY + gapHeight;
      if (bottomY < mapHeight - 50) {
        obstacles.push({
          id: `part_${i}_bot`,
          x: Math.floor(px),
          y: Math.floor(bottomY),
          width: 44,
          height: Math.floor(mapHeight - 40 - bottomY),
          type: borderType,
        });
      }
    }

    // 3. Central feature / obstacles for higher worlds
    if (worldIndex >= 2 && boundedId !== 100) {
      const midX = Math.floor(mapWidth / 2);
      const midY = Math.floor(mapHeight / 2);
      obstacles.push({
        id: `pillar_mid_1`,
        x: midX - 30,
        y: midY - 70,
        width: 60,
        height: 40,
        type: 'rune_pillar',
      });
      obstacles.push({
        id: `pillar_mid_2`,
        x: midX - 30,
        y: midY + 30,
        width: 60,
        height: 40,
        type: 'rune_pillar',
      });
    }

    // 4. Place Crystals in open zones
    const zoneWidth = (mapWidth - 180) / targetCrystals;
    for (let cIdx = 0; cIdx < targetCrystals; cIdx++) {
      const cx = Math.floor(80 + (cIdx + 0.5) * zoneWidth + rng.range(-20, 20));
      const cy = Math.floor(rng.range(100, mapHeight - 100));
      const col = palette[cIdx % palette.length];

      crystals.push({
        id: `c_${boundedId}_${cIdx + 1}`,
        x: cx,
        y: cy,
        color: col.main,
        glowColor: col.glow,
        value: 100,
      });
    }

    // 5. Place Hazards (fair moving sentinels or pulsing runes)
    const hazardCount = Math.min(4, Math.floor(worldIndex / 2.2) + (levelInWorld >= 5 ? 1 : 0));
    for (let hIdx = 0; hIdx < hazardCount; hIdx++) {
      const hx = Math.floor(180 + ((hIdx + 1) * (mapWidth - 360)) / (hazardCount + 1));
      const startY = 100;
      const endY = mapHeight - 100;
      const speed = 90 + worldIndex * 8 + levelInWorld * 3;

      hazards.push({
        id: `h_${boundedId}_${hIdx + 1}`,
        type: world.environment === 'volcanic' ? 'magma_surge'
          : world.environment === 'frozen' ? 'frost_vortex'
          : world.environment === 'caves' ? 'pulsing_rune'
          : 'patrol_sentinel',
        x: hx,
        y: startY,
        radius: 17,
        startX: hx,
        startY: startY,
        endX: hx,
        endY: endY,
        speed: speed,
        progress: (hIdx * 0.35) % 1,
        direction: 1,
        glowColor: 'rgba(239, 68, 68, 0.75)',
      });
    }
  };

  // Run generation with up to 5 attempts, verifying reachability
  let valid = false;
  for (let attempt = 0; attempt < 5; attempt++) {
    buildLevelGeometry(attempt);
    valid = validateLevelReachability(mapWidth, mapHeight, obstacles, playerSpawn, exitPortal, crystals);
    if (valid) break;
  }

  // Fallback: If still invalid, remove interior partitions to guarantee 100% reachability
  if (!valid) {
    obstacles = obstacles.filter(obs => obs.id.startsWith('w_'));
  }

  // Level Names & Descriptions
  const worldThemes: Record<WorldId, string[]> = {
    1: ['Emerald Glade', 'Mossy Grove', 'Verdant Hollow', 'Whispering Path', 'Elder Treeline', 'Canopy Sanctum', 'Birch Pass', 'Silver Leaf', 'Fairy Basin', 'Heart of the Woods'],
    2: ['Sunken Portico', 'Pillar Hall', 'Forgotten Nave', 'Rune Passage', 'Echoing Chamber', 'Arched Vault', 'Shattered Shrine', 'Builder Walk', 'Obelisk Hall', 'The High Altar'],
    3: ['Shimmering Shaft', 'Amethyst Vein', 'Glowstone Deep', 'Lapis Cavern', 'Subterranean Run', 'Violet Crevasse', 'Geode Hollow', 'Obsidian Floor', 'Echoing Depths', 'Cavern Sovereign'],
    4: ['Zephyr Bridge', 'Cloud Spire', 'Floating Atoll', 'Aero Steps', 'Breezeway Isle', 'Stratus Platform', 'Vortex Ridge', 'Cirrus Path', 'High Haven', 'Skybound Crown'],
    5: ['Magma Run', 'Cinder Crags', 'Basalt Trail', 'Lava Verge', 'Ash Flume', 'Molten Ridge', 'Charred Gate', 'Obsidian Forge', 'Ignis Sanctum', 'Caldera Pinnacle'],
    6: ['Frostbite Pass', 'Glacier Shelf', 'Rime Grotto', 'Chill Basin', 'Permafrost Floor', 'Sleet Hollow', 'Blizzard Walk', 'Ice Floe Isle', 'Aurora Spire', 'Crown of Frostfall'],
    7: ['Twilight Corridor', 'Nightfall Labyrinth', 'Shadowed Nave', 'Void Steps', 'Gloom Bastion', 'Abyssal Chasm', 'Veiled Chamber', 'Umbral Hall', 'Dusk Monolith', 'Heart of Shadowforge'],
    8: ['Overgrown Gate', 'Imperial Courtyard', 'Ivy Colonnade', 'Ancient Vestibule', 'Grand Gallery', 'Sovereign Crossing', 'Ancestral Hall', 'Verdant Keep', 'Lost Parapet', 'The King’s Sanctum'],
    9: ['Astral Concourse', 'Starlight Terrace', 'Nebula Crossing', 'Cosmic Vault', 'Solar Archway', 'Pleiades Walk', 'Orbit Spire', 'Constellation Path', 'Ether Meridian', 'Celestial Zenith'],
    10: ['Sanctum Threshold', 'Trial of Light', 'Ward of Ten Worlds', 'Aether Meridian', 'Prismatic Vestibule', 'Resonance Hall', 'Ascendant Nave', 'Sacred Quadrangle', 'The Convergence', 'The Eternal Crystal Heart'],
  };

  const levelName = worldThemes[world.id]?.[levelInWorld - 1] || `Realm ${boundedId}`;
  const difficultyRating = Math.min(5, Math.max(1, Math.ceil(boundedId / 20)));

  return {
    id: boundedId,
    worldId: world.id,
    worldName: world.name,
    name: levelName,
    subtitle: `${world.name} • Level ${boundedId}`,
    description: `Recover ${targetCrystals} ancient crystals in ${levelName} to awaken the portal before time runs out.`,
    environment: boundedId === 100 ? 'crystal_heart' : world.environment,
    mapWidth,
    mapHeight,
    playerSpawn,
    exitPortal,
    timeLimit,
    difficultyRating,
    crystals,
    obstacles,
    hazards,
    targetCrystals,
    bgColor: world.bgColor,
    accentColor: world.accentColor,
  };
}
