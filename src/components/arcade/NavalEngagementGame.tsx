import { useState, useCallback, useEffect, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Shuffle, Anchor, X } from 'lucide-react';

// ═══ CONSTANTS ═══
const GRID_SIZE = 10;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface ShipType {
  id: string;
  name: string;
  cls: string;
  size: number;
}

const SHIP_TYPES: ShipType[] = [
  { id: 'carrier', name: 'USS Enterprise', cls: 'CV-6 · Carrier', size: 5 },
  { id: 'battleship', name: 'USS Missouri', cls: 'BB-63 · Battleship', size: 4 },
  { id: 'destroyer', name: 'USS Fletcher', cls: 'DD-445 · Destroyer', size: 3 },
  { id: 'submarine', name: 'USS Gato', cls: 'SS-212 · Submarine', size: 3 },
  { id: 'patrol', name: 'PT-109', cls: 'Patrol Torpedo', size: 2 },
];

type Difficulty = 'ensign' | 'lieutenant' | 'commander' | 'admiral';
type Orientation = 'horizontal' | 'vertical';
type Phase = 'deploy' | 'battle' | 'results';
type Turn = 'player' | 'ai';
type CellState = null | 'hit' | 'miss';

const DIFF_NAMES: Record<Difficulty, string> = {
  ensign: 'Ensign',
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  admiral: 'Admiral',
};

const DIFF_DESCRIPTIONS: Record<Difficulty, string> = {
  ensign: 'Fires at random coordinates. No fire pattern, no memory.',
  lieutenant: 'Hunts neighboring cells after a hit. Basic follow-up.',
  commander: 'Parity checkerboard + line tracking on hit streaks.',
  admiral: 'Probability density targeting. Tracks sunk ships.',
};

interface Position {
  x: number;
  y: number;
}

interface Ship {
  id: string;
  name: string;
  cls: string;
  size: number;
  positions: Position[];
  orientation: Orientation;
  hits: Set<string>;
}

interface Side {
  ships: Ship[];
  grid: (string | null)[][];
  shots: CellState[][];
}

interface AIState {
  mode: 'hunt' | 'target';
  targetQueue: { x: number; y: number; key: string }[];
  hitStreak: { x: number; y: number; shipId: string }[];
}

interface LogEntry {
  id: number;
  html: string;
}

interface NavalEngagementGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

// ═══ HELPERS ═══
function makeGrid(): (string | null)[][] {
  const g: (string | null)[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    g[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) g[y][x] = null;
  }
  return g;
}

function makeShots(): CellState[][] {
  return makeGrid() as CellState[][];
}

function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function createShip(t: ShipType): Ship {
  return {
    id: t.id,
    name: t.name,
    cls: t.cls,
    size: t.size,
    positions: [],
    orientation: 'horizontal',
    hits: new Set(),
  };
}

function canPlace(
  grid: (string | null)[][],
  ship: Ship,
  x: number,
  y: number,
  o: Orientation
): boolean {
  const dx = o === 'horizontal' ? 1 : 0;
  const dy = o === 'vertical' ? 1 : 0;
  for (let i = 0; i < ship.size; i++) {
    const cx = x + dx * i;
    const cy = y + dy * i;
    if (!inBounds(cx, cy)) return false;
    if (grid[cy][cx] && grid[cy][cx] !== ship.id) return false;
  }
  return true;
}

function placeShip(
  grid: (string | null)[][],
  ship: Ship,
  x: number,
  y: number,
  o: Orientation
): void {
  const dx = o === 'horizontal' ? 1 : 0;
  const dy = o === 'vertical' ? 1 : 0;
  ship.positions = [];
  ship.orientation = o;
  for (let i = 0; i < ship.size; i++) {
    const cx = x + dx * i;
    const cy = y + dy * i;
    grid[cy][cx] = ship.id;
    ship.positions.push({ x: cx, y: cy });
  }
}

function removeShip(grid: (string | null)[][], ship: Ship): void {
  for (const p of ship.positions) grid[p.y][p.x] = null;
  ship.positions = [];
}

function randomPlace(side: Side): void {
  side.grid = makeGrid();
  for (const ship of side.ships) {
    let attempts = 0;
    while (attempts < 200) {
      const o: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (canPlace(side.grid, ship, x, y, o)) {
        placeShip(side.grid, ship, x, y, o);
        break;
      }
      attempts++;
    }
  }
}

function shipHasPos(ship: Ship, x: number, y: number): boolean {
  return ship.positions.some((p) => p.x === x && p.y === y);
}

function isShipSunk(ship: Ship): boolean {
  return ship.hits.size >= ship.size;
}

// ═══ COMPASS ROSE SVG ═══
function CompassRose() {
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="#E6AB2A"
        strokeWidth="0.7"
        opacity="0.5"
      />
      <circle
        cx="16"
        cy="16"
        r="10"
        fill="none"
        stroke="#E6AB2A"
        strokeWidth="0.4"
        opacity="0.35"
      />
      {/* N-S arms */}
      <path d="M 16,3 L 18,14 L 16,16 L 14,14 Z" fill="#E6AB2A" opacity="0.85" />
      <path d="M 16,29 L 14,18 L 16,16 L 18,18 Z" fill="#E6AB2A" opacity="0.45" />
      {/* E-W arms */}
      <path d="M 29,16 L 18,18 L 16,16 L 18,14 Z" fill="#E6AB2A" opacity="0.5" />
      <path d="M 3,16 L 14,14 L 16,16 L 14,18 Z" fill="#E6AB2A" opacity="0.5" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.3" fill="#F6E355" />
      {/* N label */}
      <text
        x="16"
        y="8"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontWeight="900"
        fontSize="5"
        fill="#F6E355"
      >
        N
      </text>
    </svg>
  );
}

// ═══ MAIN COMPONENT ═══
export function NavalEngagementGame({ onBack, onComplete }: NavalEngagementGameProps) {
  // Game state
  const [phase, setPhase] = useState<Phase>('deploy');
  const [difficulty, setDifficulty] = useState<Difficulty>('admiral');
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [shipOrientation, setShipOrientation] = useState<Orientation>('horizontal');
  const [player, setPlayer] = useState<Side>(() => ({
    ships: SHIP_TYPES.map(createShip),
    grid: makeGrid(),
    shots: makeShots(),
  }));
  const [enemy, setEnemy] = useState<Side>(() => ({
    ships: SHIP_TYPES.map(createShip),
    grid: makeGrid(),
    shots: makeShots(),
  }));
  const [turn, setTurn] = useState<Turn>('player');
  const [turnCount, setTurnCount] = useState(1);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [aiState, setAIState] = useState<AIState>({
    mode: 'hunt',
    targetQueue: [],
    hitStreak: [],
  });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(0);
  const [previewCells, setPreviewCells] = useState<{ x: number; y: number; valid: boolean }[]>([]);
  const [victory, setVictory] = useState<boolean | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Initialize with random placement
  useEffect(() => {
    const newPlayer: Side = {
      ships: SHIP_TYPES.map(createShip),
      grid: makeGrid(),
      shots: makeShots(),
    };
    randomPlace(newPlayer);
    setPlayer(newPlayer);
  }, []);

  // Placed count
  const placedCount = player.ships.filter((s) => s.positions.length > 0).length;

  // Add log entry
  const addLog = useCallback((html: string) => {
    setLogId((prev) => prev + 1);
    setLog((prev) => [{ id: logId + 1, html }, ...prev.slice(0, 19)]);
  }, [logId]);

  // Clear ships
  const handleClear = useCallback(() => {
    setPlayer((prev) => {
      const newShips = prev.ships.map((s) => ({ ...s, positions: [], hits: new Set<string>() }));
      return { ...prev, ships: newShips, grid: makeGrid() };
    });
    setSelectedShip(null);
  }, []);

  // Shuffle ships
  const handleShuffle = useCallback(() => {
    setPlayer((prev) => {
      const newSide: Side = {
        ships: SHIP_TYPES.map(createShip),
        grid: makeGrid(),
        shots: makeShots(),
      };
      randomPlace(newSide);
      return newSide;
    });
    setSelectedShip(null);
  }, []);

  // Rotate orientation
  const handleRotate = useCallback(() => {
    setShipOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
    setPreviewCells([]);
  }, []);

  // Preview placement
  const handleCellHover = useCallback(
    (x: number, y: number) => {
      if (!selectedShip) {
        setPreviewCells([]);
        return;
      }
      const s = selectedShip;
      const o = shipOrientation;
      const dx = o === 'horizontal' ? 1 : 0;
      const dy = o === 'vertical' ? 1 : 0;

      // Create test grid excluding current ship
      const testGrid = makeGrid();
      for (let yy = 0; yy < GRID_SIZE; yy++) {
        for (let xx = 0; xx < GRID_SIZE; xx++) {
          if (player.grid[yy][xx] && player.grid[yy][xx] !== s.id) {
            testGrid[yy][xx] = player.grid[yy][xx];
          }
        }
      }

      const valid = canPlace(testGrid, s, x, y, o);
      const cells: { x: number; y: number; valid: boolean }[] = [];
      for (let i = 0; i < s.size; i++) {
        const cx = x + dx * i;
        const cy = y + dy * i;
        if (inBounds(cx, cy)) {
          cells.push({ x: cx, y: cy, valid });
        }
      }
      setPreviewCells(cells);
    },
    [selectedShip, shipOrientation, player.grid]
  );

  // Clear preview on leave
  const handleCellLeave = useCallback(() => {
    setPreviewCells([]);
  }, []);

  // Try to place ship
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!selectedShip) return;

      setPlayer((prev) => {
        const newGrid = prev.grid.map((row) => [...row]);
        const newShips = prev.ships.map((s) => ({
          ...s,
          positions: [...s.positions],
          hits: new Set(s.hits),
        }));

        const ship = newShips.find((s) => s.id === selectedShip.id);
        if (!ship) return prev;

        // Remove if already placed
        if (ship.positions.length > 0) {
          removeShip(newGrid, ship);
        }

        // Check if can place
        if (!canPlace(newGrid, ship, x, y, shipOrientation)) {
          return prev;
        }

        // Place ship
        placeShip(newGrid, ship, x, y, shipOrientation);

        return { ...prev, ships: newShips, grid: newGrid };
      });

      // Select next unplaced ship
      const nextShip = player.ships.find(
        (s) => s.positions.length === 0 && s.id !== selectedShip.id
      );
      setSelectedShip(nextShip || null);
      setPreviewCells([]);
    },
    [selectedShip, shipOrientation, player.ships]
  );

  // Start battle
  const handleStartBattle = useCallback(() => {
    // Place enemy ships
    const newEnemy: Side = {
      ships: SHIP_TYPES.map(createShip),
      grid: makeGrid(),
      shots: makeShots(),
    };
    randomPlace(newEnemy);
    setEnemy(newEnemy);

    setPhase('battle');
    setTurn('player');
    setTurnCount(1);
    setShots(0);
    setHits(0);
    setAIState({ mode: 'hunt', targetQueue: [], hitStreak: [] });
    setLog([]);
    addLog(
      `<strong>Engagement begins.</strong> Opponent: <span class="text-red-400">${DIFF_NAMES[difficulty]}</span>. Good hunting.`
    );
  }, [difficulty, addLog]);

  // AI targeting logic
  const getUnexplored = useCallback((shots: CellState[][]) => {
    const c: Position[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!shots[y][x]) c.push({ x, y });
      }
    }
    return c;
  }, []);

  const aiEnsign = useCallback(
    (shots: CellState[]) => {
      const c = getUnexplored(player.shots);
      return c[Math.floor(Math.random() * c.length)];
    },
    [getUnexplored, player.shots]
  );

  const aiLieutenant = useCallback(
    (state: AIState, shots: CellState[][]) => {
      while (state.targetQueue.length > 0) {
        const t = state.targetQueue.shift()!;
        if (!shots[t.y][t.x]) return { x: t.x, y: t.y };
      }
      const c = getUnexplored(shots);
      return c[Math.floor(Math.random() * c.length)];
    },
    [getUnexplored]
  );

  const aiCommander = useCallback(
    (state: AIState, shots: CellState[][], ships: Ship[]) => {
      if (state.hitStreak.length >= 2) {
        const hs = state.hitStreak;
        const sameRow = hs.every((h) => h.y === hs[0].y);
        const sameCol = hs.every((h) => h.x === hs[0].x);
        if (sameRow) {
          const minX = Math.min(...hs.map((h) => h.x));
          const maxX = Math.max(...hs.map((h) => h.x));
          const y = hs[0].y;
          const cands: Position[] = [];
          if (inBounds(minX - 1, y) && !shots[y][minX - 1]) cands.push({ x: minX - 1, y });
          if (inBounds(maxX + 1, y) && !shots[y][maxX + 1]) cands.push({ x: maxX + 1, y });
          if (cands.length > 0) return cands[Math.floor(Math.random() * cands.length)];
        } else if (sameCol) {
          const minY = Math.min(...hs.map((h) => h.y));
          const maxY = Math.max(...hs.map((h) => h.y));
          const x = hs[0].x;
          const cands: Position[] = [];
          if (inBounds(x, minY - 1) && !shots[minY - 1][x]) cands.push({ x, y: minY - 1 });
          if (inBounds(x, maxY + 1) && !shots[maxY + 1][x]) cands.push({ x, y: maxY + 1 });
          if (cands.length > 0) return cands[Math.floor(Math.random() * cands.length)];
        }
      }
      while (state.targetQueue.length > 0) {
        const t = state.targetQueue.shift()!;
        if (!shots[t.y][t.x]) return { x: t.x, y: t.y };
      }
      const sizes = ships.filter((s) => !isShipSunk(s)).map((s) => s.size);
      const minSize = sizes.length > 0 ? Math.min(...sizes) : 2;
      const parity: Position[] = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (!shots[y][x] && (x + y) % minSize === 0) parity.push({ x, y });
        }
      }
      if (parity.length > 0) return parity[Math.floor(Math.random() * parity.length)];
      const c = getUnexplored(shots);
      return c[Math.floor(Math.random() * c.length)];
    },
    [getUnexplored]
  );

  const aiAdmiral = useCallback(
    (state: AIState, shots: CellState[][], ships: Ship[]) => {
      if (state.hitStreak.length >= 2) {
        const hs = state.hitStreak;
        const sameRow = hs.every((h) => h.y === hs[0].y);
        const sameCol = hs.every((h) => h.x === hs[0].x);
        if (sameRow) {
          const minX = Math.min(...hs.map((h) => h.x));
          const maxX = Math.max(...hs.map((h) => h.x));
          const y = hs[0].y;
          if (inBounds(minX - 1, y) && !shots[y][minX - 1]) return { x: minX - 1, y };
          if (inBounds(maxX + 1, y) && !shots[y][maxX + 1]) return { x: maxX + 1, y };
        } else if (sameCol) {
          const minY = Math.min(...hs.map((h) => h.y));
          const maxY = Math.max(...hs.map((h) => h.y));
          const x = hs[0].x;
          if (inBounds(x, minY - 1) && !shots[minY - 1][x]) return { x, y: minY - 1 };
          if (inBounds(x, maxY + 1) && !shots[maxY + 1][x]) return { x, y: maxY + 1 };
        }
      }

      // Probability density
      const density: number[][] = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        density[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) density[y][x] = 0;
      }

      const remaining = ships.filter((s) => !isShipSunk(s));
      for (const ship of remaining) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            // Horizontal
            if (x + ship.size <= GRID_SIZE) {
              let valid = true;
              let coversHit = false;
              for (let i = 0; i < ship.size; i++) {
                const cx = x + i;
                const shot = shots[y][cx];
                if (shot === 'miss') {
                  valid = false;
                  break;
                }
                if (shot === 'hit') {
                  const sunk = ships.find(
                    (s) => isShipSunk(s) && s.positions.some((p) => p.x === cx && p.y === y)
                  );
                  if (sunk) {
                    valid = false;
                    break;
                  }
                  coversHit = true;
                }
              }
              if (valid) {
                for (let i = 0; i < ship.size; i++) {
                  density[y][x + i] += 1 + (coversHit ? 50 : 0);
                }
              }
            }
            // Vertical
            if (y + ship.size <= GRID_SIZE) {
              let valid = true;
              let coversHit = false;
              for (let i = 0; i < ship.size; i++) {
                const cy = y + i;
                const shot = shots[cy][x];
                if (shot === 'miss') {
                  valid = false;
                  break;
                }
                if (shot === 'hit') {
                  const sunk = ships.find(
                    (s) => isShipSunk(s) && s.positions.some((p) => p.x === x && p.y === cy)
                  );
                  if (sunk) {
                    valid = false;
                    break;
                  }
                  coversHit = true;
                }
              }
              if (valid) {
                for (let i = 0; i < ship.size; i++) {
                  density[y + i][x] += 1 + (coversHit ? 50 : 0);
                }
              }
            }
          }
        }
      }

      let best: Position | null = null;
      let bs = -1;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          if (shots[y][x]) continue;
          if (density[y][x] > bs) {
            bs = density[y][x];
            best = { x, y };
          } else if (density[y][x] === bs && Math.random() < 0.3) {
            best = { x, y };
          }
        }
      }

      if (best) return best;
      const c = getUnexplored(shots);
      return c[Math.floor(Math.random() * c.length)];
    },
    [getUnexplored]
  );

  const pickAITarget = useCallback(
    (state: AIState, shots: CellState[][], ships: Ship[]) => {
      switch (difficulty) {
        case 'ensign':
          return aiEnsign(shots as any);
        case 'lieutenant':
          return aiLieutenant(state, shots);
        case 'commander':
          return aiCommander(state, shots, ships);
        case 'admiral':
        default:
          return aiAdmiral(state, shots, ships);
      }
    },
    [difficulty, aiEnsign, aiLieutenant, aiCommander, aiAdmiral]
  );

  // Queue adjacent cells for AI
  const queueAdjacents = useCallback((x: number, y: number, state: AIState, shots: CellState[][]) => {
    const newQueue = [...state.targetQueue];
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && !shots[ny][nx]) {
        const key = `${nx},${ny}`;
        if (!newQueue.some((t) => t.key === key)) {
          newQueue.push({ x: nx, y: ny, key });
        }
      }
    }
    return newQueue;
  }, []);

  // Player fires
  const handlePlayerFire = useCallback(
    (x: number, y: number) => {
      if (turn !== 'player' || phase !== 'battle') return;
      if (enemy.shots[y][x]) return;

      const shipId = enemy.grid[y][x];

      setEnemy((prev) => {
        const newShots = prev.shots.map((row) => [...row]);
        const newShips = prev.ships.map((s) => ({
          ...s,
          positions: [...s.positions],
          hits: new Set(s.hits),
        }));

        if (shipId) {
          newShots[y][x] = 'hit';
          const ship = newShips.find((s) => s.id === shipId);
          if (ship) {
            ship.hits.add(`${x},${y}`);
          }
        } else {
          newShots[y][x] = 'miss';
        }

        return { ...prev, shots: newShots, ships: newShips };
      });

      setShots((prev) => prev + 1);

      if (shipId) {
        setHits((prev) => prev + 1);
        const ship = enemy.ships.find((s) => s.id === shipId);
        if (ship) {
          const newHits = new Set(ship.hits);
          newHits.add(`${x},${y}`);
          const willSink = newHits.size >= ship.size;

          if (willSink) {
            addLog(
              `<span class="text-[var(--gold)]">You</span> sunk enemy <strong class="text-red-400">${ship.name}</strong> at <span class="font-mono bg-red-500/20 px-1 rounded">${LETTERS[y]}${x + 1}</span>.`
            );
            // Check victory
            const allSunk = enemy.ships.every((s) => {
              if (s.id === shipId) return newHits.size >= s.size;
              return isShipSunk(s);
            });
            if (allSunk) {
              setTimeout(() => {
                setPhase('results');
                setVictory(true);
              }, 800);
              return;
            }
          } else {
            addLog(
              `<span class="text-[var(--gold)]">You</span> hit enemy vessel at <span class="font-mono bg-red-500/20 px-1 rounded">${LETTERS[y]}${x + 1}</span>.`
            );
          }
        }
      } else {
        addLog(
          `<span class="text-[var(--gold)]">You</span> fired at <span class="font-mono bg-white/10 px-1 rounded">${LETTERS[y]}${x + 1}</span>. Miss.`
        );
      }

      setTurn('ai');
      setTurnCount((prev) => prev + 1);

      // AI fires after delay
      setTimeout(() => {
        aiFire();
      }, 800 + Math.random() * 600);
    },
    [turn, phase, enemy, addLog]
  );

  // AI fires
  const aiFire = useCallback(() => {
    const target = pickAITarget(aiState, player.shots, player.ships);
    if (!target) {
      setTurn('player');
      return;
    }

    const { x, y } = target;
    const shipId = player.grid[y][x];

    setPlayer((prev) => {
      const newShots = prev.shots.map((row) => [...row]);
      const newShips = prev.ships.map((s) => ({
        ...s,
        positions: [...s.positions],
        hits: new Set(s.hits),
      }));

      if (shipId) {
        newShots[y][x] = 'hit';
        const ship = newShips.find((s) => s.id === shipId);
        if (ship) {
          ship.hits.add(`${x},${y}`);
        }
      } else {
        newShots[y][x] = 'miss';
      }

      return { ...prev, shots: newShots, ships: newShips };
    });

    if (shipId) {
      const ship = player.ships.find((s) => s.id === shipId);
      if (ship) {
        const newHits = new Set(ship.hits);
        newHits.add(`${x},${y}`);
        const willSink = newHits.size >= ship.size;

        setAIState((prev) => {
          const newHitStreak = [...prev.hitStreak, { x, y, shipId }];
          if (willSink) {
            return {
              mode: 'hunt',
              targetQueue: [],
              hitStreak: newHitStreak.filter((h) => h.shipId !== shipId),
            };
          } else {
            return {
              mode: 'target',
              targetQueue: queueAdjacents(x, y, prev, player.shots),
              hitStreak: newHitStreak,
            };
          }
        });

        if (willSink) {
          addLog(
            `<span class="text-red-400">Enemy</span> sunk your <strong class="text-[var(--gold)]">${ship.name}</strong> at <span class="font-mono bg-red-500/20 px-1 rounded">${LETTERS[y]}${x + 1}</span>.`
          );
          // Check defeat
          const allSunk = player.ships.every((s) => {
            if (s.id === shipId) return newHits.size >= s.size;
            return isShipSunk(s);
          });
          if (allSunk) {
            setTimeout(() => {
              setPhase('results');
              setVictory(false);
            }, 800);
            return;
          }
        } else {
          addLog(
            `<span class="text-red-400">Enemy</span> hit your vessel at <span class="font-mono bg-red-500/20 px-1 rounded">${LETTERS[y]}${x + 1}</span>.`
          );
        }
      }
    } else {
      addLog(
        `<span class="text-red-400">Enemy</span> fired at <span class="font-mono bg-white/10 px-1 rounded">${LETTERS[y]}${x + 1}</span>. Miss.`
      );
    }

    setTurn('player');
    setTurnCount((prev) => prev + 1);
  }, [aiState, player, pickAITarget, queueAdjacents, addLog]);

  // Play again
  const handlePlayAgain = useCallback(() => {
    const newPlayer: Side = {
      ships: SHIP_TYPES.map(createShip),
      grid: makeGrid(),
      shots: makeShots(),
    };
    randomPlace(newPlayer);
    setPlayer(newPlayer);
    setEnemy({
      ships: SHIP_TYPES.map(createShip),
      grid: makeGrid(),
      shots: makeShots(),
    });
    setPhase('deploy');
    setSelectedShip(null);
    setVictory(null);
    setXpAwarded(false);
    setLog([]);
  }, []);

  // Award XP on victory
  useEffect(() => {
    if (victory === true && !xpAwarded) {
      setXpAwarded(true);
      onComplete(60);
    }
  }, [victory, xpAwarded, onComplete]);

  // Accuracy
  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  // ═══ RENDER ═══
  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--text)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--t3)] hover:text-[var(--gold)] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-mono text-xs uppercase tracking-wider">Arcade</span>
        </button>
        <div className="flex items-center gap-3">
          <Anchor size={20} className="text-[var(--gold)]" />
          <span className="font-serif italic text-lg">
            Naval <em className="text-[var(--gold)]">Engagement</em>
          </span>
        </div>
        {phase === 'deploy' && (
          <span className="font-mono text-xs text-[var(--red)] tracking-wider">
            {DIFF_NAMES[difficulty]}
          </span>
        )}
        {phase === 'battle' && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>
              Turn <em className="text-[var(--gold)] not-italic">{Math.ceil(turnCount / 2)}</em>
            </span>
            <span>
              Acc <em className="text-[var(--gold)] not-italic">{accuracy}%</em>
            </span>
          </div>
        )}
        {phase === 'results' && <div />}
      </div>

      {/* Deploy Phase */}
      {phase === 'deploy' && (
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Difficulty selector */}
          <div className="mb-6">
            <div className="font-mono text-xs text-[var(--red)] uppercase tracking-wider mb-3">
              Select Difficulty
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['ensign', 'lieutenant', 'commander', 'admiral'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    difficulty === d
                      ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                      : 'border-[var(--border)] hover:border-[var(--border-hi)]'
                  }`}
                >
                  <div className="font-bold text-sm uppercase tracking-wide">
                    {DIFF_NAMES[d]}
                  </div>
                  <div className="text-[10px] text-[var(--t3)] mt-1 line-clamp-2">
                    {DIFF_DESCRIPTIONS[d]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deploy main */}
          <div className="grid md:grid-cols-[250px_1fr] gap-6">
            {/* Ship roster */}
            <div className="order-2 md:order-1">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[var(--gold)] uppercase tracking-wider">
                  Your Fleet
                </span>
                <button
                  onClick={handleRotate}
                  className="flex md:hidden items-center gap-2 px-3 py-1.5 bg-[var(--ink)] border border-[var(--border-hi)] rounded text-xs font-mono text-[var(--gold)] uppercase"
                >
                  <RotateCcw size={12} />
                  {shipOrientation === 'horizontal' ? 'H' : 'V'}
                </button>
              </div>
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                {player.ships.map((ship) => (
                  <button
                    key={ship.id}
                    onClick={() => setSelectedShip(ship)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all min-w-[170px] md:min-w-0 ${
                      selectedShip?.id === ship.id
                        ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                        : ship.positions.length > 0
                        ? 'border-[var(--border)] opacity-60'
                        : 'border-[var(--border)] hover:border-[var(--border-hi)]'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="text-xs font-bold uppercase tracking-wide">{ship.name}</div>
                      <div className="text-[10px] text-[var(--t4)]">{ship.cls}</div>
                      <div className="flex gap-1 mt-1">
                        {Array(ship.size)
                          .fill(0)
                          .map((_, i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
                            />
                          ))}
                      </div>
                    </div>
                    {ship.positions.length > 0 && (
                      <span className="text-[var(--gold)]">
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                          <path
                            d="M4 12l6 6L20 6"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="order-1 md:order-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[var(--gold)] uppercase tracking-wider">
                  Your Waters
                </span>
                <span className="hidden md:flex items-center gap-2 text-[var(--t3)] text-xs">
                  <kbd className="px-1.5 py-0.5 bg-[var(--ink)] border border-[var(--border-hi)] rounded text-[var(--gold)] font-mono">
                    R
                  </kbd>
                  Rotate
                </span>
              </div>
              <div
                className="inline-grid p-2 bg-gradient-to-br from-[#08182a] to-[#102236] border border-[var(--gold)]/25 rounded-lg"
                style={{
                  gridTemplateColumns: `22px repeat(${GRID_SIZE}, minmax(28px, 36px))`,
                  gridTemplateRows: `22px repeat(${GRID_SIZE}, minmax(28px, 36px))`,
                  gap: '1px',
                }}
              >
                {/* Compass corner */}
                <div className="flex items-center justify-center bg-[#13263a]/50">
                  <div className="w-4 h-4 opacity-70">
                    <CompassRose />
                  </div>
                </div>
                {/* Column headers */}
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, x) => (
                    <div
                      key={x}
                      className="flex items-center justify-center font-mono text-xs text-[var(--gold)] bg-[#13263a]/45"
                    >
                      {x + 1}
                    </div>
                  ))}
                {/* Rows */}
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, y) => (
                    <>
                      {/* Row label */}
                      <div
                        key={`label-${y}`}
                        className="flex items-center justify-center font-mono text-xs text-[var(--gold)] bg-[#13263a]/45"
                      >
                        {LETTERS[y]}
                      </div>
                      {/* Cells */}
                      {Array(GRID_SIZE)
                        .fill(0)
                        .map((_, x) => {
                          const ship = player.ships.find((s) => shipHasPos(s, x, y));
                          const isPreview = previewCells.some((p) => p.x === x && p.y === y);
                          const previewValid = previewCells.find(
                            (p) => p.x === x && p.y === y
                          )?.valid;

                          return (
                            <div
                              key={`${x}-${y}`}
                              onClick={() => handleCellClick(x, y)}
                              onMouseEnter={() => handleCellHover(x, y)}
                              onMouseLeave={handleCellLeave}
                              className={`relative cursor-pointer transition-all ${
                                ship
                                  ? 'bg-[#2a4050] border border-[var(--gold)]/30'
                                  : 'bg-[#13263a] border border-[var(--gold)]/10 hover:bg-[#1a344a]'
                              } ${
                                isPreview
                                  ? previewValid
                                    ? 'bg-[var(--gold)]/40 border-[var(--gold)]'
                                    : 'bg-red-500/40 border-red-500'
                                  : ''
                              }`}
                            >
                              {ship && (
                                <div className="absolute inset-[2px] bg-gradient-to-b from-[#3e5868] via-[#2a4050] to-[#142230] rounded-sm" />
                              )}
                            </div>
                          );
                        })}
                    </>
                  ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed border-[var(--div)]">
            <span className="font-mono text-sm">
              <em className="text-[var(--gold)] not-italic text-lg">{placedCount}</em>/5 Deployed
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] border border-[var(--border-hi)] rounded text-sm font-bold uppercase tracking-wider text-[var(--gold)] hover:border-[var(--gold)] transition-colors"
              >
                <X size={14} />
                Clear
              </button>
              <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--ink)] border border-[var(--border-hi)] rounded text-sm font-bold uppercase tracking-wider text-[var(--gold)] hover:border-[var(--gold)] transition-colors"
              >
                <Shuffle size={14} />
                Shuffle
              </button>
              <button
                onClick={handleStartBattle}
                disabled={placedCount < 5}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-b from-[var(--gold-br)] via-[var(--gold)] to-[var(--gold-dp)] rounded text-sm font-bold uppercase tracking-wider text-[#1a0b02] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Set Sail
                <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Phase */}
      {phase === 'battle' && (
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Turn indicator */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                turn === 'player'
                  ? 'border-[var(--gold)]/30 bg-[var(--gold)]/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  turn === 'player' ? 'bg-[var(--gold)]' : 'bg-red-500'
                }`}
              />
              <span className="font-bold uppercase tracking-wider">
                {turn === 'player' ? 'Your Turn' : `${DIFF_NAMES[difficulty]}'s Turn`}
              </span>
            </div>
            <div className="flex gap-4 font-mono text-xs text-[var(--t3)]">
              <span>
                Shots <em className="text-[var(--gold)] not-italic">{shots}</em>
              </span>
              <span>
                Hits <em className="text-[var(--gold)] not-italic">{hits}</em>
              </span>
            </div>
          </div>

          {/* Battle grids */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Enemy grid */}
            <div className="order-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase tracking-wider">
                  Enemy <em className="text-red-400">Waters</em>
                </span>
                <span className="text-xs text-[var(--t4)] font-mono">Fire at will</span>
              </div>
              <div
                className="inline-grid p-2 bg-gradient-to-br from-[#08182a] to-[#102236] border border-[var(--gold)]/25 rounded-lg"
                style={{
                  gridTemplateColumns: `22px repeat(${GRID_SIZE}, minmax(28px, 36px))`,
                  gridTemplateRows: `22px repeat(${GRID_SIZE}, minmax(28px, 36px))`,
                  gap: '1px',
                }}
              >
                <div className="flex items-center justify-center bg-[#13263a]/50">
                  <div className="w-4 h-4 opacity-70">
                    <CompassRose />
                  </div>
                </div>
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, x) => (
                    <div
                      key={x}
                      className="flex items-center justify-center font-mono text-xs text-[var(--gold)] bg-[#13263a]/45"
                    >
                      {x + 1}
                    </div>
                  ))}
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, y) => (
                    <>
                      <div
                        key={`label-${y}`}
                        className="flex items-center justify-center font-mono text-xs text-[var(--gold)] bg-[#13263a]/45"
                      >
                        {LETTERS[y]}
                      </div>
                      {Array(GRID_SIZE)
                        .fill(0)
                        .map((_, x) => {
                          const shot = enemy.shots[y][x];
                          const ship = enemy.ships.find((s) => shipHasPos(s, x, y));
                          const isSunk = ship && isShipSunk(ship);

                          return (
                            <div
                              key={`${x}-${y}`}
                              onClick={() => handlePlayerFire(x, y)}
                              className={`relative transition-all ${
                                shot
                                  ? 'cursor-default'
                                  : turn === 'player'
                                  ? 'cursor-crosshair hover:bg-[#1a344a]'
                                  : 'cursor-not-allowed'
                              } ${
                                isSunk
                                  ? 'bg-gradient-to-br from-[#3a0808] to-[#1a0404] border border-red-900'
                                  : shot === 'hit'
                                  ? 'bg-gradient-to-br from-[#6a1818] to-[#2a0808] border border-red-800'
                                  : shot === 'miss'
                                  ? 'bg-[#0e1e30] border border-[var(--gold)]/10'
                                  : 'bg-[#13263a] border border-[var(--gold)]/10'
                              }`}
                            >
                              {shot === 'miss' && (
                                <div className="absolute inset-2 rounded-full border border-white/50 bg-white/10" />
                              )}
                              {shot === 'hit' && !isSunk && (
                                <div className="absolute inset-1 rounded-full bg-gradient-radial from-yellow-500 via-orange-600 to-red-900" />
                              )}
                              {isSunk && (
                                <div className="absolute inset-1 bg-[repeating-linear-gradient(45deg,rgba(205,14,20,0.4)_0_3px,transparent_3px_6px)]" />
                              )}
                            </div>
                          );
                        })}
                    </>
                  ))}
              </div>
              {/* Enemy fleet health */}
              <div className="mt-3 p-2 bg-[var(--ink)] border border-[var(--div)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--t4)] uppercase tracking-wider mb-2">
                  Enemy Fleet
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {enemy.ships.map((ship) => (
                    <div
                      key={ship.id}
                      className={`flex items-center gap-2 px-2 py-1 bg-[var(--void)]/50 border border-[var(--div)] rounded text-xs ${
                        isShipSunk(ship) ? 'opacity-40' : ''
                      }`}
                    >
                      <span
                        className={`font-mono ${
                          isShipSunk(ship) ? 'line-through text-red-400' : 'text-[var(--t2)]'
                        }`}
                      >
                        {ship.id === 'patrol' ? 'PT' : ship.id.slice(0, 3).toUpperCase()}
                      </span>
                      <div className="flex gap-0.5">
                        {Array(ship.size)
                          .fill(0)
                          .map((_, i) => {
                            const pos = ship.positions[i];
                            const isHit = pos && ship.hits.has(`${pos.x},${pos.y}`);
                            return (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHit ? 'bg-red-500' : 'bg-[var(--gold)]'
                                }`}
                              />
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Player grid */}
            <div className="order-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold uppercase tracking-wider">
                  Your <em className="text-[var(--gold)]">Fleet</em>
                </span>
                <span className="text-xs text-[var(--t4)] font-mono">Defensive chart</span>
              </div>
              <div
                className="inline-grid p-2 bg-gradient-to-br from-[#08182a] to-[#102236] border border-[var(--gold)]/25 rounded-lg"
                style={{
                  gridTemplateColumns: `18px repeat(${GRID_SIZE}, minmax(22px, 28px))`,
                  gridTemplateRows: `18px repeat(${GRID_SIZE}, minmax(22px, 28px))`,
                  gap: '1px',
                }}
              >
                <div className="flex items-center justify-center bg-[#13263a]/50">
                  <div className="w-3 h-3 opacity-70">
                    <CompassRose />
                  </div>
                </div>
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, x) => (
                    <div
                      key={x}
                      className="flex items-center justify-center font-mono text-[10px] text-[var(--gold)] bg-[#13263a]/45"
                    >
                      {x + 1}
                    </div>
                  ))}
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_, y) => (
                    <>
                      <div
                        key={`label-${y}`}
                        className="flex items-center justify-center font-mono text-[10px] text-[var(--gold)] bg-[#13263a]/45"
                      >
                        {LETTERS[y]}
                      </div>
                      {Array(GRID_SIZE)
                        .fill(0)
                        .map((_, x) => {
                          const ship = player.ships.find((s) => shipHasPos(s, x, y));
                          const shot = player.shots[y][x];
                          const isSunk = ship && isShipSunk(ship);

                          return (
                            <div
                              key={`${x}-${y}`}
                              className={`relative ${
                                isSunk
                                  ? 'bg-gradient-to-br from-[#3a0808] to-[#1a0404] border border-red-900'
                                  : shot === 'hit'
                                  ? 'bg-gradient-to-br from-[#6a1818] to-[#2a0808] border border-red-800'
                                  : shot === 'miss'
                                  ? 'bg-[#0e1e30] border border-[var(--gold)]/10'
                                  : ship
                                  ? 'bg-[#2a4050] border border-[var(--gold)]/30'
                                  : 'bg-[#13263a] border border-[var(--gold)]/10'
                              }`}
                            >
                              {ship && !shot && (
                                <div className="absolute inset-[1px] bg-gradient-to-b from-[#3e5868] via-[#2a4050] to-[#142230] rounded-sm" />
                              )}
                              {shot === 'miss' && (
                                <div className="absolute inset-1 rounded-full border border-white/50 bg-white/10" />
                              )}
                              {shot === 'hit' && !isSunk && (
                                <div className="absolute inset-0.5 rounded-full bg-gradient-radial from-yellow-500 via-orange-600 to-red-900" />
                              )}
                              {isSunk && (
                                <div className="absolute inset-0.5 bg-[repeating-linear-gradient(45deg,rgba(205,14,20,0.4)_0_3px,transparent_3px_6px)]" />
                              )}
                            </div>
                          );
                        })}
                    </>
                  ))}
              </div>
              {/* Player fleet health */}
              <div className="mt-3 p-2 bg-[var(--ink)] border border-[var(--div)] rounded-lg">
                <div className="text-[10px] font-mono text-[var(--t4)] uppercase tracking-wider mb-2">
                  Task Force 58
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {player.ships.map((ship) => (
                    <div
                      key={ship.id}
                      className={`flex items-center gap-2 px-2 py-1 bg-[var(--void)]/50 border border-[var(--div)] rounded text-xs ${
                        isShipSunk(ship) ? 'opacity-40' : ''
                      }`}
                    >
                      <span
                        className={`font-mono ${
                          isShipSunk(ship) ? 'line-through text-red-400' : 'text-[var(--t2)]'
                        }`}
                      >
                        {ship.id === 'patrol' ? 'PT' : ship.id.slice(0, 3).toUpperCase()}
                      </span>
                      <div className="flex gap-0.5">
                        {Array(ship.size)
                          .fill(0)
                          .map((_, i) => {
                            const pos = ship.positions[i];
                            const isHit = pos && ship.hits.has(`${pos.x},${pos.y}`);
                            return (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHit ? 'bg-red-500' : 'bg-[var(--gold)]'
                                }`}
                              />
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Battle log */}
          <div className="mt-4 p-3 bg-gradient-to-br from-[#f2e4bd] to-[#d6b478] rounded-lg max-h-32 overflow-y-auto">
            <div className="text-[10px] font-mono text-[#9c1c1f] uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-[8px]">&#9670;</span>
              Battle Dispatches
            </div>
            <div className="space-y-1 font-['Special_Elite',serif] text-sm text-[#3a1e0a]">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="animate-in slide-in-from-bottom-1"
                  dangerouslySetInnerHTML={{ __html: entry.html }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div
            className={`px-8 py-4 border-[3px] border-double font-bold text-3xl md:text-4xl uppercase italic tracking-wider animate-in zoom-in-90 ${
              victory
                ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-br)]'
                : 'border-red-500 bg-red-500/10 text-red-400'
            }`}
          >
            {victory ? 'Victory' : 'Defeated'}
          </div>

          <p className="mt-6 font-serif italic text-lg text-[var(--parch-1)] max-w-md">
            {victory
              ? 'All enemy ships confirmed sunk. The Pacific is yours.'
              : 'Task Force 58 overwhelmed. The enemy held the line.'}
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--ink)] border border-[var(--gold)]/30 rounded-lg">
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
                Turns
              </div>
              <div className="text-2xl font-serif italic text-[var(--gold)]">
                {Math.ceil(turnCount / 2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
                Shots
              </div>
              <div className="text-2xl font-serif italic text-[var(--gold)]">{shots}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
                Accuracy
              </div>
              <div className="text-2xl font-serif italic text-[var(--gold)]">{accuracy}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
                Opponent
              </div>
              <div className="text-lg font-serif italic text-[var(--gold)]">
                {DIFF_NAMES[difficulty]}
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayAgain}
            className="mt-8 flex items-center gap-2 px-8 py-3 bg-gradient-to-b from-[var(--gold-br)] via-[var(--gold)] to-[var(--gold-dp)] rounded text-sm font-bold uppercase tracking-wider text-[#1a0b02]"
          >
            New Engagement
            <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
      )}

      {/* Keyboard handler for R key */}
      {phase === 'deploy' && (
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.code === 'KeyR') {
              handleRotate();
            }
          }}
          className="sr-only"
        />
      )}
    </div>
  );
}
