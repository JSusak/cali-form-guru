import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return "hsl(var(--score-red))";
    if (s < 70) return "hsl(var(--score-yellow))";
    return "hsl(var(--score-green))";
  };

  const getLabel = (s: number) => {
    if (s < 40) return "Needs Work";
    if (s < 70) return "Getting There";
    if (s < 90) return "Great Form";
    return "Perfect!";
  };

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={8}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-display font-bold"
          style={{ color: getColor(score) }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{getLabel(score)}</span>
    </div>
  );
}
