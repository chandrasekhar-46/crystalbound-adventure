/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, Player, Crystal, Hazard, Obstacle, Particle, FloatingText, Direction } from '../types/game';
import { soundManager } from '../audio/soundManager';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export function createInitialPlayer(spawn: { x: number; y: number }, maxHealth = 3): Player {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: 14,
    speed: 200,
    health: maxHealth,
    maxHealth: maxHealth,
    facing: 'down',
    isMoving: false,
    walkCycle: 0,
    invulnerableTime: 0,
    flashTimer: 0,
    tookDamageThisLevel: false,
  };
}

export function updatePhysics(
  dt: number,
  player: Player,
  input: InputState,
  level: LevelConfig,
  crystals: Crystal[],
  hazards: Hazard[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  onCrystalCollected: (crystal: Crystal) => void,
  onPortalUnlocked: () => void,
  onLevelCompleted: () => void,
  onPlayerDamaged: (newHealth: number) => void,
  hazardSpeedMultiplier = 1.0,
  onGameOver?: () => void
): { player: Player; allCrystalsCollected: boolean } {
  // Cap delta time to prevent large steps when tab loses focus
  const clampedDt = Math.min(dt, 0.1);

  // 1. Process movement inputs
  let moveX = 0;
  let moveY = 0;

  if (input.up) moveY -= 1;
  if (input.down) moveY += 1;
  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;

  const isMoving = moveX !== 0 || moveY !== 0;

  // Determine facing direction
  let facing: Direction = player.facing;
  if (moveY < 0) facing = 'up';
  else if (moveY > 0) facing = 'down';
  else if (moveX < 0) facing = 'left';
  else if (moveX > 0) facing = 'right';

  // Normalize diagonal movement
  if (moveX !== 0 && moveY !== 0) {
    const invSqrt = 1 / Math.SQRT2;
    moveX *= invSqrt;
    moveY *= invSqrt;
  }

  // Update invulnerability timer
  let invulnerableTime = Math.max(0, player.invulnerableTime - clampedDt);
  let tookDamageThisLevel = player.tookDamageThisLevel || false;

  // Calculate new prospective position with axis-separated collision detection for smooth sliding
  let newX = player.x;
  let newY = player.y;
  const speed = player.speed;

  // Horizontal motion test
  const targetX = player.x + moveX * speed * clampedDt;
  if (!checkObstacleCollision(targetX, player.y, player.radius, level.obstacles, level.mapWidth, level.mapHeight)) {
    newX = targetX;
  }

  // Vertical motion test
  const targetY = player.y + moveY * speed * clampedDt;
  if (!checkObstacleCollision(newX, targetY, player.radius, level.obstacles, level.mapWidth, level.mapHeight)) {
    newY = targetY;
  }

  // Dangerous obstacle collision check - immediately ends attempt
  const hitsDangerous =
    checkDangerousObstacleCollision(player.x, player.y, player.radius, level.obstacles) ||
    (moveX !== 0 && checkDangerousObstacleCollision(targetX, player.y, player.radius, level.obstacles)) ||
    (moveY !== 0 && checkDangerousObstacleCollision(player.x, targetY, player.radius, level.obstacles)) ||
    checkDangerousObstacleCollision(newX, newY, player.radius, level.obstacles);

  if (hitsDangerous) {
    soundManager.playHazardHit();
    if (onGameOver) {
      onGameOver();
      return { player, allCrystalsCollected: false };
    }
  }

  // Update walk cycle
  const walkCycle = isMoving ? player.walkCycle + clampedDt * 8 : 0;

  // 2. Crystal Collection Detection
  let collectedCount = 0;

  crystals.forEach(c => {
    if (c.collected) {
      collectedCount++;
      return;
    }

    const dist = Math.hypot(newX - c.x, newY - c.y);
    if (dist < player.radius + c.radius) {
      c.collected = true;
      collectedCount++;

      // Trigger collection callback
      onCrystalCollected(c);
      soundManager.playCrystalCollect(collectedCount);

      // Spawn sparkling particles
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 90;
        particles.push({
          x: c.x,
          y: c.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: c.color,
          alpha: 1,
          maxLife: 0.6 + Math.random() * 0.4,
          life: 0.6 + Math.random() * 0.4,
        });
      }

      // Spawn floating score text
      floatingTexts.push({
        id: `ft_${Date.now()}_${Math.random()}`,
        text: `+${c.value}`,
        x: c.x,
        y: c.y - 12,
        color: '#fbbf24',
        alpha: 1,
        life: 0.9,
      });
    }
  });

  const allCrystalsCollected = collectedCount >= level.targetCrystals;

  // 3. Hazards Movement & Collision - immediately triggers game over
  for (const h of hazards) {
    if (h.startX !== undefined && h.endX !== undefined && h.startY !== undefined && h.endY !== undefined && h.speed) {
      const effectiveSpeed = h.speed * hazardSpeedMultiplier;
      const totalDist = Math.hypot(h.endX - h.startX, h.endY - h.startY);
      if (totalDist > 0) {
        h.progress = (h.progress || 0) + (h.direction || 1) * ((effectiveSpeed * clampedDt) / totalDist);
        if (h.progress >= 1) {
          h.progress = 1;
          h.direction = -1;
        } else if (h.progress <= 0) {
          h.progress = 0;
          h.direction = 1;
        }

        h.x = h.startX + (h.endX - h.startX) * h.progress;
        h.y = h.startY + (h.endY - h.startY) * h.progress;
      }
    }

    // Collision with hazard triggers Game Over immediately
    const hazardDist = Math.hypot(newX - h.x, newY - h.y);
    if (hazardDist < player.radius + h.radius) {
      soundManager.playHazardHit();
      tookDamageThisLevel = true;
      if (onGameOver) {
        onGameOver();
        return { player, allCrystalsCollected: false };
      }
    }
  }

  // 4. Exit Portal Collision Check
  const portal = level.exitPortal;
  const portalDist = Math.hypot(newX - portal.x, newY - portal.y);
  const portalRadius = (level.id === 100 || level.environment === 'crystal_heart') ? 36 : 28;

  if (portalDist < player.radius + portalRadius) {
    if (allCrystalsCollected) {
      onLevelCompleted();
    }
  }

  // 5. Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * clampedDt;
    p.y += p.vy * clampedDt;
    p.life -= clampedDt;
    p.alpha = p.life / p.maxLife;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // 6. Update Floating Texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 35 * clampedDt;
    ft.life -= clampedDt;
    ft.alpha = ft.life / 0.9;
    if (ft.life <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  const updatedPlayer: Player = {
    ...player,
    x: newX,
    y: newY,
    facing,
    isMoving,
    walkCycle,
    invulnerableTime,
    tookDamageThisLevel,
  };

  return { player: updatedPlayer, allCrystalsCollected };
}

// Circle vs Axis-Aligned Bounding Box (AABB) collision detection
function checkObstacleCollision(
  cx: number,
  cy: number,
  radius: number,
  obstacles: Obstacle[],
  mapWidth: number,
  mapHeight: number
): boolean {
  // Check boundaries
  if (cx - radius < 0 || cx + radius > mapWidth) return true;
  if (cy - radius < 0 || cy + radius > mapHeight) return true;

  for (const obs of obstacles) {
    // Find closest point to circle inside the rectangle
    const closestX = Math.max(obs.x, Math.min(cx, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(cy, obs.y + obs.height));

    const distX = cx - closestX;
    const distY = cy - closestY;

    if (distX * distX + distY * distY < radius * radius) {
      return true; // Collision detected
    }
  }

  return false;
}

// Circle vs Axis-Aligned Bounding Box (AABB) collision for dangerous obstacles
export function checkDangerousObstacleCollision(
  cx: number,
  cy: number,
  radius: number,
  obstacles: Obstacle[]
): boolean {
  for (const obs of obstacles) {
    if (!obs.isDangerous) continue;

    const closestX = Math.max(obs.x, Math.min(cx, obs.x + obs.width));
    const closestY = Math.max(obs.y, Math.min(cy, obs.y + obs.height));

    const distX = cx - closestX;
    const distY = cy - closestY;

    if (distX * distX + distY * distY < radius * radius) {
      return true; // Collision with dangerous obstacle detected
    }
  }

  return false;
}
