/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, Player, Crystal, Obstacle, Hazard, Particle, FloatingText } from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    level: LevelConfig,
    player: Player,
    crystals: Crystal[],
    hazards: Hazard[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    allCrystalsCollected: boolean,
    camera: { x: number; y: number; zoom: number },
    time: number,
    reducedMotion: boolean
  ) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;

    ctx.save();
    // Clear screen
    ctx.fillStyle = level.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Camera Transform
    ctx.save();
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw Environment Floor
    this.drawFloor(level, time, reducedMotion);

    // 2. Draw Obstacles (walls, trees, ruins, chasms)
    this.drawObstacles(level.obstacles, level.environment, time);

    // 3. Draw Exit Portal / Crystal Heart Sanctum
    this.drawExitPortal(level, allCrystalsCollected, crystals, time, reducedMotion);

    // 4. Draw Collectible Crystals
    this.drawCrystals(crystals, time, reducedMotion);

    // 5. Draw Hazards
    this.drawHazards(hazards, time, reducedMotion);

    // 6. Draw Player ("The Crystal Seeker")
    this.drawPlayer(player, time);

    // 7. Draw Particles
    this.drawParticles(particles);

    // 8. Draw Floating Score Texts
    this.drawFloatingTexts(floatingTexts);

    ctx.restore(); // Restore camera transform

    // Vignette & Ambient Atmosphere overlay
    this.drawVignette(canvas.width, canvas.height, level.environment);

    ctx.restore();
  }

  private drawFloor(level: LevelConfig, time: number, reducedMotion: boolean) {
    const ctx = this.ctx;
    const { mapWidth, mapHeight, environment } = level;

    // Base background
    ctx.fillStyle = level.bgColor;
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    const tileSize = 60;
    const cols = Math.ceil(mapWidth / tileSize);
    const rows = Math.ceil(mapHeight / tileSize);

    ctx.save();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tileSize;
        const y = r * tileSize;
        const hash = (c * 73856093) ^ (r * 19349663);
        const alt = Math.abs(hash % 5);

        if (environment === 'forest') {
          // Lush forest ground with varied grass patches
          ctx.fillStyle = alt === 0 ? '#112218' : alt === 1 ? '#0e1c14' : '#14271c';
          ctx.fillRect(x, y, tileSize, tileSize);

          // Subtle grass blades
          if (alt === 2) {
            ctx.fillStyle = '#1b3b28';
            ctx.fillRect(x + 15, y + 20, 2, 6);
            ctx.fillRect(x + 18, y + 18, 2, 8);
          } else if (alt === 3) {
            // Little golden spore/flower
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(x + 30, y + 30, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (environment === 'ruins') {
          // Flagstone stone tiles
          ctx.fillStyle = alt === 0 ? '#1f1b16' : alt === 1 ? '#181512' : '#241f1a';
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          // Mortar borders
          ctx.strokeStyle = '#0d0b09';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          // Ancient rune carving
          if (alt === 4) {
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
            ctx.beginPath();
            ctx.arc(x + 30, y + 30, 8, 0, Math.PI * 2);
            ctx.moveTo(x + 22, y + 30);
            ctx.lineTo(x + 38, y + 30);
            ctx.stroke();
          }
        } else if (environment === 'caves') {
          // Basalt subterranean floor with glowing amethyst specks
          ctx.fillStyle = alt === 0 ? '#140e21' : alt === 1 ? '#0e0a17' : '#191129';
          ctx.fillRect(x, y, tileSize, tileSize);

          if (alt === 3) {
            ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
            ctx.beginPath();
            ctx.arc(x + 24, y + 24, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (environment === 'sky_isles') {
          // Suspended celestial stones
          ctx.fillStyle = alt === 0 ? '#1e293b' : '#0f172a';
          ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        } else if (environment === 'volcanic') {
          // Molten basalt floor with glowing magma veins
          ctx.fillStyle = alt === 0 ? '#180a08' : alt === 1 ? '#120705' : '#1f0d0a';
          ctx.fillRect(x, y, tileSize, tileSize);

          if (alt === 3) {
            ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
            ctx.beginPath();
            ctx.arc(x + 28, y + 28, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (environment === 'frozen') {
          // Glacial ice floor with frost glints
          ctx.fillStyle = alt === 0 ? '#0b1926' : alt === 1 ? '#08131d' : '#0e2030';
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          ctx.strokeStyle = 'rgba(103, 232, 249, 0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          if (alt === 4) {
            ctx.fillStyle = 'rgba(224, 231, 255, 0.4)';
            ctx.fillRect(x + 20, y + 20, 3, 3);
          }
        } else if (environment === 'shadow') {
          // Abyssal dark slate with umbral energy
          ctx.fillStyle = alt === 0 ? '#100c1c' : alt === 1 ? '#0a0812' : '#161026';
          ctx.fillRect(x, y, tileSize, tileSize);

          if (alt === 2) {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
            ctx.beginPath();
            ctx.arc(x + 30, y + 30, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (environment === 'ancient_citadel') {
          // Golden ancient citadel flagstones
          ctx.fillStyle = alt === 0 ? '#1c1b12' : alt === 1 ? '#14130d' : '#242217';
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

          ctx.strokeStyle = 'rgba(234, 179, 8, 0.18)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        } else if (environment === 'celestial') {
          // Astral star floor with cosmic conduits
          ctx.fillStyle = alt === 0 ? '#0b1026' : alt === 1 ? '#070a1a' : '#0f1738';
          ctx.fillRect(x, y, tileSize, tileSize);

          if (alt === 3) {
            ctx.fillStyle = 'rgba(96, 165, 250, 0.35)';
            ctx.beginPath();
            ctx.arc(x + 25, y + 25, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (environment === 'eternal_sanctum' || environment === 'crystal_heart') {
          // Grand sanctum marble and gold sanctuary floor
          ctx.fillStyle = alt === 0 ? '#1b1033' : '#150c29';
          ctx.fillRect(x, y, tileSize, tileSize);

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.14)';
          ctx.strokeRect(x, y, tileSize, tileSize);
        }
      }
    }

    // Grand Sanctum central floor mandala in final sanctum
    if (environment === 'crystal_heart' || environment === 'eternal_sanctum') {
      const cx = level.exitPortal.x;
      const cy = level.exitPortal.y;
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();

      const pulse = reducedMotion ? 0 : Math.sin(time * 2) * 4;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.beginPath();
      ctx.arc(cx, cy, 50 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawObstacles(obstacles: Obstacle[], env: LevelConfig['environment'], time: number) {
    const ctx = this.ctx;

    obstacles.forEach(obs => {
      ctx.save();
      const { x, y, width, height, type } = obs;

      // Drop shadow for depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x + 4, y + 4, width, height);

      if (type === 'ancient_tree') {
        // Enchanted Oak/Foliage Canopy
        ctx.fillStyle = '#0f291e';
        ctx.fillRect(x, y, width, height);

        // Canopy textures
        ctx.fillStyle = '#164e33';
        ctx.fillRect(x + 4, y + 4, width - 8, height - 8);

        ctx.fillStyle = '#1e724b';
        ctx.fillRect(x + 8, y + 8, Math.max(0, width - 20), Math.max(0, height - 20));

        // Edge highlights
        ctx.strokeStyle = '#279663';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
      } else if (type === 'stone_wall') {
        // Stone blocks
        ctx.fillStyle = '#292524';
        ctx.fillRect(x, y, width, height);

        // Stone bevel highlight
        ctx.fillStyle = '#44403c';
        ctx.fillRect(x + 2, y + 2, width - 4, 4);
        ctx.fillRect(x + 2, y + 2, 4, height - 4);

        // Stone bevel shadow
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x + 2, y + height - 6, width - 4, 4);
        ctx.fillRect(x + width - 6, y + 2, 4, height - 4);

        // Mortar brick lines
        ctx.strokeStyle = '#141210';
        ctx.lineWidth = 1.5;
        const brickH = 20;
        for (let by = y + brickH; by < y + height; by += brickH) {
          ctx.beginPath();
          ctx.moveTo(x, by);
          ctx.lineTo(x + width, by);
          ctx.stroke();
        }
      } else if (type === 'mossy_ruin') {
        // Weathered ruined stone
        ctx.fillStyle = '#262626';
        ctx.fillRect(x, y, width, height);

        // Moss overlay
        ctx.fillStyle = '#155e3b';
        ctx.fillRect(x, y, width, Math.min(10, height));
        ctx.fillRect(x, y, Math.min(10, width), height);

        // Vine tendril detail
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y);
        ctx.quadraticCurveTo(x + 15, y + 15, x + 8, y + Math.min(30, height));
        ctx.stroke();
      } else if (type === 'crystal_pillar') {
        // Luminescent gem spire
        const grad = ctx.createLinearGradient(x, y, x + width, y + height);
        grad.addColorStop(0, '#7e22ce');
        grad.addColorStop(0.5, '#c084fc');
        grad.addColorStop(1, '#581c87');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

        // Gem facets
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + 2);
        ctx.lineTo(x + width / 2, y + height - 2);
        ctx.stroke();
      } else if (type === 'rune_pillar') {
        // Sanctum Obelisk
        ctx.fillStyle = '#312e81';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Glowing gold rune inscription
        const runeGlow = 0.4 + 0.3 * Math.sin(time * 3 + x);
        ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow})`;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'abyss') {
        // Sky Void / Cloud Chasm
        ctx.fillStyle = '#030712';
        ctx.fillRect(x, y, width, height);

        // Edge mist
        const mistGrad = ctx.createLinearGradient(x, y, x + width, y);
        mistGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        mistGrad.addColorStop(0.5, 'rgba(15, 23, 42, 0.8)');
        mistGrad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(x, y, width, height);
      } else if (type === 'magma_rock') {
        // Volcanic Molten Stone
        ctx.fillStyle = '#26110e';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

        // Magma crack
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + height / 2);
        ctx.lineTo(x + width / 2, y + height / 2 + 4);
        ctx.lineTo(x + width - 6, y + height / 2 - 2);
        ctx.stroke();
      } else if (type === 'ice_block') {
        // Glacial Ice Monolith
        const iceGrad = ctx.createLinearGradient(x, y, x + width, y + height);
        iceGrad.addColorStop(0, '#cffafe');
        iceGrad.addColorStop(0.5, '#38bdf8');
        iceGrad.addColorStop(1, '#0284c7');

        ctx.fillStyle = iceGrad;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
      } else if (type === 'shadow_obelisk') {
        // Shadow Bastion Obelisk
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);

        // Shadow core
        ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'celestial_pillar') {
        // Starlight Pillar
        const cGrad = ctx.createLinearGradient(x, y, x + width, y);
        cGrad.addColorStop(0, '#1e293b');
        cGrad.addColorStop(0.5, '#3b82f6');
        cGrad.addColorStop(1, '#1e293b');

        ctx.fillStyle = cGrad;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
      } else {
        // Default hedge / wall
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(x, y, width, height);
      }

      ctx.restore();
    });
  }

  private drawExitPortal(
    level: LevelConfig,
    unlocked: boolean,
    crystals: Crystal[],
    time: number,
    reducedMotion: boolean
  ) {
    const ctx = this.ctx;
    const { x, y } = level.exitPortal;
    const isFinalSanctum = level.id === 100 || level.environment === 'crystal_heart';
    const radius = isFinalSanctum ? 42 : 32;

    ctx.save();

    // 1. Base pedestal / shrine
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y + 4, radius + 8, 0, Math.PI * 2);
    ctx.fill();

    // Stone base ring
    ctx.strokeStyle = unlocked ? '#fbbf24' : '#57534e';
    ctx.lineWidth = 4;
    ctx.fillStyle = unlocked ? '#1c1917' : '#292524';
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sockets showing crystal progress around the rim
    const total = crystals.length;
    const collectedCount = crystals.filter(c => c.collected).length;
    for (let i = 0; i < total; i++) {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const sx = x + Math.cos(angle) * (radius + 14);
      const sy = y + Math.sin(angle) * (radius + 14);

      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      if (i < collectedCount) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#44403c';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (isFinalSanctum) {
      // Grand Crystal Heart Rendering
      this.drawGrandCrystalHeart(x, y, unlocked, time, reducedMotion);
    } else {
      // Standard Level Exit Portal
      if (unlocked) {
        const rot = reducedMotion ? 0 : time * 1.5;
        // Radiant vortex glow
        const grad = ctx.createRadialGradient(x, y, 2, x, y, radius);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#10b981');
        grad.addColorStop(0.8, '#065f46');
        grad.addColorStop(1, 'rgba(6, 95, 70, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Swirling light rays
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.arc(0, 0, radius - 8, 0, Math.PI / 3);
          ctx.stroke();
        }
        ctx.restore();

        // Portal center star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Locked Portal
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
        ctx.fill();

        // Locked rune sigil
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 12, y);
        ctx.lineTo(x + 12, y);
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, y + 12);
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.font = 'bold 10px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText('LOCKED', x, y + 4);
      }
    }

    ctx.restore();
  }

  private drawGrandCrystalHeart(
    cx: number,
    cy: number,
    unlocked: boolean,
    time: number,
    reducedMotion: boolean
  ) {
    const ctx = this.ctx;
    ctx.save();

    const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.08;
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);

    if (unlocked) {
      // Radiant Resurrected Crystal Heart
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 24;

      // Heart Path
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.bezierCurveTo(-24, -4, -28, -26, 0, -32);
      ctx.bezierCurveTo(28, -26, 24, -4, 0, 14);
      ctx.closePath();

      const grad = ctx.createLinearGradient(-20, -30, 20, 20);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fef08a');
      grad.addColorStop(0.7, '#f59e0b');
      grad.addColorStop(1, '#d97706');

      ctx.fillStyle = grad;
      ctx.fill();

      // Crystal facet bevels
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, 14);
      ctx.moveTo(-16, -14);
      ctx.lineTo(16, -14);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('RESTORE', 0, 26);
    } else {
      // Shattered Crystal Heart
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.bezierCurveTo(-22, -4, -26, -24, 0, -28);
      ctx.bezierCurveTo(26, -24, 22, -4, 0, 12);
      ctx.closePath();

      ctx.fillStyle = '#3f3f46';
      ctx.fill();
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Faint fractured fissures
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.lineTo(4, -8);
      ctx.lineTo(-4, 2);
      ctx.lineTo(2, 10);
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText('SHATTERED', 0, 24);
    }

    ctx.restore();
  }

  private drawCrystals(crystals: Crystal[], time: number, reducedMotion: boolean) {
    const ctx = this.ctx;

    crystals.forEach(c => {
      if (c.collected) return;

      ctx.save();
      const bob = reducedMotion ? 0 : Math.sin(time * 3.5 + c.pulseOffset) * 4;
      const x = c.x;
      const y = c.y + bob;

      // Soft ground drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, c.y + 12, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radial crystal glow
      const glowGrad = ctx.createRadialGradient(x, y, 2, x, y, 22);
      glowGrad.addColorStop(0, c.glowColor);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Faceted Diamond / Rhombus crystal geometry
      const r = c.radius || 13;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.3); // Top apex
      ctx.lineTo(x + r, y - r * 0.1); // Right point
      ctx.lineTo(x, y + r * 1.3); // Bottom apex
      ctx.lineTo(x - r, y - r * 0.1); // Left point
      ctx.closePath();

      // Gradient fill for crystal depth
      const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, c.color);
      grad.addColorStop(1, '#1e1b4b');

      ctx.fillStyle = grad;
      ctx.fill();

      // Crystal facet inner lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.3);
      ctx.lineTo(x, y + r * 1.3);
      ctx.moveTo(x - r, y - r * 0.1);
      ctx.lineTo(x + r, y - r * 0.1);
      ctx.stroke();

      // Bright specular glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x - 3, y - 5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  private drawHazards(hazards: Hazard[], time: number, reducedMotion: boolean) {
    const ctx = this.ctx;

    hazards.forEach(h => {
      ctx.save();
      const { x, y, radius, type, glowColor } = h;

      // Hazard ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x, y + 14, radius + 2, radius / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer danger glow
      const glow = ctx.createRadialGradient(x, y, 2, x, y, radius + 14);
      glow.addColorStop(0, glowColor);
      glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius + 14, 0, Math.PI * 2);
      ctx.fill();

      if (type === 'patrol_sentinel') {
        // Ancient Arcane Sentinel Orb
        ctx.fillStyle = '#450a0a';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner glowing core
        const corePulse = reducedMotion ? 1 : 0.8 + 0.3 * Math.sin(time * 6 + x);
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.45 * corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Rotating outer barrier rings
        const rot = reducedMotion ? 0 : time * 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(252, 165, 165, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-radius * 0.8, -radius * 0.8, radius * 1.6, radius * 1.6);
        ctx.restore();
      } else {
        // Pulsing Rune / Energy Rift
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private drawPlayer(player: Player, time: number) {
    const ctx = this.ctx;
    const { x, y, facing, isMoving, walkCycle, invulnerableTime } = player;

    // Invulnerability flicker
    if (invulnerableTime > 0) {
      const flash = Math.floor(time * 18) % 2 === 0;
      if (flash) return;
    }

    ctx.save();
    ctx.translate(x, y);

    // 1. Player Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Walking bob
    const stepBob = isMoving ? Math.sin(walkCycle * 8) * 2.5 : 0;
    const legOffset = isMoving ? Math.sin(walkCycle * 8) * 4 : 0;

    // 3. Boots / Feet
    ctx.fillStyle = '#451a03'; // Earthy leather boots
    if (facing === 'left' || facing === 'right') {
      ctx.fillRect(-6 + legOffset, 12, 5, 5);
      ctx.fillRect(2 - legOffset, 12, 5, 5);
    } else {
      ctx.fillRect(-8 + legOffset, 12, 5, 5);
      ctx.fillRect(3 - legOffset, 12, 5, 5);
    }

    // 4. Cloak / Cape (billowing slightly behind)
    ctx.fillStyle = '#064e3b'; // Deep emerald cloak
    if (facing === 'down') {
      ctx.beginPath();
      ctx.moveTo(-10, -2);
      ctx.lineTo(10, -2);
      ctx.lineTo(12, 12);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.fill();
    } else if (facing === 'up') {
      ctx.beginPath();
      ctx.moveTo(-11, -4);
      ctx.lineTo(11, -4);
      ctx.lineTo(13, 14);
      ctx.lineTo(-13, 14);
      ctx.closePath();
      ctx.fill();
    } else if (facing === 'left') {
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(8, -2);
      ctx.lineTo(12, 13);
      ctx.lineTo(2, 13);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(4, -2);
      ctx.lineTo(-8, -2);
      ctx.lineTo(-12, 13);
      ctx.lineTo(-2, 13);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Tunic / Body
    ctx.fillStyle = '#059669'; // Emerald green tunic
    ctx.fillRect(-8, -4 + stepBob, 16, 15);

    // Golden adventurer belt & buckle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, 5 + stepBob, 16, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-3, 4 + stepBob, 6, 5);

    // 6. Crystal Seeker Staff (held in hand)
    const staffX = facing === 'left' ? -13 : 13;
    const staffBob = stepBob * 0.5;

    // Staff shaft
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(staffX, -16 + staffBob);
    ctx.lineTo(staffX, 14 + staffBob);
    ctx.stroke();

    // Staff crystal gem tip
    ctx.fillStyle = '#34d399';
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(staffX, -17 + staffBob, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 7. Head & Hood / Hair
    ctx.fillStyle = '#065f46'; // Forest green adventurer hood
    ctx.beginPath();
    ctx.arc(0, -12 + stepBob, 9, 0, Math.PI * 2);
    ctx.fill();

    // Face
    if (facing !== 'up') {
      ctx.fillStyle = '#fed7aa'; // Warm skin tone
      ctx.beginPath();
      ctx.arc(0, -11 + stepBob, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1c1917';
      if (facing === 'down') {
        ctx.fillRect(-3, -12 + stepBob, 2, 2);
        ctx.fillRect(2, -12 + stepBob, 2, 2);
      } else if (facing === 'left') {
        ctx.fillRect(-4, -12 + stepBob, 2, 2);
      } else if (facing === 'right') {
        ctx.fillRect(2, -12 + stepBob, 2, 2);
      }
    }

    // Golden headband / Circlet
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -14 + stepBob, 7.5, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Circlet front gem
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -15 + stepBob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Ethereal golden ward shield when damaged
    if (invulnerableTime > 0) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;

    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  private drawVignette(w: number, h: number, env: LevelConfig['environment']) {
    const ctx = this.ctx;
    ctx.save();
    const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(4, 8, 6, 0.65)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
