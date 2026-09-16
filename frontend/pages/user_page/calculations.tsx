"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Filter,
  Gauge,
  Leaf,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Trees,
  Zap,
} from "lucide-react";

type CalculationImpact = {
  energy_kwh: {
    it: number;
    total: number;
  };

  heat: {
    kwh: number;
    mj: number;
    btu: number;
  };

  water: {
    liters: number;
    cubic_meters: number;
  };

  co2_kg: number;
  co2_kg_without_renewables: number;
  renewable_energy_percent: number;

  equivalences: {
    homes_powered_for_a_day: number;
    cars_off_the_road_for_a_year: number;
    flights_one_way_per_passenger: number;
  };

  forest: {
    hectares_needed: number;
    trees_equivalent: number;
    land_cleared_hectares: number;
  };

  capacity_estimate: number;

  sources: {
    gpu_tdp_w: number;
    pue: number;
    wue_l_per_kwh: number;
    carbon_intensity_g_per_kwh: number;
    co2_per_tree_kg_year: number;
    co2_per_hectare_kg_year: number;
  };

  notes: string[];
};

type Calculation = {
  id: number;
  user_id: number;
  facility_area_m2: number;
  gpu_model: string;
  gpu_count: number;
  hours_used: number;
  renewable_energy_percent: number;
  impact: CalculationImpact;
  created_at: string;
  updated_at: string;
};

const formatNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 2,
) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function CalculationsPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchCalculations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/calculations/getcalculation",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const data = await response.json().catch(() => null);

      console.log("Calculations response:", data);

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        if (typeof data?.message === "string") {
          message = data.message;
        } else if (Array.isArray(data?.message)) {
          message = data.message
            .map((item: { msg?: string }) => item?.msg)
            .filter(Boolean)
            .join(", ");
        } else if (typeof data?.detail === "string") {
          message = data.detail;
        }

        throw new Error(message);
      }

      /*
       * Backend response is expected to be:
       *
       * [
       *   {
       *     id: 1,
       *     facility_area_m2: ...,
       *     gpu_model: ...,
       *     impact: {...}
       *   }
       * ]
       */

      const result = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setCalculations(result);
    } catch (err) {
      console.error("Load calculations error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load calculations.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = "Calculations | EnvoCentre";
    fetchCalculations();
  }, []);

  const filteredCalculations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calculations.filter((calculation) => {
      const matchesSearch =
        !query ||
        String(calculation.id).includes(query) ||
        calculation.gpu_model.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Renewable" &&
          calculation.renewable_energy_percent > 0) ||
        (activeFilter === "High impact" &&
          calculation.impact.co2_kg > 10);

      return matchesSearch && matchesFilter;
    });
  }, [calculations, search, activeFilter]);

  const totalEnergy = calculations.reduce(
    (sum, calculation) =>
      sum + (calculation.impact?.energy_kwh?.total || 0),
    0,
  );

  const totalWater = calculations.reduce(
    (sum, calculation) =>
      sum + (calculation.impact?.water?.liters || 0),
    0,
  );

  const totalCo2 = calculations.reduce(
    (sum, calculation) =>
      sum + (calculation.impact?.co2_kg || 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#06100d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-green-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
              <Calculator size={16} />
              <span>Environmental calculations</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Calculations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Review every environmental calculation, its inputs,
              environmental impact and detailed results.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCalculations(true)}
              disabled={refreshing}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/calculations/new"
              className="group flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-[#03100b] shadow-[0_0_30px_rgba(16,185,129,0.16)] transition hover:bg-emerald-400"
            >
              <Sparkles size={17} />
              New calculation
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>

        {/* Summary */}
        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Calculator size={18} />}
            label="Calculations"
            value={calculations.length}
            description="Total calculations"
          />

          <SummaryCard
            icon={<Zap size={18} />}
            label="Total energy"
            value={`${formatNumber(totalEnergy)} kWh`}
            description="Across all calculations"
          />

          <SummaryCard
            icon={<Droplets size={18} />}
            label="Total water"
            value={`${formatNumber(totalWater)} L`}
            description="Estimated water consumption"
          />

          <SummaryCard
            icon={<Leaf size={18} />}
            label="Total CO₂"
            value={`${formatNumber(totalCo2)} kg`}
            description="With renewable contribution"
          />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="relative mb-8 overflow-hidden rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.09] via-white/[0.025] to-transparent p-6 sm:p-7"
        >
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-[80px]" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-400">
                <Gauge size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Environmental impact history
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-white/45">
                  Select any calculation below to inspect the complete
                  calculation returned by the backend.
                </p>
              </div>
            </div>

            <Link
              href="/calculations/new"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
            >
              Create calculation
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Calculations */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
        >
          {/* Toolbar */}
          <div className="border-b border-white/[0.07] p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-semibold">
                  Your calculations
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {filteredCalculations.length} calculation
                  {filteredCalculations.length === 1 ? "" : "s"} shown
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search GPU or ID..."
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400/30 sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/20 p-1">
                  <Filter
                    size={14}
                    className="ml-2 mr-1 shrink-0 text-white/30"
                  />

                  {["All", "Renewable", "High impact"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() =>
                          setActiveFilter(filter)
                        }
                        className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition ${
                          activeFilter === filter
                            ? "bg-white/10 text-white"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {filter}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              error={error}
              onRetry={() => fetchCalculations(true)}
            />
          ) : filteredCalculations.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-white/25">
                      <th className="px-5 py-4 font-medium">
                        Calculation
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Workload
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Energy
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Water
                      </th>

                      <th className="px-5 py-4 font-medium">
                        CO₂
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Renewable
                      </th>

                      <th className="px-5 py-4 text-right font-medium">
                        View
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredCalculations.map(
                        (calculation, index) => (
                          <CalculationRow
                            key={calculation.id}
                            calculation={calculation}
                            index={index}
                          />
                        ),
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-white/[0.06] md:hidden">
                {filteredCalculations.map(
                  (calculation, index) => (
                    <MobileCalculationCard
                      key={calculation.id}
                      calculation={calculation}
                      index={index}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Calculation row                                                            */
/* -------------------------------------------------------------------------- */

function CalculationRow({
  calculation,
  index,
}: {
  calculation: Calculation;
  index: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group border-b border-white/[0.05] transition hover:bg-white/[0.025]"
    >
      <td className="px-5 py-4">
        <Link
          href={`/dashboard/calculations/${calculation.id}`}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-400">
            <Calculator size={17} />
          </div>

          <div>
            <div className="text-sm font-medium text-white/90">
              Calculation #{calculation.id}
            </div>

            <div className="mt-0.5 text-[11px] text-white/30">
              {formatDate(calculation.created_at)}
            </div>
          </div>
        </Link>
      </td>

      <td className="px-5 py-4">
        <div className="min-w-[180px]">
          <div className="flex items-center gap-2 text-sm text-white/75">
            <Server
              size={14}
              className="text-cyan-400"
            />
            {calculation.gpu_model}
          </div>

          <div className="mt-1 text-xs text-white/30">
            {formatNumber(calculation.gpu_count, 0)} GPU
            {calculation.gpu_count === 1 ? "" : "s"} ·{" "}
            {formatNumber(calculation.hours_used, 1)} hrs
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <MetricCell
          value={formatNumber(
            calculation.impact.energy_kwh.total,
          )}
          unit="kWh"
          icon={<Zap size={13} />}
        />
      </td>

      <td className="px-5 py-4">
        <MetricCell
          value={formatNumber(
            calculation.impact.water.liters,
          )}
          unit="L"
          icon={<Droplets size={13} />}
        />
      </td>

      <td className="px-5 py-4">
        <MetricCell
          value={formatNumber(
            calculation.impact.co2_kg,
          )}
          unit="kg"
          icon={<Leaf size={13} />}
        />
      </td>

      <td className="px-5 py-4">
        <div className="min-w-[100px]">
          <div className="text-sm font-medium text-emerald-300">
            {formatNumber(
              calculation.renewable_energy_percent,
              1,
            )}
            %
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    calculation.renewable_energy_percent,
                  ),
                )}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <Link
            href={`/dashboard/calculations/${calculation.id}`}
            className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/50 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.06] hover:text-emerald-300"
          >
            View details
            <ChevronRight size={14} />
          </Link>
        </div>
      </td>
    </motion.tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile card                                                                */
/* -------------------------------------------------------------------------- */

function MobileCalculationCard({
  calculation,
  index,
}: {
  calculation: Calculation;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-4"
    >
      <Link
        href={`/dashboard/calculations/${calculation.id}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-400">
              <Calculator size={17} />
            </div>

            <div>
              <div className="text-sm font-medium text-white/90">
                Calculation #{calculation.id}
              </div>

              <div className="mt-1 text-xs text-white/30">
                {formatDate(calculation.created_at)}
              </div>
            </div>
          </div>

          <ChevronRight
            size={18}
            className="mt-2 text-white/25"
          />
        </div>

        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-sm text-white/75">
            <Server
              size={14}
              className="text-cyan-400"
            />

            {calculation.gpu_model}
          </div>

          <div className="mt-1 text-xs text-white/30">
            {formatNumber(calculation.gpu_count, 0)} GPUs ·{" "}
            {formatNumber(calculation.hours_used, 1)} hours ·{" "}
            {formatNumber(calculation.facility_area_m2, 2)} m²
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MobileMetric
            label="Energy"
            value={`${formatNumber(
              calculation.impact.energy_kwh.total,
            )} kWh`}
            icon={<Zap size={14} />}
          />

          <MobileMetric
            label="Water"
            value={`${formatNumber(
              calculation.impact.water.liters,
            )} L`}
            icon={<Droplets size={14} />}
          />

          <MobileMetric
            label="CO₂"
            value={`${formatNumber(
              calculation.impact.co2_kg,
            )} kg`}
            icon={<Leaf size={14} />}
          />

          <MobileMetric
            label="Renewable"
            value={`${formatNumber(
              calculation.renewable_energy_percent,
              1,
            )}%`}
            icon={<Trees size={14} />}
          />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-emerald-400">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-wider text-white/20">
          Live data
        </span>
      </div>

      <div className="truncate text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-sm text-white/60">
        {label}
      </div>

      <div className="mt-1 text-xs text-white/25">
        {description}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function MetricCell({
  value,
  unit,
  icon,
}: {
  value: string;
  unit: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm font-medium text-white/80">
        <span className="text-emerald-400">
          {icon}
        </span>
        {value}
      </div>

      <div className="mt-0.5 pl-5 text-[11px] text-white/25">
        {unit}
      </div>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/25">
        <span className="text-emerald-400">
          {icon}
        </span>
        {label}
      </div>

      <div className="mt-2 text-sm font-semibold text-white/80">
        {value}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-3 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.025]"
        />
      ))}
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-400">
        <Clock3 size={20} />
      </div>

      <h3 className="font-medium">
        Unable to load calculations
      </h3>

      <p className="mt-2 max-w-md text-sm text-white/35">
        {error}
      </p>

      <button
        onClick={onRetry}
        className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-white/30">
        <Search size={20} />
      </div>

      <h3 className="font-medium">
        No calculations found
      </h3>

      <p className="mt-2 max-w-sm text-sm text-white/35">
        No calculations match your current search or filter.
      </p>
    </div>
  );
}