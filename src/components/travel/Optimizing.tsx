import { useEffect, useState } from "react";

const STEPS = [
  "Mapping candidate attractions",
  "Scoring against your preferences",
  "Solving the daily route",
  "Balancing budget and carbon",
  "Assembling your itinerary",
];

export function Optimizing() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 420);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="surface p-10">
      <div className="mx-auto max-w-md">
        <div className="relative mx-auto h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-primary/50 [animation:spin_5s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center font-display text-2xl text-primary">
            ✈
          </div>
        </div>
        <h3 className="mt-8 text-center text-2xl">Optimizing your trip</h3>
        <ul className="mt-6 space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                i <= step ? "text-foreground opacity-100" : "text-muted-foreground opacity-40"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${i < step ? "bg-primary" : i === step ? "animate-pulse bg-accent" : "bg-border"}`}
              />
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-8 h-1 overflow-hidden rounded-full bg-muted">
          <div className="sweep-line h-full w-1/3 rounded-full bg-[var(--gradient-deep)]" />
        </div>
      </div>
    </div>
  );
}
