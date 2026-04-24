/**
 * Scramble 1940 - RAF Spitfire vs Luftwaffe
 * Battle of Britain dogfight arcade game
 * Top-down vertical shooter with arrow/WASD controls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, Volume2, VolumeX } from 'lucide-react';

interface Scramble1940GameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

// Game constants
const W = 960;
const H = 540;

// Wave data
const WAVES = [
  { num: 1, title: 'Scramble', sub: 'Solo fighters · Angels 15', count: 6, bombers: 0, interval: 1.4 },
  { num: 2, title: 'In Formation', sub: 'Staffel strength · Angels 18', count: 8, bombers: 0, interval: 1.2 },
  { num: 3, title: 'The Bombers', sub: 'Heinkels inbound · Angels 12', count: 8, bombers: 2, interval: 1.0 },
  { num: 4, title: 'Heavy Cover', sub: 'Gruppe strength over Kent', count: 10, bombers: 3, interval: 0.9 },
  { num: 5, title: 'The Big One', sub: 'London is the target', count: 14, bombers: 5, interval: 0.8 },
];

function toRoman(n: number): string {
  const r: [string, number][] = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];
  let s = '', v = n;
  for (const [ch, num] of r) { while (v >= num) { s += ch; v -= num; } }
  return s;
}

export function Scramble1940Game({ onBack, onComplete }: Scramble1940GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<any>(null);
  const frameRef = useRef<number>(0);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameOver'>('title');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [lives, setLives] = useState(3);
  const [hiScore, setHiScore] = useState(() => {
    const saved = localStorage.getItem('ha-scramble-hi');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [waveAnnounce, setWaveAnnounce] = useState<{ num: number; title: string; sub: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Initialize game state
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize stars
    const stars: { x: number; y: number; s: number; tw: number; sp: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: Math.random() * 1.5 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: 0.3 + Math.random() * 1.8
      });
    }

    // Initialize buildings
    const buildings: { x: number; w: number; h: number; windows: { x: number; y: number; on: boolean }[] }[] = [];
    let cx = 0;
    while (cx < W + 20) {
      const bw = 18 + Math.random() * 42;
      const bh = 14 + Math.sin(cx * 0.08) * 10 + Math.random() * 20;
      const windows: { x: number; y: number; on: boolean }[] = [];
      if (Math.random() > 0.35) {
        for (let w = 0; w < 1 + Math.random() * 2; w++) {
          windows.push({
            x: 2 + Math.random() * (bw - 4),
            y: 4 + Math.random() * (bh - 8),
            on: Math.random() > 0.5
          });
        }
      }
      buildings.push({ x: cx, w: bw, h: bh, windows });
      cx += bw + 2 + Math.random() * 5;
    }

    gameRef.current = {
      state: 'title',
      score: 0,
      wave: 1,
      kills: 0,
      lives: 3,
      player: null,
      bullets: [],
      enemies: [],
      enemyBullets: [],
      particles: [],
      keys: {} as Record<string, boolean>,
      waveToSpawn: 0,
      spawnTimer: 0,
      spawnInterval: 1.1,
      waveBombers: 0,
      waveTransition: 0,
      stars,
      buildings,
      time: 0,
      lastFrame: 0,
      ctx,
    };
  }, []);

  // Player class
  class Player {
    x: number;
    y: number;
    w: number = 48;
    h: number = 44;
    speed: number = 320;
    lastFire: number = 0;
    fireRate: number = 140;
    invuln: number = 1500;
    hitFlash: number = 0;

    constructor() {
      this.x = W / 2;
      this.y = H - 80;
    }

    update(dt: number, keys: Record<string, boolean>, G: any) {
      let dx = 0, dy = 0;
      if (keys['ArrowLeft'] || keys['KeyA']) dx -= 1;
      if (keys['ArrowRight'] || keys['KeyD']) dx += 1;
      if (keys['ArrowUp'] || keys['KeyW']) dy -= 1;
      if (keys['ArrowDown'] || keys['KeyS']) dy += 1;
      if (dx && dy) { dx *= 0.707; dy *= 0.707; }
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      this.x = Math.max(28, Math.min(W - 28, this.x));
      this.y = Math.max(H * 0.4, Math.min(H - 50, this.y));

      if (keys['Space']) this.fire(G);
      if (this.invuln > 0) this.invuln -= dt * 1000;
      if (this.hitFlash > 0) this.hitFlash -= dt * 1000;
    }

    fire(G: any) {
      const now = performance.now();
      if (now - this.lastFire < this.fireRate) return;
      this.lastFire = now;
      G.bullets.push(new Bullet(this.x - 16, this.y - 8, 0, -520, false));
      G.bullets.push(new Bullet(this.x + 16, this.y - 8, 0, -520, false));
    }

    draw(ctx: CanvasRenderingContext2D) {
      if (this.invuln > 0 && Math.floor(this.invuln / 90) % 2 === 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      // Propeller blur
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#888';
      ctx.beginPath();
      ctx.ellipse(0, -22, 14, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.ellipse(0, -22, 3, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Engine nose
      ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#3a4038';
      ctx.beginPath();
      ctx.ellipse(0, -16, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings (Spitfire elliptical)
      const bodyColor = this.hitFlash > 0 ? '#fff' : '#566552';
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 2, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing shadow
      ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#3a4238';
      ctx.beginPath();
      ctx.ellipse(0, 5, 22, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fuselage
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail horizontal
      ctx.beginPath();
      ctx.ellipse(0, 16, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail vertical
      ctx.beginPath();
      ctx.moveTo(-2, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(2, 14);
      ctx.closePath();
      ctx.fill();

      if (this.hitFlash <= 0) {
        // RAF roundels
        for (const sx of [-14, 14]) {
          ctx.fillStyle = '#1a3a8a';
          ctx.beginPath();
          ctx.arc(sx, 2, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f2e4bd';
          ctx.beginPath();
          ctx.arc(sx, 2, 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c8141a';
          ctx.beginPath();
          ctx.arc(sx, 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Cockpit canopy
        ctx.fillStyle = '#1a2036';
        ctx.beginPath();
        ctx.ellipse(0, -4, 3.2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(180,210,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-1, -5, 1, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Bullet class
  class Bullet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    enemy: boolean;
    dead: boolean = false;
    w: number = 2;
    h: number = 10;
    trail: { x: number; y: number }[] = [];

    constructor(x: number, y: number, vx: number, vy: number, enemy: boolean) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.enemy = enemy;
    }

    update(dt: number) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 5) this.trail.shift();
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.y < -20 || this.y > H + 20 || this.x < -20 || this.x > W + 20) this.dead = true;
    }

    draw(ctx: CanvasRenderingContext2D) {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        const a = (i + 1) / this.trail.length * 0.3;
        ctx.fillStyle = this.enemy ? `rgba(230,171,42,${a})` : `rgba(255,138,42,${a})`;
        ctx.fillRect(t.x - 1.5, t.y, 3, this.h + 4);
      }
      ctx.fillStyle = this.enemy ? '#ffc845' : '#ff8a2a';
      ctx.fillRect(this.x - 1, this.y - 3, 2, this.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 0.5, this.y - 1, 1, this.h - 4);
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = this.enemy ? '#fff0b0' : '#ffbe80';
      ctx.beginPath();
      ctx.arc(this.x, this.y - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Enemy class
  class Enemy {
    type: 'fighter' | 'bomber';
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    hp: number;
    maxHp: number;
    points: number;
    color: string;
    fireInterval: number;
    fireTimer: number;
    sway: { amp: number; freq: number; phase: number; baseX: number } | null;
    hitFlash: number = 0;
    dead: boolean = false;

    constructor(type: 'fighter' | 'bomber', wave: number) {
      this.type = type;
      this.x = 40 + Math.random() * (W - 80);
      this.y = -40;

      if (type === 'fighter') {
        this.w = 38;
        this.h = 34;
        this.speed = 80 + wave * 8 + Math.random() * 30;
        this.hp = 1;
        this.maxHp = 1;
        this.points = 100;
        this.color = '#3a4048';
        this.fireInterval = 1.6 + Math.random() * 1.4;
        this.sway = {
          amp: 30 + Math.random() * 40,
          freq: 0.6 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          baseX: this.x
        };
      } else {
        this.w = 68;
        this.h = 48;
        this.speed = 55 + wave * 4;
        this.hp = 3;
        this.maxHp = 3;
        this.points = 250;
        this.color = '#2a2e36';
        this.fireInterval = 2.2;
        this.sway = null;
      }
      this.fireTimer = 0.5 + Math.random() * 1.5;
    }

    update(dt: number, G: any) {
      this.y += this.speed * dt;
      if (this.sway) this.x = this.sway.baseX + Math.sin(G.time * this.sway.freq + this.sway.phase) * this.sway.amp;
      if (this.y > H + 50) this.dead = true;
      if (this.hitFlash > 0) this.hitFlash -= dt * 1000;

      this.fireTimer -= dt;
      if (this.fireTimer <= 0 && this.y > 20 && this.y < H - 100) {
        this.fireTimer = this.fireInterval;
        if (this.type === 'bomber') {
          G.enemyBullets.push(new Bullet(this.x - 18, this.y + 14, 0, 280, true));
          G.enemyBullets.push(new Bullet(this.x + 18, this.y + 14, 0, 280, true));
        } else if (G.player) {
          const px = G.player.x - this.x;
          const py = G.player.y - this.y;
          const d = Math.sqrt(px * px + py * py);
          G.enemyBullets.push(new Bullet(this.x, this.y + 10, px / d * 280, py / d * 280, true));
        }
      }
    }

    hit(G: any): boolean {
      this.hp--;
      this.hitFlash = 80;
      if (this.hp <= 0) {
        this.dead = true;
        G.score += this.points;
        G.kills++;
        spawnExplosion(this.x, this.y, this.type === 'bomber' ? 1.6 : 1, G);
        return true;
      } else {
        spawnExplosion(this.x, this.y, 0.3, G);
        return false;
      }
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.x, this.y);
      const flash = this.hitFlash > 0;
      const c = flash ? '#ffffff' : this.color;

      if (this.type === 'fighter') {
        // Propeller
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(0, 18, 10, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Fuselage
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.beginPath();
        ctx.moveTo(-18, -2);
        ctx.lineTo(-19, 4);
        ctx.lineTo(19, 4);
        ctx.lineTo(18, -2);
        ctx.closePath();
        ctx.fill();

        // Tail horizontal
        ctx.beginPath();
        ctx.ellipse(0, -14, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail fin
        ctx.beginPath();
        ctx.moveTo(-1.5, -12);
        ctx.lineTo(0, -18);
        ctx.lineTo(1.5, -12);
        ctx.closePath();
        ctx.fill();

        // Engine block
        ctx.fillStyle = flash ? '#fff' : '#1a1e24';
        ctx.fillRect(-3, 10, 6, 8);

        if (!flash) {
          // Balkenkreuz on wings
          ctx.fillStyle = '#0a0a0a';
          for (const sx of [-12, 12]) {
            ctx.fillRect(sx - 2.5, -0.5, 5, 2);
            ctx.fillRect(sx - 1, -2, 2, 5);
          }
          ctx.fillStyle = '#d0c8a0';
          for (const sx of [-12, 12]) {
            ctx.fillRect(sx - 1.5, 0, 3, 1);
            ctx.fillRect(sx - 0.5, -1, 1, 3);
          }

          // Canopy
          ctx.fillStyle = '#0a0e18';
          ctx.beginPath();
          ctx.ellipse(0, 4, 3, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // He-111 bomber
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.beginPath();
        ctx.moveTo(-32, -4);
        ctx.lineTo(-34, 6);
        ctx.lineTo(34, 6);
        ctx.lineTo(32, -4);
        ctx.closePath();
        ctx.fill();

        // Engines
        ctx.fillStyle = flash ? '#fff' : '#15181e';
        ctx.fillRect(-22, -2, 8, 14);
        ctx.fillRect(14, -2, 8, 14);

        // Engine prop discs
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(-18, 14, 5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(18, 14, 5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Tail
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(0, -18, 12, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-2, -16);
        ctx.lineTo(0, -23);
        ctx.lineTo(2, -16);
        ctx.closePath();
        ctx.fill();

        // Glazed nose
        ctx.fillStyle = flash ? '#fff' : '#6a7280';
        ctx.beginPath();
        ctx.ellipse(0, 18, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (!flash) {
          // Balkenkreuz on fuselage
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(-5, -2, 10, 4);
          ctx.fillRect(-2, -5, 4, 10);
          ctx.fillStyle = '#d0c8a0';
          ctx.fillRect(-4, -1, 8, 2);
          ctx.fillRect(-1, -4, 2, 8);

          // HP indicator
          if (this.hp < this.maxHp) {
            const barY = -32;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(-16, barY, 32, 3);
            ctx.fillStyle = '#ff4020';
            ctx.fillRect(-16, barY, 32 * (this.hp / this.maxHp), 3);
          }
        }
      }
      ctx.restore();
    }
  }

  // Particle class
  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    smoke: boolean;
    dead: boolean = false;

    constructor(x: number, y: number, vx: number, vy: number, life: number, color: string, size: number, smoke: boolean = false) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.color = color;
      this.size = size;
      this.smoke = smoke;
    }

    update(dt: number) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.93;
      this.vy *= 0.93;
      if (this.smoke) this.vy -= 40 * dt;
      this.life -= dt;
      if (this.life <= 0) this.dead = true;
    }

    draw(ctx: CanvasRenderingContext2D) {
      const a = Math.max(0, this.life / this.maxLife);
      const s = this.size * (this.smoke ? (1.6 - a) : (0.4 + 0.6 * a));
      ctx.save();
      ctx.globalAlpha = a * (this.smoke ? 0.5 : 1);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Spawn explosion
  function spawnExplosion(x: number, y: number, scale: number, G: any) {
    const n = Math.floor(22 * scale);
    const colors = ['#ff8a2a', '#ffc845', '#ff4020', '#f2e4bd', '#ffe080'];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (60 + Math.random() * 200) * scale;
      const life = 0.4 + Math.random() * 0.7;
      const col = colors[Math.floor(Math.random() * colors.length)];
      const sz = (2 + Math.random() * 4) * scale;
      G.particles.push(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, life, col, sz));
    }
    const sn = Math.floor(10 * scale);
    for (let i = 0; i < sn; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 15 + Math.random() * 50;
      const life = 0.8 + Math.random() * 1.0;
      G.particles.push(new Particle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, life, 'rgba(70,65,60,0.85)', 4 + Math.random() * 4, true));
    }
  }

  // Draw background
  function drawBackground(ctx: CanvasRenderingContext2D, G: any) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0a1a');
    sky.addColorStop(0.55, '#1a1220');
    sky.addColorStop(1, '#2a1410');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const st of G.stars) {
      const b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(G.time * st.sp + st.tw));
      ctx.fillStyle = `rgba(242,238,230,${b})`;
      ctx.fillRect(st.x, st.y, st.s, st.s);
    }

    // Moon
    const mx = W * 0.84, my = 64;
    ctx.save();
    ctx.shadowColor = 'rgba(245,229,184,0.55)';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#f5e5b8';
    ctx.beginPath();
    ctx.arc(mx, my, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(140,110,70,0.28)';
    ctx.beginPath();
    ctx.arc(mx - 5, my - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(mx + 7, my + 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Searchlights
    const lights = [
      { x: W * 0.18, angle: -Math.PI / 2 + Math.sin(G.time * 0.35) * 0.5 },
      { x: W * 0.68, angle: -Math.PI / 2 + Math.cos(G.time * 0.28) * 0.5 }
    ];
    for (const l of lights) {
      ctx.save();
      ctx.translate(l.x, H - 20);
      ctx.rotate(l.angle);
      const cone = ctx.createLinearGradient(0, 0, 0, -560);
      cone.addColorStop(0, 'rgba(230,171,42,0.28)');
      cone.addColorStop(0.7, 'rgba(230,171,42,0.08)');
      cone.addColorStop(1, 'rgba(230,171,42,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.lineTo(120, -560);
      ctx.lineTo(-120, -560);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, H - 28, W, 28);

    // Buildings silhouette
    for (const b of G.buildings) {
      ctx.fillStyle = '#050506';
      ctx.fillRect(b.x, H - 28 - b.h, b.w, b.h);
      for (const win of b.windows) {
        if (win.on && Math.sin(G.time * 0.5 + b.x) > -0.2) {
          ctx.fillStyle = 'rgba(230,171,42,0.55)';
          ctx.fillRect(b.x + win.x, H - 28 - b.h + win.y, 1.5, 1.5);
        }
      }
    }

    // Random flak bursts
    if (Math.random() < 0.015) {
      const fx = Math.random() * W;
      const fy = 100 + Math.random() * 200;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#ff8a2a';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(fx, fy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Film grain
    ctx.save();
    ctx.globalAlpha = 0.035;
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
    ctx.restore();
  }

  // Hit detection
  function hit(a: { x: number; y: number }, b: { x: number; y: number }, rA: number, rB: number): boolean {
    const dx = a.x - b.x, dy = a.y - b.y;
    const r = rA + rB;
    return dx * dx + dy * dy < r * r;
  }

  // Start wave
  const startWave = useCallback((n: number, G: any) => {
    let waveData = WAVES[Math.min(n - 1, WAVES.length - 1)];
    if (n > WAVES.length) {
      waveData = {
        ...waveData,
        count: 12 + (n - WAVES.length) * 2,
        bombers: 4 + Math.floor((n - WAVES.length) / 2),
        interval: Math.max(0.5, 0.8 - (n - WAVES.length) * 0.05)
      };
    }
    G.wave = n;
    G.waveToSpawn = waveData.count;
    G.spawnInterval = waveData.interval;
    G.spawnTimer = 0.8;
    G.waveBombers = waveData.bombers;
    G.waveTransition = 2400;

    setWave(n);
    setWaveAnnounce({ num: n, title: waveData.title, sub: waveData.sub });
    setTimeout(() => setWaveAnnounce(null), 2400);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    const G = gameRef.current;
    if (!G) return;

    G.state = 'playing';
    G.score = 0;
    G.wave = 0;
    G.kills = 0;
    G.lives = 3;
    G.player = new Player();
    G.bullets = [];
    G.enemies = [];
    G.enemyBullets = [];
    G.particles = [];

    setGameState('playing');
    setScore(0);
    setWave(1);
    setKills(0);
    setLives(3);

    startWave(1, G);
  }, [startWave]);

  // Game over
  const handleGameOver = useCallback(() => {
    const G = gameRef.current;
    if (!G) return;

    G.state = 'gameOver';
    setGameState('gameOver');

    // Update high score
    if (G.score > hiScore) {
      setHiScore(G.score);
      localStorage.setItem('ha-scramble-hi', G.score.toString());
    }
  }, [hiScore]);

  // Hit player
  const hitPlayer = useCallback((G: any) => {
    G.lives--;
    setLives(G.lives);
    spawnExplosion(G.player.x, G.player.y, 1.2, G);
    if (G.lives <= 0) {
      handleGameOver();
    } else {
      G.player.invuln = 2000;
      G.player.x = W / 2;
      G.player.y = H - 80;
    }
  }, [handleGameOver]);

  // Game loop
  useEffect(() => {
    initGame();

    const loop = (now: number) => {
      const G = gameRef.current;
      if (!G || !G.ctx) {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = G.ctx;
      const dt = Math.min(0.05, (now - G.lastFrame) / 1000 || 0);
      G.lastFrame = now;
      G.time += dt;

      drawBackground(ctx, G);

      if (G.state === 'playing') {
        // Spawn enemies
        if (G.waveToSpawn > 0) {
          G.spawnTimer -= dt;
          if (G.spawnTimer <= 0) {
            G.spawnTimer = G.spawnInterval * (0.7 + Math.random() * 0.6);
            const makeB = G.waveBombers > 0 && Math.random() < 0.35;
            G.enemies.push(new Enemy(makeB ? 'bomber' : 'fighter', G.wave));
            if (makeB) G.waveBombers--;
            G.waveToSpawn--;
          }
        } else if (G.enemies.length === 0) {
          startWave(G.wave + 1, G);
        }

        // Update
        G.player.update(dt, G.keys, G);
        for (const b of G.bullets) b.update(dt);
        for (const b of G.enemyBullets) b.update(dt);
        for (const e of G.enemies) e.update(dt, G);
        for (const p of G.particles) p.update(dt);

        // Player bullets vs enemies
        for (const b of G.bullets) {
          if (b.dead) continue;
          for (const e of G.enemies) {
            if (e.dead) continue;
            if (hit(b, e, 3, (e.w + e.h) / 4 - 2)) {
              b.dead = true;
              e.hit(G);
              setScore(G.score);
              setKills(G.kills);
              if (G.score > hiScore) {
                setHiScore(G.score);
                localStorage.setItem('ha-scramble-hi', G.score.toString());
              }
              break;
            }
          }
        }

        // Enemy bullets vs player
        if (G.player.invuln <= 0) {
          for (const b of G.enemyBullets) {
            if (b.dead) continue;
            if (hit(b, G.player, 4, 14)) {
              b.dead = true;
              hitPlayer(G);
              break;
            }
          }
          // Plane collision
          for (const e of G.enemies) {
            if (e.dead) continue;
            if (hit(e, G.player, (e.w + e.h) / 4 - 4, 14)) {
              e.hit(G);
              e.hit(G);
              e.hit(G);
              hitPlayer(G);
              break;
            }
          }
        }

        // Cleanup
        G.bullets = G.bullets.filter((b: Bullet) => !b.dead);
        G.enemyBullets = G.enemyBullets.filter((b: Bullet) => !b.dead);
        G.enemies = G.enemies.filter((e: Enemy) => !e.dead);
        G.particles = G.particles.filter((p: Particle) => !p.dead);
      } else if (G.state === 'paused') {
        // Render but don't update
        G.player?.draw(ctx);
        for (const b of G.bullets) b.draw(ctx);
        for (const b of G.enemyBullets) b.draw(ctx);
        for (const e of G.enemies) e.draw(ctx);
        for (const p of G.particles) p.draw(ctx);

        // Pause text
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#E6AB2A';
        ctx.font = 'italic 900 56px Oswald';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, H / 2);
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillStyle = '#F2EEE6';
        ctx.fillText('PRESS P TO RESUME', W / 2, H / 2 + 30);
        ctx.restore();
      }

      // Draw game entities
      if (G.state === 'playing' || G.state === 'gameOver') {
        for (const p of G.particles) p.draw(ctx);
        for (const e of G.enemies) e.draw(ctx);
        for (const b of G.enemyBullets) b.draw(ctx);
        if (G.player) G.player.draw(ctx);
        for (const b of G.bullets) b.draw(ctx);
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [initGame, startWave, hitPlayer, hiScore]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const G = gameRef.current;
      if (!G) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      G.keys[e.code] = true;

      if (e.code === 'KeyP') {
        if (G.state === 'playing') {
          G.state = 'paused';
          setGameState('paused');
        } else if (G.state === 'paused') {
          G.state = 'playing';
          setGameState('playing');
        }
      }
      if (e.code === 'KeyR' && G.state === 'gameOver') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const G = gameRef.current;
      if (!G) return;
      G.keys[e.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame]);

  // Touch controls
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let touchId: number | null = null;
    let touchStart: { x: number; y: number } | null = null;
    let playerStart: { x: number; y: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      const G = gameRef.current;
      if (G?.state !== 'playing' || !G?.player) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      touchStart = { x: t.clientX, y: t.clientY };
      playerStart = { x: G.player.x, y: G.player.y };
      G.keys['Space'] = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const G = gameRef.current;
      if (touchId === null || G?.state !== 'playing' || !G?.player) return;
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchId && touchStart && playerStart) {
          const rect = stage.getBoundingClientRect();
          const scale = W / rect.width;
          const dx = (t.clientX - touchStart.x) * scale;
          const dy = (t.clientY - touchStart.y) * scale;
          G.player.x = Math.max(28, Math.min(W - 28, playerStart.x + dx));
          G.player.y = Math.max(H * 0.4, Math.min(H - 50, playerStart.y + dy));
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const G = gameRef.current;
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === touchId) {
          touchId = null;
          if (G) G.keys['Space'] = false;
        }
      }
    };

    stage.addEventListener('touchstart', handleTouchStart, { passive: false });
    stage.addEventListener('touchmove', handleTouchMove, { passive: false });
    stage.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      stage.removeEventListener('touchstart', handleTouchStart);
      stage.removeEventListener('touchmove', handleTouchMove);
      stage.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleComplete = () => {
    // Award XP based on score - base 25 XP plus bonus for kills
    const xp = Math.min(75, 25 + Math.floor(kills / 3) * 5);
    onComplete(xp);
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(230,171,42,0.15)] bg-gradient-to-b from-[#131009] to-[#0a0805]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.28em] text-text-3 uppercase font-semibold hover:text-gold-2 transition-colors"
            >
              <ChevronLeft size={12} strokeWidth={2.2} />
              Arcade
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full border-[1.5px] border-gold-2 flex items-center justify-center bg-[rgba(60,35,12,0.4)] shadow-[0_0_14px_rgba(230,171,42,0.25)]">
                <span className="text-lg">✈️</span>
              </span>
              <span className="font-['Playfair_Display'] font-bold italic text-xl text-off-white">
                Scramble <em className="text-gold-2">1940</em>
              </span>
            </div>
            <span className="px-2.5 py-1 border border-[rgba(230,171,42,0.35)] rounded-sm bg-[rgba(40,25,8,0.4)] font-mono text-[9px] tracking-[0.32em] text-gold-2 uppercase font-bold">
              <span className="text-gold-2 text-[7px] mr-1.5">◆</span>
              Battle of Britain
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.22em] text-text-3 uppercase font-semibold flex items-center gap-2">
            High Score
            <em className="font-['DM_Serif_Display'] font-normal italic text-sm text-gold-2 tracking-normal">{hiScore}</em>
          </div>
        </div>
      </div>

      {/* Game Stage */}
      <div ref={stageRef} className="relative w-full aspect-video bg-black overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* HUD Overlay */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner decorations */}
            <span className="absolute top-3 left-3 w-7 h-7 border-l-2 border-t-2 border-gold-2 opacity-55" />
            <span className="absolute top-3 right-3 w-7 h-7 border-r-2 border-t-2 border-gold-2 opacity-55" />
            <span className="absolute bottom-3 left-3 w-7 h-7 border-l-2 border-b-2 border-gold-2 opacity-55" />
            <span className="absolute bottom-3 right-3 w-7 h-7 border-r-2 border-b-2 border-gold-2 opacity-55" />

            {/* HUD Top Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-[rgba(8,5,2,0.85)] backdrop-blur-sm px-5 py-2 border border-[rgba(230,171,42,0.35)] rounded shadow-lg">
              <div className="flex flex-col items-center gap-0.5 px-2.5 border-r border-dashed border-[rgba(230,171,42,0.25)] min-w-[70px]">
                <div className="font-mono text-[8px] tracking-[0.32em] text-[rgba(230,171,42,0.55)] uppercase font-bold">Score</div>
                <div className="font-['DM_Serif_Display'] italic text-2xl text-[#F6E355] leading-none" style={{ textShadow: '0 0 12px rgba(230,171,42,0.4)' }}>
                  {score.toString().padStart(5, '0')}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2.5 border-r border-dashed border-[rgba(230,171,42,0.25)] min-w-[70px]">
                <div className="font-mono text-[8px] tracking-[0.32em] text-[rgba(230,171,42,0.55)] uppercase font-bold">Wave</div>
                <div className="font-['DM_Serif_Display'] italic text-xl text-gold-2 leading-none">
                  <em className="text-[#E84046] italic">{wave}</em>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2.5 border-r border-dashed border-[rgba(230,171,42,0.25)] min-w-[70px]">
                <div className="font-mono text-[8px] tracking-[0.32em] text-[rgba(230,171,42,0.55)] uppercase font-bold">Kills</div>
                <div className="font-['DM_Serif_Display'] italic text-xl text-gold-2 leading-none">{kills}</div>
              </div>
              <div className="flex flex-col items-center gap-0.5 px-2.5 min-w-[70px]">
                <div className="font-mono text-[8px] tracking-[0.32em] text-[rgba(230,171,42,0.55)] uppercase font-bold">Aircraft</div>
                <div className="flex gap-1.5 mt-0.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={`text-sm ${i < lives ? 'text-gold-2' : 'text-gold-2/15'}`} style={{ filter: i < lives ? 'drop-shadow(0 0 4px rgba(230,171,42,0.5))' : 'none' }}>
                      ✈️
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Wave Announcement */}
            <AnimatePresence>
              {waveAnnounce && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                >
                  <div className="font-mono text-[11px] tracking-[0.45em] text-[#E84046] uppercase font-bold mb-1">
                    ◆ Wave {waveAnnounce.num} ◆
                  </div>
                  <div className="font-['Oswald'] font-black text-5xl text-[#F6E355] uppercase italic tracking-wide leading-none"
                    style={{ textShadow: '0 0 24px rgba(230,171,42,0.7), 0 4px 10px rgba(0,0,0,0.8)' }}>
                    {waveAnnounce.title}
                  </div>
                  <div className="font-['Cormorant_Garamond'] italic text-base text-[#f2e4bd] mt-1"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
                    {waveAnnounce.sub}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Title Screen */}
        {gameState === 'title' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(40,25,10,0.85), rgba(0,0,0,0.95))' }}>
            <div className="font-mono text-[11px] tracking-[0.45em] text-[#E84046] uppercase font-bold flex items-center gap-3">
              <span className="w-6 h-px bg-[#E84046]" />
              Sept 1940 · Battle of Britain
              <span className="w-6 h-px bg-[#E84046]" />
            </div>
            <div className="font-['Oswald'] font-black text-7xl md:text-8xl text-[#F6E355] uppercase italic leading-none tracking-wide"
              style={{ textShadow: '0 0 30px rgba(230,171,42,0.4), 0 6px 14px rgba(0,0,0,0.8), -2px -2px 0 #8A0A0E' }}>
              Scramble
            </div>
            <div className="font-['DM_Serif_Display'] italic text-4xl md:text-5xl text-gold-2 leading-none -mt-2"
              style={{ textShadow: '0 0 24px rgba(230,171,42,0.4)' }}>
              Nineteen <em>forty</em>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 border border-gold-2 rounded-sm font-mono text-[9px] tracking-[0.32em] text-gold-2 uppercase font-bold bg-[rgba(40,25,8,0.5)] mt-2">
              <span className="w-1.5 h-1.5 bg-[#E84046] rounded-full animate-pulse" />
              RAF · Standby for Orders
            </div>
            <p className="font-['Cormorant_Garamond'] italic text-base text-[#f2e4bd] max-w-md mt-1">
              Luftwaffe formations inbound over Kent. Climb to twenty thousand feet and engage. Keep the bombers off London.
            </p>
            <button
              onClick={startGame}
              className="relative flex items-center justify-center gap-3 px-10 py-3.5 mt-4 font-['Oswald'] text-sm font-black tracking-[0.32em] uppercase text-[#1a0b02] rounded-md cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                boxShadow: '0 8px 22px rgba(230,171,42,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(138,80,20,0.3)'
              }}
            >
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
              Start Engines
              <Play size={14} fill="currentColor" />
            </button>
            <div className="flex gap-5 mt-4 flex-wrap justify-center font-mono text-[9.5px] tracking-[0.25em] text-text-3 uppercase font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="kbd">W</span><span className="kbd">A</span><span className="kbd">S</span><span className="kbd">D</span>
                <span className="ml-1">Fly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="kbd">↑</span><span className="kbd">↓</span><span className="kbd">←</span><span className="kbd">→</span>
                <span className="ml-1">Fly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="kbd px-3">Space</span>
                <span className="ml-1">Fire</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="kbd">P</span>
                <span className="ml-1">Pause</span>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(40,25,10,0.85), rgba(0,0,0,0.95))' }}>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -6 }}
              className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 border-[3px] border-double border-ha-red bg-[rgba(138,10,14,0.15)] font-['Oswald'] font-black text-4xl tracking-[0.1em] text-[#E84046] uppercase italic"
              style={{ textShadow: '0 0 20px rgba(205,14,20,0.5)', boxShadow: '0 0 30px rgba(205,14,20,0.3)' }}
            >
              <span className="absolute inset-1 border border-dashed border-ha-red opacity-55" />
              Shot Down
            </motion.div>

            <div className="grid grid-cols-3 gap-8 p-6 bg-[rgba(8,5,2,0.7)] border border-[rgba(230,171,42,0.35)] rounded-md mt-24 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-0.5">
                <div className="font-mono text-[9px] tracking-[0.32em] text-text-3 uppercase font-bold">Final Score</div>
                <div className="font-['DM_Serif_Display'] italic text-4xl text-gold-2" style={{ textShadow: '0 0 16px rgba(230,171,42,0.4)' }}>
                  {score}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="font-mono text-[9px] tracking-[0.32em] text-text-3 uppercase font-bold">Wave Reached</div>
                <div className="font-['DM_Serif_Display'] italic text-4xl text-gold-2" style={{ textShadow: '0 0 16px rgba(230,171,42,0.4)' }}>
                  {wave}
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="font-mono text-[9px] tracking-[0.32em] text-text-3 uppercase font-bold">Kills</div>
                <div className="font-['DM_Serif_Display'] italic text-4xl text-gold-2" style={{ textShadow: '0 0 16px rgba(230,171,42,0.4)' }}>
                  {kills}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={startGame}
                className="relative flex items-center justify-center gap-3 px-8 py-3 font-['Oswald'] text-sm font-black tracking-[0.32em] uppercase text-[#1a0b02] rounded-md cursor-pointer"
                style={{
                  background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                  boxShadow: '0 8px 22px rgba(230,171,42,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
              >
                <span className="absolute top-0 left-0 w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
                Scramble Again
                <Play size={14} fill="currentColor" />
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 font-['Oswald'] text-sm font-bold tracking-[0.2em] uppercase text-gold-2 border border-gold-2/50 rounded-md hover:bg-gold-2/10 transition-colors"
              >
                Collect XP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gradient-to-b from-[#131009] to-[#0a0805] border-t border-[rgba(230,171,42,0.15)]">
        <div className="flex items-center gap-3 p-3 bg-[rgba(8,5,2,0.5)] border border-[rgba(242,238,230,0.08)] rounded">
          <div className="flex gap-0.5">
            <span className="kbd">↑</span><span className="kbd">↓</span><span className="kbd">←</span><span className="kbd">→</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide text-off-white">Fly</div>
            <div className="font-mono text-[8.5px] tracking-[0.22em] text-text-4 uppercase font-semibold">Arrow keys or WASD</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[rgba(8,5,2,0.5)] border border-[rgba(242,238,230,0.08)] rounded">
          <span className="kbd px-4">Space</span>
          <div className="flex flex-col gap-0.5">
            <div className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide text-off-white">Fire Guns</div>
            <div className="font-mono text-[8.5px] tracking-[0.22em] text-text-4 uppercase font-semibold">.303 Browning MGs</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[rgba(8,5,2,0.5)] border border-[rgba(242,238,230,0.08)] rounded">
          <span className="kbd">P</span>
          <div className="flex flex-col gap-0.5">
            <div className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide text-off-white">Pause</div>
            <div className="font-mono text-[8.5px] tracking-[0.22em] text-text-4 uppercase font-semibold">Hold your position</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[rgba(8,5,2,0.5)] border border-[rgba(242,238,230,0.08)] rounded">
          <span className="kbd">R</span>
          <div className="flex flex-col gap-0.5">
            <div className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide text-off-white">Restart</div>
            <div className="font-mono text-[8.5px] tracking-[0.22em] text-text-4 uppercase font-semibold">After being shot down</div>
          </div>
        </div>
      </div>

      {/* KBD styles */}
      <style>{`
        .kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          background: rgba(20,14,8,0.7);
          border: 1px solid rgba(230,171,42,0.35);
          border-radius: 3px;
          color: var(--gold-2);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 10px;
          box-shadow: inset 0 1px 0 rgba(230,171,42,0.15), 0 2px 4px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
