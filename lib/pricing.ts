import { sql } from "./db";

export const FREIGHT = 0.85;

export type PriceRow = {
  supplier: string;
  location: string;
  grades: Record<string, number>;
  effective_date: string | null;
  effective_time: string | null;
};

export type PriceWithFreight = {
  supplier: string;
  location: string;
  prices: Array<{ grade: string; basePrice: number; allInPrice: number }>;
  effective_date: string | null;
  effective_time: string | null;
};

export type GroupedPrices = {
  supplier: string;
  color: [string, string];
  dateLabel: string;
  locations: Array<{
    location: string;
    prices: Array<{ grade: string; basePrice: number; allInPrice: number }>;
  }>;
};

const SUPPLIER_COLORS: Array<[string, string]> = [
  ["#1a1a2e", "#0f3460"],
  ["#2d3436", "#636e72"],
  ["#0c2461", "#1e3799"],
  ["#1B1464", "#6F1E51"],
  ["#0a3d62", "#3c6382"],
  ["#2C3A47", "#4b6584"],
  ["#1a1a2e", "#e94560"],
  ["#2d3436", "#d63031"],
  ["#0c2461", "#4834d4"],
];

export function cleanGrade(name: string): string {
  return name.replace(/_/g, " ").toUpperCase().replace(/GRADE\s+/i, "");
}

export function formatPrice(val: number): string {
  return "$" + val.toFixed(4);
}

function formatDate(date: string | null, time: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const dateStr = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return time ? `${dateStr} ${time}` : dateStr;
}

export async function getPricesForUser(userId: number, isAdmin: boolean): Promise<GroupedPrices[]> {
  // Fetch assigned terminals (if admin, fetch all)
  let rows: PriceRow[];
  if (isAdmin) {
    rows = await sql<PriceRow[]>`
      SELECT supplier, location, grades, effective_date::text, effective_time
      FROM current_prices
      ORDER BY supplier, location
    `;
  } else {
    rows = await sql<PriceRow[]>`
      SELECT cp.supplier, cp.location, cp.grades, cp.effective_date::text, cp.effective_time
      FROM current_prices cp
      INNER JOIN user_terminal_assignments uta
        ON uta.location = cp.location
      WHERE uta.user_id = ${userId}
      ORDER BY cp.supplier, cp.location
    `;
  }

  // Group by supplier
  const bySupplier = new Map<
    string,
    {
      supplier: string;
      dateLabel: string;
      locations: Array<{
        location: string;
        prices: Array<{ grade: string; basePrice: number; allInPrice: number }>;
      }>;
    }
  >();

  for (const row of rows) {
    const prices = Object.entries(row.grades)
      .filter(([, v]) => typeof v === "number" && v > 0.01)
      .map(([grade, basePrice]) => ({
        grade,
        basePrice,
        allInPrice: basePrice + FREIGHT,
      }));

    if (prices.length === 0) continue;

    if (!bySupplier.has(row.supplier)) {
      bySupplier.set(row.supplier, {
        supplier: row.supplier,
        dateLabel: formatDate(row.effective_date, row.effective_time),
        locations: [],
      });
    }
    bySupplier.get(row.supplier)!.locations.push({
      location: row.location,
      prices,
    });
  }

  // Assign colors by sort order
  const sorted = Array.from(bySupplier.values()).sort((a, b) =>
    a.supplier.localeCompare(b.supplier)
  );

  return sorted.map((group, idx) => ({
    ...group,
    color: SUPPLIER_COLORS[idx % SUPPLIER_COLORS.length],
  }));
}

export async function getAllLocations(): Promise<string[]> {
  const rows = await sql<{ location: string }[]>`
    SELECT DISTINCT location FROM current_prices ORDER BY location
  `;
  return rows.map((r) => r.location);
}
