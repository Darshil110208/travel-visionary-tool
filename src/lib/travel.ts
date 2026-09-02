export type Prefs = {
  nature: number;
  history: number;
  adventure: number;
  food: number;
  beach: number;
  nightlife: number;
};

export type TripInput = {
  destination: string;
  startDate: string;
  days: number;
  budget: number;
  travellers: number;
  style: "relaxed" | "balanced" | "packed" | "luxury";
  prefs: Prefs;
  maxDailyTravelMinutes: number;
  sustainability: number;
};

export type Category = keyof Prefs;

export type Attraction = {
  id: string;
  name: string;
  category: Category;
  cost: number;
  durationHours: number;
  rating: number;
  co2: number;
  x: number;
  y: number;
  reason: string;
  score: number;
};

export type DayPlan = {
  day: number;
  date: string;
  items: Attraction[];
  travelMinutes: number;
  cost: number;
};

export type Hotel = {
  name: string;
  area: string;
  nightly: number;
  rating: number;
  ecoLabel: string;
  tags: string[];
};

export type Restaurant = {
  name: string;
  cuisine: string;
  priceLevel: string;
  rating: number;
  near: string;
};

export type TripPlan = {
  input: TripInput;
  attractions: Attraction[];
  days: DayPlan[];
  totalCost: number;
  budgetRemaining: number;
  preferenceScore: number;
  sustainabilityScore: number;
  totalDistanceKm: number;
  hotels: Hotel[];
  restaurants: Restaurant[];
};

const CATEGORY_LABEL: Record<Category, string> = {
  nature: "Nature",
  history: "History & Culture",
  adventure: "Adventure",
  food: "Food & Markets",
  beach: "Beach & Coast",
  nightlife: "Nightlife",
};

export const CATEGORY_LABELS = CATEGORY_LABEL;

const TEMPLATES: Record<Category, string[]> = {
  nature: [
    "{d} Botanical Gardens",
    "Cliffside Nature Reserve",
    "Sunrise Ridge Trail",
    "{d} Wetlands Boardwalk",
    "Cedar Valley Lookout",
    "Blue Lagoon Springs",
  ],
  history: [
    "Old Town {d} Quarter",
    "{d} National Museum",
    "The Citadel Ruins",
    "Cathedral of St. Mira",
    "Heritage Artisan Lane",
    "Maritime History Wharf",
  ],
  adventure: [
    "Canyon Zipline Park",
    "{d} Sea Kayak Route",
    "Volcano Rim Hike",
    "Whitewater Rafting Run",
    "Cavern Descent Tour",
    "Paragliding Point",
  ],
  food: [
    "{d} Central Market",
    "Street Food Alley Crawl",
    "Vineyard & Cheese Tasting",
    "Harbourside Fish Auction",
    "Spice Souk Walk",
    "Chef's Table Workshop",
  ],
  beach: [
    "Golden Bay Beach",
    "Hidden Cove Snorkel",
    "{d} Marina Promenade",
    "Sunset Sandbar",
    "Turtle Point Reef",
    "Palm Dune Beach Club",
  ],
  nightlife: [
    "Rooftop Skyline Bar",
    "Jazz Cellar {d}",
    "Night Market Lights",
    "Riverside Live Music",
    "Old Distillery Lounge",
    "Neon District Walk",
  ],
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const STYLE_PER_DAY: Record<TripInput["style"], number> = {
  relaxed: 2,
  balanced: 3,
  packed: 4,
  luxury: 2,
};

const STYLE_COST: Record<TripInput["style"], number> = {
  relaxed: 1,
  balanced: 1.1,
  packed: 1.15,
  luxury: 1.9,
};

export function optimizeTrip(input: TripInput, salt = 0): TripPlan {
  const dest = input.destination.trim() || "Your City";
  const short = dest.split(",")[0].trim();
  const rand = rng(hash(dest.toLowerCase()) + salt * 7919);

  const pool: Attraction[] = [];
  (Object.keys(TEMPLATES) as Category[]).forEach((cat) => {
    TEMPLATES[cat].forEach((tpl, i) => {
      const cost = Math.round((8 + rand() * 60) * (cat === "nightlife" ? 1.4 : 1));
      const co2 = Math.round(2 + rand() * 18);
      const rating = Math.round((3.9 + rand() * 1.1) * 10) / 10;
      pool.push({
        id: `${cat}-${i}`,
        name: tpl.replace("{d}", short),
        category: cat,
        cost,
        durationHours: Math.round((1.5 + rand() * 2.5) * 2) / 2,
        rating,
        co2,
        x: 8 + rand() * 84,
        y: 10 + rand() * 78,
        reason: "",
        score: 0,
      });
    });
  });

  const perDay = STYLE_PER_DAY[input.style];
  const target = Math.max(3, Math.min(pool.length, perDay * input.days));
  const costMult = STYLE_COST[input.style];
  const perPersonBudget = input.budget / Math.max(1, input.travellers);

  const scored = pool
    .map((a) => {
      const prefWeight = input.prefs[a.category] / 10; // 0..1
      const ecoBonus = (input.sustainability / 10) * (1 - a.co2 / 20) * 0.35;
      const valuePenalty = (a.cost / Math.max(60, perPersonBudget / 12)) * 0.12;
      const score = prefWeight * 1.0 + (a.rating - 3.9) * 0.25 + ecoBonus - valuePenalty;
      return { ...a, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected: Attraction[] = [];
  let spentActivities = 0;
  const activityBudget = input.budget * 0.35;
  for (const a of scored) {
    if (selected.length >= target) break;
    const cost = Math.round(a.cost * costMult * input.travellers);
    if (spentActivities + cost > activityBudget && selected.length >= Math.max(3, target * 0.5))
      continue;
    spentActivities += cost;
    selected.push({ ...a, cost });
  }

  selected.forEach((a) => {
    const p = input.prefs[a.category];
    const bits: string[] = [];
    bits.push(
      p >= 7
        ? `matches your high ${CATEGORY_LABEL[a.category].toLowerCase()} preference (${p}/10)`
        : `adds variety with a light ${CATEGORY_LABEL[a.category].toLowerCase()} touch (${p}/10)`,
    );
    if (a.rating >= 4.5) bits.push(`rated ${a.rating}/5 by travellers`);
    if (input.sustainability >= 6 && a.co2 <= 8)
      bits.push(`low carbon footprint (${a.co2} kg CO₂e)`);
    if (a.cost <= perPersonBudget * 0.06) bits.push("strong value for its price");
    bits.push(`fits a ${a.durationHours}h slot within your ${input.maxDailyTravelMinutes} min/day travel cap`);
    a.reason = bits.join(", ") + ".";
  });

  // Route days: greedy nearest-neighbour clustering
  const remaining = [...selected];
  const days: DayPlan[] = [];
  const start = input.startDate ? new Date(input.startDate) : new Date();
  let totalDistance = 0;

  for (let d = 0; d < input.days; d++) {
    const items: Attraction[] = [];
    let travelMinutes = 0;
    let cursor = remaining.shift();
    if (cursor) items.push(cursor);
    while (cursor && items.length < perDay && remaining.length) {
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((r, i) => {
        const dist = Math.hypot(r.x - cursor!.x, r.y - cursor!.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      const km = Math.round(bestDist * 0.9 * 10) / 10;
      const mins = Math.round(km * 2.4);
      if (travelMinutes + mins > input.maxDailyTravelMinutes) break;
      travelMinutes += mins;
      totalDistance += km;
      cursor = remaining.splice(bestIdx, 1)[0];
      items.push(cursor);
    }
    const date = new Date(start.getTime() + d * 86400000);
    days.push({
      day: d + 1,
      date: date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      items,
      travelMinutes: travelMinutes + 25,
      cost: items.reduce((s, i) => s + i.cost, 0),
    });
  }

  const nightly = Math.round((70 + rand() * 90) * costMult);
  const lodging = nightly * Math.max(1, input.days - 1) * Math.ceil(input.travellers / 2);
  const foodPerDay = Math.round(28 * costMult * (0.8 + input.prefs.food / 20));
  const foodCost = foodPerDay * input.days * input.travellers;
  const transport = Math.round(
    (totalDistance * 0.9 + 40) * input.travellers * (input.sustainability >= 7 ? 0.7 : 1),
  );
  const activityCost = selected.reduce((s, a) => s + a.cost, 0);
  const totalCost = Math.round(lodging + foodCost + transport + activityCost);

  const prefTotal = (Object.keys(input.prefs) as Category[]).reduce(
    (s, c) => s + input.prefs[c],
    0,
  );
  const satisfied = (Object.keys(input.prefs) as Category[]).reduce((s, c) => {
    const picks = selected.filter((a) => a.category === c).length;
    const wanted = Math.max(1, Math.round((input.prefs[c] / prefTotal) * selected.length));
    return s + input.prefs[c] * Math.min(1, picks / wanted);
  }, 0);
  const preferenceScore = Math.round(Math.min(99, (satisfied / Math.max(1, prefTotal)) * 100));

  const avgCo2 = selected.reduce((s, a) => s + a.co2, 0) / Math.max(1, selected.length);
  const sustainabilityScore = Math.round(
    Math.max(
      35,
      Math.min(
        98,
        100 - avgCo2 * 2.2 - totalDistance * 0.25 + input.sustainability * 3.2,
      ),
    ),
  );

  const areas = ["Old Town", "Harbour District", "Green Quarter", "Riverside"];
  const hotels: Hotel[] = [
    {
      name: `The ${short} Cortile`,
      area: areas[0],
      nightly,
      rating: 4.7,
      ecoLabel: input.sustainability >= 6 ? "Green Key certified" : "Standard",
      tags: ["Central", "Breakfast included"],
    },
    {
      name: `Casa Verde ${short}`,
      area: areas[2],
      nightly: Math.round(nightly * 0.8),
      rating: 4.5,
      ecoLabel: "Solar powered, zero single-use plastic",
      tags: ["Eco stay", "Quiet"],
    },
    {
      name: `Marina Grand ${short}`,
      area: areas[1],
      nightly: Math.round(nightly * 1.45),
      rating: 4.8,
      ecoLabel: input.sustainability >= 8 ? "Carbon offset program" : "Standard",
      tags: ["Sea view", "Spa"],
    },
  ];

  const restaurants: Restaurant[] = [
    { name: `Tavola ${short}`, cuisine: "Local seasonal", priceLevel: "€€", rating: 4.6, near: areas[0] },
    { name: "Salt & Ember", cuisine: "Seafood grill", priceLevel: "€€€", rating: 4.8, near: areas[1] },
    { name: "Mercato Piccolo", cuisine: "Street food hall", priceLevel: "€", rating: 4.4, near: areas[2] },
    { name: "Herb & Root", cuisine: "Plant-forward", priceLevel: "€€", rating: 4.7, near: areas[3] },
  ];

  return {
    input,
    attractions: selected,
    days,
    totalCost,
    budgetRemaining: Math.round(input.budget - totalCost),
    preferenceScore,
    sustainabilityScore,
    totalDistanceKm: Math.round(totalDistance * 10) / 10,
    hotels,
    restaurants,
  };
}
