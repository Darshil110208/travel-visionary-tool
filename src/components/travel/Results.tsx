import type { TripPlan } from "@/lib/travel";
import { CATEGORY_LABELS } from "@/lib/travel";
import { TripMap } from "./TripMap";
import {
  BedDouble,
  Clock,
  Info,
  Leaf,
  MapPin,
  RefreshCw,
  Route,
  Star,
  Target,
  Utensils,
  Wallet,
} from "lucide-react";

function Metric({
  label,
  value,
  sub,
  icon,
  tone = "default",
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "default" | "deep" | "warn";
  delay?: number;
}) {
  return (
    <div
      className={`rise surface p-5 ${tone === "deep" ? "deep-panel border-transparent" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70">
        {icon}
        {label}
      </div>
      <div
        className={`mt-2 font-display text-3xl ${
          tone === "warn" ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs opacity-70">{sub}</div> : null}
    </div>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const c = 2 * Math.PI * 34;
  return (
    <div className="surface rise flex items-center gap-4 p-5">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-muted)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="font-display text-3xl text-foreground">{score}%</div>
      </div>
    </div>
  );
}

export function Results({ plan, onReoptimize }: { plan: TripPlan; onReoptimize: () => void }) {
  const over = plan.budgetRemaining < 0;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl">{plan.input.destination}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.input.days} days · {plan.input.travellers} travellers · {plan.input.style} pace ·{" "}
            {plan.attractions.length} attractions selected
          </p>
        </div>
        <button
          onClick={onReoptimize}
          className="flex items-center gap-2 rounded-xl border border-primary/30 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/8"
        >
          <RefreshCw className="h-4 w-4" /> Re-optimize
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total estimated cost"
          value={`€${plan.totalCost.toLocaleString()}`}
          sub={`≈ €${Math.round(plan.totalCost / plan.input.travellers).toLocaleString()} per traveller`}
          icon={<Wallet className="h-3.5 w-3.5" />}
          tone="deep"
        />
        <Metric
          label="Budget remaining"
          value={`${over ? "-" : ""}€${Math.abs(plan.budgetRemaining).toLocaleString()}`}
          sub={over ? "Over budget — try a relaxed pace" : "Buffer for spontaneity"}
          icon={<Target className="h-3.5 w-3.5" />}
          tone={over ? "warn" : "default"}
          delay={60}
        />
        <Metric
          label="Total travel distance"
          value={`${plan.totalDistanceKm} km`}
          sub={`Cap ${plan.input.maxDailyTravelMinutes} min/day`}
          icon={<Route className="h-3.5 w-3.5" />}
          delay={120}
        />
        <Metric
          label="Attractions selected"
          value={String(plan.attractions.length)}
          sub={`Across ${plan.days.length} days`}
          icon={<MapPin className="h-3.5 w-3.5" />}
          delay={180}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreRing score={plan.preferenceScore} label="Preference satisfaction" />
        <ScoreRing score={plan.sustainabilityScore} label="Sustainability score" />
      </div>

      <section className="surface p-6">
        <h3 className="mb-4 text-2xl">Optimized route map</h3>
        <TripMap days={plan.days} destination={plan.input.destination} />
      </section>

      <section>
        <h3 className="mb-4 text-2xl">Day-by-day itinerary</h3>
        <div className="space-y-4">
          {plan.days.map((d, i) => (
            <div key={d.day} className="rise surface p-6" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl text-primary">Day {d.day}</span>
                  <span className="text-sm text-muted-foreground">{d.date}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {d.travelMinutes} min travel
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> €{d.cost}
                  </span>
                </div>
              </div>
              <ol className="mt-4 space-y-4">
                {d.items.map((a, idx) => (
                  <li key={a.id} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{a.name}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {CATEGORY_LABELS[a.category]}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Star className="h-3 w-3 fill-accent text-accent" /> {a.rating}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {a.durationHours}h · €{a.cost} · {a.co2} kg CO₂e
                        </span>
                      </div>
                      <p className="mt-1 flex gap-1.5 text-sm text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>
                          <span className="font-medium text-foreground">Why selected: </span>
                          {a.reason}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h3 className="mb-4 flex items-center gap-2 text-2xl">
            <BedDouble className="h-5 w-5 text-primary" /> Recommended hotels
          </h3>
          <ul className="space-y-3">
            {plan.hotels.map((h) => (
              <li key={h.name} className="rounded-xl border border-border p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-foreground">{h.name}</span>
                  <span className="text-sm font-semibold text-primary">€{h.nightly}/night</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {h.area} · {h.rating} ★ · {h.tags.join(" · ")}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                  <Leaf className="h-3.5 w-3.5" /> {h.ecoLabel}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-6">
          <h3 className="mb-4 flex items-center gap-2 text-2xl">
            <Utensils className="h-5 w-5 text-primary" /> Where to eat
          </h3>
          <ul className="space-y-3">
            {plan.restaurants.map((r) => (
              <li key={r.name} className="rounded-xl border border-border p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <span className="text-sm text-muted-foreground">{r.priceLevel}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.cuisine} · {r.rating} ★ · near {r.near}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
