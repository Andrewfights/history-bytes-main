import { motion } from 'framer-motion';
import { NodeState } from './MapNode';

interface Point {
  x: number;
  y: number;
}

interface PathConnectorProps {
  from: Point;
  to: Point;
  fromState: NodeState;
  toState: NodeState;
  index: number;
  containerWidth: number;
}

export function PathConnector({
  from,
  to,
  fromState,
  toState,
  index,
  containerWidth,
}: PathConnectorProps) {
  // Convert percentage x positions to pixel values
  const fromX = (from.x / 100) * containerWidth;
  const toX = (to.x / 100) * containerWidth;
  const fromY = from.y + 28; // Add half node height to start from bottom of node
  const toY = to.y - 10; // Subtract to end at top of next node

  // Generate curved path
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  // Determine path style based on states
  const isCompleted = fromState === 'completed';
  const isLocked = toState === 'locked';
  const isCurrent = toState === 'current';

  // Path length for animation
  const pathLength = Math.sqrt(
    Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)
  ) * 1.5; // Approximation for curve

  return (
    <motion.path
      d={path}
      fill="none"
      strokeWidth={4}
      strokeLinecap="round"
      className={
        isCompleted
          ? 'stroke-success'
          : isCurrent
          ? 'stroke-primary'
          : isLocked
          ? 'stroke-muted-foreground/30'
          : 'stroke-primary/50'
      }
      strokeDasharray={isLocked ? '8 8' : 'none'}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.5, delay: index * 0.1 },
        opacity: { duration: 0.2, delay: index * 0.1 },
      }}
    />
  );
}

// Full SVG container for all paths
interface PathLayerProps {
  positions: Point[];
  states: NodeState[];
  containerWidth: number;
  containerHeight: number;
}

export function PathLayer({
  positions,
  states,
  containerWidth,
  containerHeight,
}: PathLayerProps) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Gradient for completed to current transition */}
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--success))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
      </defs>

      {positions.slice(0, -1).map((from, index) => (
        <PathConnector
          key={index}
          from={from}
          to={positions[index + 1]}
          fromState={states[index]}
          toState={states[index + 1]}
          index={index}
          containerWidth={containerWidth}
        />
      ))}
    </svg>
  );
}
