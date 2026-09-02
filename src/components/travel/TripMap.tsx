import type { DayPlan } from "@/lib/travel";

const DAY_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-2)",
  "var(--color-chart-5)",
];

export function TripMap({ days, destination }: { days: DayPlan[]; destination: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[oklch(0.95_0.02_195)]">
      <svg viewBox="0 0 100 70" className="h-[380px] w-full" role="img" aria-label={`Route map of ${destination}`}>
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M5 0 L0 0 0 5" fill="none" stroke="oklch(0.88 0.02 195)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="70" fill="oklch(0.965 0.015 100)" />
        <rect width="100" height="70" fill="url(#grid)" />
        <path
          d="M0 52 C 18 46, 30 58, 46 54 S 78 62, 100 50 L100 70 L0 70 Z"
          fill="oklch(0.86 0.06 195)"
          opacity="0.85"
        />
        <path d="M-2 20 C 20 24, 30 12, 52 18 S 84 12, 102 22" fill="none" stroke="oklch(0.85 0.05 150)" strokeWidth="6" opacity="0.5" />
        <path d="M8 2 L14 68" stroke="oklch(0.9 0.01 100)" strokeWidth="1.4" />
        <path d="M62 0 L58 70" stroke="oklch(0.9 0.01 100)" strokeWidth="1.4" />
        <path d="M0 34 L100 30" stroke="oklch(0.9 0.01 100)" strokeWidth="1.4" />

        {days.map((d, di) => {
          const pts = d.items.map((a) => `${a.x},${a.y * 0.7 + 2}`).join(" ");
          if (d.items.length < 2) return null;
          return (
            <polyline
              key={d.day}
              points={pts}
              fill="none"
              stroke={DAY_COLORS[di % DAY_COLORS.length]}
              strokeWidth="0.7"
              strokeDasharray="2 1.6"
              strokeLinecap="round"
              opacity="0.9"
            />
          );
        })}

        {days.flatMap((d, di) =>
          d.items.map((a, i) => (
            <g key={a.id}>
              <circle
                cx={a.x}
                cy={a.y * 0.7 + 2}
                r="2.4"
                fill={DAY_COLORS[di % DAY_COLORS.length]}
                stroke="white"
                strokeWidth="0.6"
              />
              <text
                x={a.x}
                y={a.y * 0.7 + 2.9}
                textAnchor="middle"
                fontSize="2.3"
                fill="white"
                fontWeight="700"
              >
                {i + 1}
              </text>
            </g>
          )),
        )}
      </svg>
      <div className="flex flex-wrap gap-3 border-t border-border bg-card px-4 py-3">
        {days.map((d, di) => (
          <span key={d.day} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: DAY_COLORS[di % DAY_COLORS.length] }}
            />
            Day {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
