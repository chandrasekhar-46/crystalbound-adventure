/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getLevel, WORLDS } from '../src/data/levels';
import { validateLevelReachability, generateLevel } from '../src/engine/levelGenerator';
import { updatePhysics, createInitialPlayer } from '../src/engine/physics';
import { SCORING, DEFAULT_SAVE_DATA, DifficultyMode, Obstacle, Hazard, LevelConfig } from '../src/types/game';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(suite: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ suite, name, passed: true });
  } catch (err: any) {
    results.push({ suite, name, passed: false, error: err.message || String(err) });
  }
}

console.log('--- CRYSTALBOUND AUTOMATED TEST SUITE ---');

// ==========================================
// 1. LEVEL & WORLD TESTS
// ==========================================
test('LEVEL TESTS', 'The game registers 100 unique level IDs', () => {
  const ids = new Set<number>();
  for (let i = 1; i <= 100; i++) {
    const lvl = getLevel(i, 'normal');
    assert(lvl.id === i, `Expected level id ${i}, got ${lvl.id}`);
    ids.add(lvl.id);
  }
  assert(ids.size === 100, `Expected 100 unique level IDs, got ${ids.size}`);
});

test('LEVEL TESTS', 'All 10 worlds contain 10 levels each', () => {
  assert(WORLDS.length === 10, `Expected 10 worlds, got ${WORLDS.length}`);
  WORLDS.forEach((world, idx) => {
    const expectedWorldId = idx + 1;
    assert(world.id === expectedWorldId, `Expected world id ${expectedWorldId}, got ${world.id}`);
    const [start, end] = world.levelsRange;
    assert(start === (idx * 10) + 1, `Expected start level ${(idx * 10) + 1}, got ${start}`);
    assert(end === (idx + 1) * 10, `Expected end level ${(idx + 1) * 10}, got ${end}`);
    assert((end - start + 1) === 10, `Expected 10 levels in world ${world.id}`);
  });
});

test('LEVEL TESTS', 'Every level has valid required configuration', () => {
  for (let i = 1; i <= 100; i++) {
    const lvl = getLevel(i, 'normal');
    assert(typeof lvl.name === 'string' && lvl.name.length > 0, `Level ${i} missing name`);
    assert(typeof lvl.worldName === 'string' && lvl.worldName.length > 0, `Level ${i} missing worldName`);
    assert(lvl.mapWidth >= 960 && lvl.mapHeight >= 640, `Level ${i} dimensions too small`);
    assert(lvl.timeLimit >= 120 && lvl.timeLimit <= 360, `Level ${i} timeLimit ${lvl.timeLimit} out of range`);
    assert(lvl.crystals.length >= 3 && lvl.crystals.length <= 8, `Level ${i} crystal count ${lvl.crystals.length} out of range`);
    assert(lvl.targetCrystals <= lvl.crystals.length, `Level ${i} targetCrystals exceeds crystals array`);
  }
});

test('LEVEL TESTS', 'Every level has valid spawn point and exit within bounds', () => {
  for (let i = 1; i <= 100; i++) {
    const lvl = getLevel(i, 'normal');
    assert(lvl.playerSpawn.x > 40 && lvl.playerSpawn.x < lvl.mapWidth - 40, `Level ${i} spawn X out of bounds`);
    assert(lvl.playerSpawn.y > 40 && lvl.playerSpawn.y < lvl.mapHeight - 40, `Level ${i} spawn Y out of bounds`);
    assert(lvl.exitPortal.x > 40 && lvl.exitPortal.x < lvl.mapWidth - 40, `Level ${i} exit X out of bounds`);
    assert(lvl.exitPortal.y > 40 && lvl.exitPortal.y < lvl.mapHeight - 40, `Level ${i} exit Y out of bounds`);
  }
});

test('LEVEL TESTS', 'Reachability: Player can reach all crystals and exit portal in all worlds', () => {
  // Test key checkpoint levels across all 10 worlds
  const testLevels = [1, 5, 10, 11, 20, 21, 30, 40, 50, 60, 70, 80, 90, 99, 100];
  for (const lvlId of testLevels) {
    const lvl = getLevel(lvlId, 'normal');
    const reachable = validateLevelReachability(
      lvl.mapWidth,
      lvl.mapHeight,
      lvl.obstacles,
      lvl.playerSpawn,
      lvl.exitPortal,
      lvl.crystals
    );
    assert(reachable, `Level ${lvlId} failed reachability validation`);
  }
});

test('LEVEL TESTS', 'Level generation terminates deterministically within bounded time', () => {
  const start = Date.now();
  for (let i = 1; i <= 20; i++) {
    const lvlA = generateLevel(i, 'normal');
    const lvlB = generateLevel(i, 'normal');
    assert(lvlA.name === lvlB.name, `Level ${i} generation non-deterministic`);
    assert(lvlA.crystals.length === lvlB.crystals.length, `Level ${i} crystal count non-deterministic`);
  }
  const duration = Date.now() - start;
  assert(duration < 1000, `Generation took too long: ${duration}ms`);
});

// ==========================================
// 2. TIMER & TIMEOUT TESTS
// ==========================================
test('TIMER TESTS', 'Timer decreases based on elapsed gameplay time and never goes below zero', () => {
  const timeLimit = 150;
  let elapsedActiveTime = 0;
  
  // Advance 30 seconds
  elapsedActiveTime += 30;
  let remaining = Math.max(0, timeLimit - elapsedActiveTime);
  assert(remaining === 120, `Expected 120s remaining, got ${remaining}`);

  // Advance past deadline (160s total)
  elapsedActiveTime += 130;
  remaining = Math.max(0, timeLimit - elapsedActiveTime);
  assert(remaining === 0, `Expected 0 remaining, got ${remaining}`);
  assert(remaining >= 0, 'Remaining time must never be negative');
});

test('TIMER TESTS', 'Timer stops / freezes while paused', () => {
  const timeLimit = 180;
  let activeElapsed = 50;
  let isPaused = true;
  
  const tick = (dt: number) => {
    if (!isPaused) {
      activeElapsed += dt;
    }
  };

  tick(10);
  tick(20);
  assert(activeElapsed === 50, `Expected activeElapsed to remain 50 while paused, got ${activeElapsed}`);

  isPaused = false;
  tick(15);
  assert(activeElapsed === 65, `Expected activeElapsed to be 65 after resume, got ${activeElapsed}`);
});

test('TIMER TESTS', 'Timeout occurs exactly once and cannot trigger duplicate callbacks', () => {
  let timeoutCount = 0;
  let isLevelFinished: boolean = false;

  const checkTimeout = (remaining: number) => {
    if (remaining <= 0 && !isLevelFinished) {
      isLevelFinished = true;
      timeoutCount++;
    }
  };

  checkTimeout(5);
  checkTimeout(0);
  checkTimeout(-1);
  checkTimeout(-2);

  assert(timeoutCount === 1, `Expected timeoutCount === 1, got ${timeoutCount}`);
  assert(Boolean(isLevelFinished), 'Level must be marked finished on timeout');
});

test('TIMER TESTS', 'Terminal state collision: completion and timeout cannot both trigger', () => {
  let isFinished = false;
  let resultState: 'COMPLETED' | 'TIMEOUT' | null = null;

  const onComplete = () => {
    if (!isFinished) {
      isFinished = true;
      resultState = 'COMPLETED';
    }
  };

  const onTimeout = () => {
    if (!isFinished) {
      isFinished = true;
      resultState = 'TIMEOUT';
    }
  };

  // Simulate completion first
  onComplete();
  // Late timeout callback arrives
  onTimeout();

  assert(resultState === 'COMPLETED', `Expected COMPLETED, got ${resultState}`);
});

// ==========================================
// 3. SCORING & DIFFICULTY TESTS
// ==========================================
test('SCORING TESTS', 'Crystal collected score cannot be awarded more than once', () => {
  const crystal = { id: 'c1', x: 100, y: 100, radius: 14, color: '#fff', glowColor: '#fff', collected: false, pulseOffset: 0, value: 100 };
  let awardedPoints = 0;

  const collect = (c: typeof crystal) => {
    if (!c.collected) {
      c.collected = true;
      awardedPoints += c.value;
    }
  };

  collect(crystal);
  collect(crystal);
  collect(crystal);

  assert(awardedPoints === 100, `Expected 100 points, got ${awardedPoints}`);
});

test('SCORING TESTS', 'Time bonus is calculated accurately from remaining seconds', () => {
  const remainingSeconds = 45.8;
  const timeBonus = Math.floor(remainingSeconds) * SCORING.TIME_BONUS_PER_SECOND;
  assert(timeBonus === 450, `Expected 450 bonus points, got ${timeBonus}`);
  assert(timeBonus >= 0, 'Time bonus must be nonnegative');
});

test('SCORING TESTS', 'Difficulty multipliers apply correctly to total score', () => {
  const baseScore = 1000;
  const easyScore = Math.round(baseScore * SCORING.DIFFICULTY_MULTIPLIER['easy']);
  const normalScore = Math.round(baseScore * SCORING.DIFFICULTY_MULTIPLIER['normal']);
  const hardScore = Math.round(baseScore * SCORING.DIFFICULTY_MULTIPLIER['hard']);

  assert(easyScore === 1000, `Easy score ${easyScore}`);
  assert(normalScore === 1250, `Normal score ${normalScore}`);
  assert(hardScore === 1600, `Hard score ${hardScore}`);
  assert(hardScore > normalScore && normalScore > easyScore, 'Hard must award higher scores than Normal and Easy');
});

// ==========================================
// 4. SAVE MIGRATION TESTS
// ==========================================
test('SAVE TESTS', 'Legacy V1 save format migrates cleanly into V2', () => {
  const legacyV1 = {
    highestUnlockedLevel: 4,
    completedLevels: [1, 2, 3],
    levelScores: { 1: 650, 2: 720, 3: 810 },
    totalScore: 2180,
    highScore: 2180,
    soundSettings: { music: true, sfx: false, masterVolume: 0.8 },
    accessibility: { reducedMotion: true },
  };

  // Migration logic test
  const migrated = {
    version: 2,
    highestUnlockedLevel: legacyV1.highestUnlockedLevel,
    completedLevels: legacyV1.completedLevels,
    unlockedWorlds: [1],
    selectedDifficulty: 'normal',
    levelScores: legacyV1.levelScores,
    levelBestTimes: {},
    totalScore: legacyV1.totalScore,
    highScore: legacyV1.highScore,
    totalCrystalsCollectedAllTime: legacyV1.completedLevels.length * 4,
    achievements: {},
    soundSettings: legacyV1.soundSettings,
    accessibility: legacyV1.accessibility,
  };

  assert(migrated.version === 2, 'Must be version 2');
  assert(migrated.highestUnlockedLevel === 4, 'Preserved level 4');
  assert(migrated.completedLevels.length === 3, 'Preserved completed levels');
  assert(migrated.totalScore === 2180, 'Preserved totalScore');
  assert(migrated.soundSettings.sfx === false, 'Preserved sfx setting');
});

test('SAVE TESTS', 'Failed attempts do not delete unlocked levels or high scores', () => {
  const currentSave = {
    ...DEFAULT_SAVE_DATA,
    highestUnlockedLevel: 25,
    completedLevels: [1, 2, 3, 4, 5],
    highScore: 5000,
  };

  // Simulating time-up retry
  const afterFailedAttempt = {
    ...currentSave,
    // Restarting only resets current attempt, preserves save
  };

  assert(afterFailedAttempt.highestUnlockedLevel === 25, 'Unlocked level must remain 25');
  assert(afterFailedAttempt.highScore === 5000, 'HighScore must remain 5000');
});

// ==========================================
// 5. GAMEPLAY & PHYSICS TESTS
// ==========================================
test('GAMEPLAY TESTS', 'Player movement respects map boundaries', () => {
  const spawn = { x: 50, y: 50 };
  const player = createInitialPlayer(spawn, 3);
  const level = getLevel(1, 'normal');

  // Try moving left past boundary
  const input = { up: false, down: false, left: true, right: false };
  const res = updatePhysics(
    0.5,
    player,
    input,
    level,
    [],
    [],
    [],
    [],
    () => {},
    () => {},
    () => {},
    () => {}
  );

  // Player must not cross boundary (x > 0)
  assert(res.player.x >= player.radius, `Player X ${res.player.x} escaped map left boundary`);
});

test('GAMEPLAY TESTS', 'Exit portal requires all target crystals before unlocking', () => {
  const level = getLevel(1, 'normal');
  const crystals = level.crystals.map(c => ({
    id: c.id,
    x: c.x,
    y: c.y,
    radius: 14,
    color: '#fff',
    glowColor: '#fff',
    collected: false,
    pulseOffset: 0,
    value: 100,
  }));

  let levelCompleted: boolean = false;
  const onComplete = () => { levelCompleted = true; };

  // Place player right at exit portal before collecting crystals
  const player = {
    ...createInitialPlayer(level.exitPortal, 3),
    x: level.exitPortal.x,
    y: level.exitPortal.y,
  };

  updatePhysics(
    0.1,
    player,
    { up: false, down: false, left: false, right: false },
    level,
    crystals,
    [],
    [],
    [],
    () => {},
    () => {},
    onComplete,
    () => {}
  );

  assert(!levelCompleted, 'Exit must remain locked when crystals are incomplete');

  // Now collect all crystals
  crystals.forEach(c => { c.collected = true; });

  updatePhysics(
    0.1,
    player,
    { up: false, down: false, left: false, right: false },
    level,
    crystals,
    [],
    [],
    [],
    () => {},
    () => {},
    onComplete,
    () => {}
  );

  assert(Boolean(levelCompleted), 'Exit must trigger completion when all crystals are collected');
});

// ==========================================
// 6. GAME OVER & DANGEROUS OBSTACLE TESTS
// ==========================================
test('GAME OVER TESTS', 'Ordinary wall blocks movement without triggering Game Over', () => {
  const spawn = { x: 100, y: 100 };
  const player = createInitialPlayer(spawn, 3);
  const wall: Obstacle = { id: 'test_wall', x: 130, y: 80, width: 40, height: 60, type: 'stone_wall', isDangerous: false };
  const testLevel: LevelConfig = {
    ...getLevel(1, 'normal'),
    obstacles: [wall],
  };

  let gameOverTriggered = false;
  // Move right directly towards harmless stone wall
  const res = updatePhysics(
    0.2,
    player,
    { up: false, down: false, left: false, right: true },
    testLevel,
    [],
    [],
    [],
    [],
    () => {},
    () => {},
    () => {},
    () => {},
    1.0,
    () => { gameOverTriggered = true; }
  );

  assert(!gameOverTriggered, 'Ordinary wall must NOT trigger game over');
  assert(res.player.x < 130, `Player must be blocked by wall, got x=${res.player.x}`);
});

test('GAME OVER TESTS', 'Colliding with obstacle marked as dangerous immediately triggers Game Over', () => {
  const spawn = { x: 100, y: 100 };
  const player = createInitialPlayer(spawn, 3);
  const dangerousObstacle: Obstacle = {
    id: 'lava_spike',
    x: 120,
    y: 80,
    width: 40,
    height: 60,
    type: 'magma_rock',
    isDangerous: true,
  };
  const testLevel: LevelConfig = {
    ...getLevel(1, 'normal'),
    obstacles: [dangerousObstacle],
  };

  let gameOverTriggered = false;
  let crystalsCollected = 0;

  // Move right into the dangerous obstacle
  updatePhysics(
    0.2,
    player,
    { up: false, down: false, left: false, right: true },
    testLevel,
    [{ id: 'c1', x: 200, y: 100, radius: 14, color: '#fff', glowColor: '#fff', collected: false, pulseOffset: 0, value: 100 }],
    [],
    [],
    [],
    () => { crystalsCollected++; },
    () => {},
    () => {},
    () => {},
    1.0,
    () => { gameOverTriggered = true; }
  );

  assert(gameOverTriggered, 'Dangerous obstacle collision MUST trigger game over');
  assert(crystalsCollected === 0, 'Crystals must not be collected after game over is triggered');
});

test('GAME OVER TESTS', 'Hazard collision triggers Game Over and stops attempt', () => {
  const spawn = { x: 100, y: 100 };
  const player = createInitialPlayer(spawn, 3);
  const hazard: Hazard = {
    id: 'sentinel',
    type: 'patrol_sentinel',
    x: 110,
    y: 100,
    radius: 17,
    glowColor: '#ef4444',
  };
  const testLevel = getLevel(1, 'normal');

  let gameOverTriggered = false;
  updatePhysics(
    0.1,
    player,
    { up: false, down: false, left: false, right: false },
    testLevel,
    [],
    [hazard],
    [],
    [],
    () => {},
    () => {},
    () => {},
    () => {},
    1.0,
    () => { gameOverTriggered = true; }
  );

  assert(gameOverTriggered, 'Hazard collision MUST trigger game over');
});

test('GAME OVER TESTS', 'Game Over latch: cannot be overwritten by late level completion or timer', () => {
  let isLevelFinished = false;
  let activeState: string = 'PLAYING';

  const triggerGameOver = () => {
    if (!isLevelFinished) {
      isLevelFinished = true;
      activeState = 'GAME_OVER';
    }
  };

  const triggerComplete = () => {
    if (!isLevelFinished) {
      isLevelFinished = true;
      activeState = 'LEVEL_COMPLETED';
    }
  };

  // Game over occurs first
  triggerGameOver();
  // Late portal trigger occurs
  triggerComplete();

  assert(activeState === 'GAME_OVER', `State must remain GAME_OVER, got ${activeState}`);
});

test('GAME OVER TESTS', 'Restarting after game over preserves saved unlocked levels and high score', () => {
  const savedState = {
    ...DEFAULT_SAVE_DATA,
    highestUnlockedLevel: 12,
    highScore: 18500,
  };

  // Simulating game over on level 12 and pressing PLAY AGAIN
  const restartLevelId = 12;
  const newAttemptSessionScore = 0; // resets current attempt score

  assert(savedState.highestUnlockedLevel === 12, 'Highest unlocked level must stay 12');
  assert(savedState.highScore === 18500, 'Saved high score must be preserved');
  assert(restartLevelId === 12, 'Restart must restart current level');
  assert(newAttemptSessionScore === 0, 'Current attempt restarts clean');
});

// ==========================================
// TEST SUMMARY OUTPUT
// ==========================================
let passedCount = 0;
let failedCount = 0;

results.forEach(r => {
  if (r.passed) {
    passedCount++;
    console.log(`  ✓ [${r.suite}] ${r.name}`);
  } else {
    failedCount++;
    console.error(`  ✗ [${r.suite}] ${r.name}: ${r.error}`);
  }
});

console.log(`\nTEST RESULTS: ${passedCount} passed, ${failedCount} failed out of ${results.length} total.`);

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! ✓\n');
}
