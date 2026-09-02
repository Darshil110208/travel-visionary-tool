import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Prefs, TripInput } from "@/lib/travel";
import { CATEGORY_LABELS } from "@/lib/travel";
import { Compass, Leaf, Loader2, Sparkles } from "lucide-react";

const STYLES: { id: TripInput["style"]; label: string; hint: string }[] = [
  { id: "relaxed", label: "Relaxed", hint: "2 stops / day" },
  { id: "balanced", label: "Balanced", hint: "3 stops / day" },
  { id: "packed", label: "Packed", hint: "4 stops / day" },
  { id: "luxury", label: "Luxury", hint: "Premium picks" },
];

type Props = {
  value: TripInput;
  onChange: (v: TripInput) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function TripForm({ value, onChange, onSubmit, loading }: Props) {
  const set = <K extends keyof TripInput>(k: K, v: TripInput[K]) =>
    onChange({ ...value, [k]: v });
  const setPref = (k: Category, v: number) =>
    onChange({ ...value, prefs: { ...value.prefs, [k]: v } as Prefs });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="surface p-6 md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="destination" className="text-xs uppercase tracking-widest text-muted-foreground">
            Destination
          </Label>
          <Input
            id="destination"
            value={value.destination}
            onChange={(e) => set("destination", e.target.value)}
            placeholder="Lisbon, Portugal"
            className="mt-2 h-12 text-lg"
            required
          />
        </div>

        <div>
          <Label htmlFor="start" className="text-xs uppercase tracking-widest text-muted-foreground">
            Start date
          </Label>
          <Input
            id="start"
            type="date"
            value={value.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label htmlFor="days" className="text-xs uppercase tracking-widest text-muted-foreground">
            Number of days
          </Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={14}
            value={value.days}
            onChange={(e) => set("days", Math.max(1, Math.min(14, Number(e.target.value))))}
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label htmlFor="budget" className="text-xs uppercase tracking-widest text-muted-foreground">
            Total budget (€)
          </Label>
          <Input
            id="budget"
            type="number"
            min={100}
            step={50}
            value={value.budget}
            onChange={(e) => set("budget", Number(e.target.value))}
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label htmlFor="travellers" className="text-xs uppercase tracking-widest text-muted-foreground">
            Travellers
          </Label>
          <Input
            id="travellers"
            type="number"
            min={1}
            max={12}
            value={value.travellers}
            onChange={(e) => set("travellers", Math.max(1, Number(e.target.value)))}
            className="mt-2 h-11"
          />
        </div>

        <div className="md:col-span-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Travel style</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STYLES.map((s) => {
              const active = value.style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => set("style", s.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/8 shadow-[var(--shadow-soft)]"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Interest preferences
          </span>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {(Object.keys(value.prefs) as Category[]).map((c) => (
              <div key={c}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">{CATEGORY_LABELS[c]}</span>
                  <span className="text-xs font-semibold text-primary">{value.prefs[c]}/10</span>
                </div>
                <Slider
                  value={[value.prefs[c]]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([v]) => setPref(c, v ?? 0)}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">Max daily travel time</span>
            <span className="text-xs font-semibold text-primary">
              {value.maxDailyTravelMinutes} min
            </span>
          </div>
          <Slider
            value={[value.maxDailyTravelMinutes]}
            min={30}
            max={300}
            step={15}
            onValueChange={([v]) => set("maxDailyTravelMinutes", v ?? 120)}
          />
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Leaf className="h-3.5 w-3.5 text-primary" /> Sustainability priority
            </span>
            <span className="text-xs font-semibold text-primary">{value.sustainability}/10</span>
          </div>
          <Slider
            value={[value.sustainability]}
            min={0}
            max={10}
            step={1}
            onValueChange={([v]) => set("sustainability", v ?? 5)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="deep-panel mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold tracking-wide transition-transform hover:-translate-y-0.5 disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Optimizing…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" /> Optimize My Trip
          </>
        )}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Compass className="h-3.5 w-3.5" /> Routes, budgets and carbon impact solved together
      </p>
    </form>
  );
}
