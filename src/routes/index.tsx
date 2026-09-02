import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import heroImg from "@/assets/hero-coast.jpg";
import { TripForm } from "@/components/travel/TripForm";
import { Optimizing } from "@/components/travel/Optimizing";
import { Results } from "@/components/travel/Results";
import { optimizeTrip, type TripInput, type TripPlan } from "@/lib/travel";
import { Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TravelOpt — Optimized Trip Planner & Itinerary Builder" },
      {
        name: "description",
        content:
          "TravelOpt builds budget-aware, sustainable, preference-optimized travel itineraries with routes, hotels, restaurants and day-by-day plans.",
      },
      { property: "og:title", content: "TravelOpt — Optimized Trip Planner" },
      {
        property: "og:description",
        content:
          "Enter your destination, budget and preferences and get an optimized day-by-day itinerary with scores, maps and stays.",
      },
    ],
  }),
  component: Index,
});

const DEFAULTS: TripInput = {
  destination: "Lisbon, Portugal",
  startDate: "",
  days: 5,
  budget: 2400,
  travellers: 2,
  style: "balanced",
  prefs: { nature: 7, history: 8, adventure: 5, food: 9, beach: 6, nightlife: 4 },
  maxDailyTravelMinutes: 120,
  sustainability: 7,
};

function Index() {
  const [input, setInput] = useState<TripInput>(DEFAULTS);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const saltRef = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const run = (salt: number) => {
    setLoading(true);
    setPlan(null);
    window.setTimeout(() => {
      setPlan(optimizeTrip(input, salt));
      setLoading(false);
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    }, 2100);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Coastal town at golden hour seen from above"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(160deg,oklch(0.22_0.05_210/0.88),oklch(0.3_0.06_200/0.6))]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-10">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Globe2 className="h-5 w-5" />
            <span className="font-display text-xl tracking-wide">TravelOpt</span>
          </div>
          <div className="mt-20 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-foreground/70">
              Optimization engine for real trips
            </p>
            <h1 className="mt-4 text-5xl leading-[1.05] text-primary-foreground md:text-7xl">
              Plan the trip that fits your{" "}
              <span className="text-gradient-sun">budget, taste and time</span>.
            </h1>
            <p className="mt-5 max-w-xl text-primary-foreground/80">
              Set your preferences once. TravelOpt scores every attraction, solves the route,
              respects your daily travel limit and returns a full day-by-day plan.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="-mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
          <TripForm value={input} onChange={setInput} onSubmit={() => run(++saltRef.current)} loading={loading} />
        </div>

        <div ref={resultsRef} className="mt-12 scroll-mt-6">
          {loading ? <Optimizing /> : null}
          {plan && !loading ? (
            <Results plan={plan} onReoptimize={() => run(++saltRef.current)} />
          ) : null}
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        TravelOpt · itineraries optimized for cost, preference fit and carbon impact
      </footer>
    </main>
  );
}
