"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  XCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Calculation = Record<string, unknown>;

const filters = ["All", "Completed", "Processing", "Failed"];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function extractCalculations(payload: unknown): Calculation[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Calculation =>
        typeof item === "object" && item !== null,
    );
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const object = payload as Record<string, unknown>;

  const possibleArrays = [
    object.data,
    object.calculations,
    object.results,
    object.items,
    object.records,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is Calculation =>
          typeof item === "object" && item !== null,
      );
    }

    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;

      const nestedArrays = [
        nested.data,
        nested.calculations,
        nested.results,
        nested.items,
        nested.records,
      ];

      for (const nestedValue of nestedArrays) {
        if (Array.isArray(nestedValue)) {
          return nestedValue.filter(
            (item): item is Calculation =>
              typeof item === "object" && item !== null,
          );
        }
      }
    }
  }

  return [];
}

function getString(
  object: Calculation,
  keys: string[],
  fallback = "—",
): string {
  for (const key of keys) {
    const value = object[key];

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
  }

  return fallback;
}

function getId(calculation: Calculation, index: number): string {
  return getString(
    calculation,
    [
      "id",
      "_id",
      "calculation_id",
      "calculationId",
      "uuid",
    ],
    `#${index + 1}`,
  );
}

function getName(calculation: Calculation): string {
  return getString(
    calculation,
    [
      "name",
      "title",
      "calculation_name",
      "calculationName",
      "label",
    ],
    "Untitled calculation",
  );
}

function getType(calculation: Calculation): string {
  return getString(
    calculation,
    [
      "type",
      "calculation_type",
      "calculationType",
      "category",
      "method",
    ],
    "Calculation",
  );
}

function normalizeStatus(
  calculation: Calculation,
): "completed" | "processing" | "failed" {
  const raw = getString(
    calculation,
    [
      "status",
      "state",
      "calculation_status",
      "calculationStatus",
    ],
    "",
  ).toLowerCase();

  if (
    raw.includes("fail") ||
    raw.includes("error") ||
    raw.includes("cancel")
  ) {
    return "failed";
  }

  if (
    raw.includes("process") ||
    raw.includes("pending") ||
    raw.includes("running") ||
    raw.includes("progress")
  ) {
    return "processing";
  }

  return "completed";
}

function getCreatedAt(calculation: Calculation): string {
  const raw = getString(
    calculation,
    [
      "createdAt",
      "created_at",
      "created",
      "date_created",
      "dateCreated",
      "timestamp",
    ],
    "",
  );

  if (!raw) {
    return "—";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getResult(calculation: Calculation): string {
  return getString(
    calculation,
    [
      "result",
      "value",
      "total",
      "impact",
      "carbon_footprint",
      "carbonFootprint",
      "emission",
      "emissions",
      "total_emissions",
      "totalEmissions",
    ],
    "",
  );
}

function getUnit(calculation: Calculation): string {
  return getString(
    calculation,
    [
      "unit",
      "result_unit",
      "resultUnit",
      "impact_unit",
      "impactUnit",
    ],
    "",
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CalculationsPage() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  /* ------------------------------------------------------------------------ */
  /* Fetch backend                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchCalculations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * IMPORTANT:
       * This is the SAME endpoint used by your existing implementation.
       */
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

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
          const errorBody = await response.json();

          if (typeof errorBody?.detail === "string") {
            message = errorBody.detail;
          } else if (typeof errorBody?.message === "string") {
            message = errorBody.message;
          }
        } catch(error) {
            console.log(error);
            return;
        }

        // throw new Error(message);
      }

      const payload = await response.json();

      console.log(
        "GET /api/calculations/getcalculation response:",
        payload,
      );

      const backendCalculations = extractCalculations(payload);

      setCalculations(backendCalculations);
    } catch (err) {
      console.error("Failed to fetch calculations:", err);

      setCalculations([]);

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

  /* ------------------------------------------------------------------------ */
  /* Initial request                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    document.title = "Calculations | EnvoCentre";

    fetchCalculations();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Search + filter                                                          */
  /* ------------------------------------------------------------------------ */

  const filteredCalculations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calculations.filter((calculation) => {
      const name = getName(calculation).toLowerCase();
      const type = getType(calculation).toLowerCase();
      const id = getId(calculation, 0).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        type.includes(query) ||
        id.includes(query);

      const status = normalizeStatus(calculation);

      const matchesFilter =
        activeFilter === "All" ||
        status === activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [calculations, search, activeFilter]);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const completedCount = calculations.filter(
    (item) => normalizeStatus(item) === "completed",
  ).length;

  const processingCount = calculations.filter(
    (item) => normalizeStatus(item) === "processing",
  ).length;

  const failedCount = calculations.filter(
    (item) => normalizeStatus(item) === "failed",
  ).length;

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-[#06100d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-green-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

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
              Create, analyse and manage your environmental impact
              calculations from one workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCalculations(true)}
              disabled={refreshing || loading}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm text-white/70 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              href="/dashboard/calculations/new"
              className="group flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-[#03100b] shadow-[0_0_30px_rgba(16,185,129,0.16)] transition hover:bg-emerald-400"
            >
              <Plus size={17} />

              New calculation

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                             */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <div>
                <p className="text-sm font-medium text-red-300">
                  Failed to load calculations
                </p>

                <p className="mt-1 text-xs text-red-200/50">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchCalculations()}
              className="rounded-lg border border-red-400/15 bg-red-400/[0.07] px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/[0.12]"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Stats                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Calculator size={18} />}
            label="Total calculations"
            value={loading ? "—" : calculations.length}
            description="Across your workspace"
          />

          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value={loading ? "—" : completedCount}
            description="Ready to analyse"
          />

          <StatCard
            icon={<Clock3 size={18} />}
            label="Processing"
            value={loading ? "—" : processingCount}
            description="Currently running"
          />

          <StatCard
            icon={<XCircle size={18} />}
            label="Failed"
            value={loading ? "—" : failedCount}
            description="Need attention"
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* New calculation CTA                                               */}
        {/* ---------------------------------------------------------------- */}

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
                <Sparkles size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Start a new calculation
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-white/45">
                  Enter your activity data and let EnvoCentre calculate
                  the corresponding environmental impact.
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

        {/* ---------------------------------------------------------------- */}
        {/* Main calculations                                                 */}
        {/* ---------------------------------------------------------------- */}

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
                  Data below is loaded directly from your backend.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
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
                    placeholder="Search calculations..."
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-emerald-400/30 sm:w-64"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-black/20 p-1">
                  <Filter
                    size={14}
                    className="ml-2 mr-1 shrink-0 text-white/30"
                  />

                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition ${
                        activeFilter === filter
                          ? "bg-white/10 text-white"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Loading                                                        */}
          {/* -------------------------------------------------------------- */}

          {loading ? (
            <>
              <div className="hidden md:block">
                <div className="border-b border-white/[0.06]">
                  <div className="grid grid-cols-6 gap-4 px-5 py-4">
                    {[
                      "Calculation",
                      "Type",
                      "Status",
                      "Result",
                      "Created",
                      "Actions",
                    ].map((item) => (
                      <div
                        key={item}
                        className="text-[11px] uppercase tracking-wider text-white/20"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {[1, 2, 3, 4].map((item) => (
                    <CalculationSkeleton key={item} />
                  ))}
                </div>
              </div>

              <div className="divide-y divide-white/[0.06] md:hidden">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />

                      <div className="flex-1">
                        <div className="h-3 w-40 rounded bg-white/[0.06]" />
                        <div className="mt-2 h-2.5 w-20 rounded bg-white/[0.04]" />
                      </div>
                    </div>

                    <div className="mt-5 h-10 rounded-lg bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* ---------------------------------------------------------- */}
              {/* Desktop table                                               */}
              {/* ---------------------------------------------------------- */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-white/25">
                      <th className="px-5 py-4 font-medium">
                        Calculation
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Type
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Result
                      </th>

                      <th className="px-5 py-4 font-medium">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredCalculations.map(
                        (calculation, index) => (
                          <CalculationRow
                            key={`${getId(calculation, index)}-${index}`}
                            calculation={calculation}
                            index={index}
                          />
                        ),
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Mobile cards                                                */}
              {/* ---------------------------------------------------------- */}

              <div className="divide-y divide-white/[0.06] md:hidden">
                {filteredCalculations.map(
                  (calculation, index) => (
                    <MobileCalculationCard
                      key={`${getId(calculation, index)}-${index}`}
                      calculation={calculation}
                      index={index}
                    />
                  ),
                )}
              </div>

              {/* ---------------------------------------------------------- */}
              {/* Empty                                                        */}
              {/* ---------------------------------------------------------- */}

              {filteredCalculations.length === 0 && (
                <EmptyState
                  hasSearch={Boolean(search.trim())}
                  hasFilter={activeFilter !== "All"}
                  hasBackendData={calculations.length > 0}
                />
              )}
            </>
          )}
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom insight                                                    */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <TrendingDown
            size={16}
            className="text-emerald-400"
          />

          <p className="text-xs leading-5 text-white/35">
            Use completed calculations to compare environmental
            impact and generate deeper insights.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-emerald-400">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-wider text-white/20">
          Workspace
        </span>
      </div>

      <div className="text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-sm text-white/60">
        {label}
      </div>

      <div className="mt-1 text-xs text-white/25">
        {description}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: "completed" | "processing" | "failed";
}) {
  const config = {
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400",
    },

    processing: {
      label: "Processing",
      icon: Clock3,
      className:
        "border-amber-400/15 bg-amber-400/[0.07] text-amber-400",
    },

    failed: {
      label: "Failed",
      icon: XCircle,
      className:
        "border-red-400/15 bg-red-400/[0.07] text-red-400",
    },
  };

  const item = config[status];

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${item.className}`}
    >
      <Icon size={12} />

      {item.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Desktop Calculation Row                                                   */
/* -------------------------------------------------------------------------- */

function CalculationRow({
  calculation,
  index,
}: {
  calculation: Calculation;
  index: number;
}) {
  const id = getId(calculation, index);
  const name = getName(calculation);
  const type = getType(calculation);
  const status = normalizeStatus(calculation);
  const result = getResult(calculation);
  const unit = getUnit(calculation);
  const createdAt = getCreatedAt(calculation);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group border-b border-white/[0.05] transition hover:bg-white/[0.025]"
    >
      {/* Calculation */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.07] text-emerald-400">
            <Calculator size={16} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white/85">
              {name}
            </div>

            <div className="mt-0.5 truncate text-[11px] text-white/25">
              {id}
            </div>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-5 py-4 text-sm text-white/45">
        {type}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

      {/* Result */}
      <td className="px-5 py-4">
        {result ? (
          <div>
            <span className="text-sm font-medium text-white/80">
              {result}
            </span>

            {unit && (
              <span className="ml-1 text-xs text-white/30">
                {unit}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-white/25">
            —
          </span>
        )}
      </td>

      {/* Created */}
      <td className="px-5 py-4 text-xs text-white/35">
        {createdAt}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <button
            type="button"
            title="View"
            className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            title="Export"
            className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Download size={16} />
          </button>

          <button
            type="button"
            title="More"
            className="rounded-lg p-2 text-white/30 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Mobile Calculation Card                                                   */
/* -------------------------------------------------------------------------- */

function MobileCalculationCard({
  calculation,
  index,
}: {
  calculation: Calculation;
  index: number;
}) {
  const id = getId(calculation, index);
  const name = getName(calculation);
  const type = getType(calculation);
  const status = normalizeStatus(calculation);
  const result = getResult(calculation);
  const unit = getUnit(calculation);
  const createdAt = getCreatedAt(calculation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.07] text-emerald-400">
            <Calculator size={16} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white/85">
              {name}
            </div>

            <div className="mt-0.5 truncate text-xs text-white/30">
              {type}
            </div>

            <div className="mt-0.5 truncate text-[10px] text-white/20">
              {id}
            </div>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/20">
            Result
          </div>

          {result ? (
            <div className="mt-1">
              <span className="text-lg font-semibold">
                {result}
              </span>

              {unit && (
                <span className="ml-1 text-xs text-white/30">
                  {unit}
                </span>
              )}
            </div>
          ) : (
            <div className="mt-1 text-sm text-white/25">
              —
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-white/20">
            Created
          </div>

          <div className="mt-1 text-xs text-white/35">
            {createdAt}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] py-2 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white/70"
        >
          <Eye size={14} />
          View
        </button>

        <button
          type="button"
          className="flex items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function CalculationSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-6 items-center gap-4 px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />

        <div>
          <div className="h-3 w-36 rounded bg-white/[0.06]" />
          <div className="mt-2 h-2 w-20 rounded bg-white/[0.04]" />
        </div>
      </div>

      <div className="h-3 w-20 rounded bg-white/[0.05]" />

      <div className="h-6 w-20 rounded-full bg-white/[0.05]" />

      <div className="h-3 w-16 rounded bg-white/[0.05]" />

      <div className="h-3 w-28 rounded bg-white/[0.04]" />

      <div className="flex justify-end gap-2">
        <div className="h-8 w-8 rounded-lg bg-white/[0.05]" />
        <div className="h-8 w-8 rounded-lg bg-white/[0.05]" />
        <div className="h-8 w-8 rounded-lg bg-white/[0.05]" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  hasSearch,
  hasFilter,
  hasBackendData,
}: {
  hasSearch: boolean;
  hasFilter: boolean;
  hasBackendData: boolean;
}) {
  let title = "No calculations found";
  let description =
    "There are currently no calculations returned by the backend.";

  if (hasSearch) {
    title = "No matching calculations";
    description =
      "Try changing your search query.";
  } else if (hasFilter) {
    title = "No calculations in this status";
    description =
      "Try selecting another status filter.";
  } else if (hasBackendData) {
    title = "No calculations match";
    description =
      "The backend returned data, but nothing matches the current filters.";
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-white/30">
        <Search size={20} />
      </div>

      <h3 className="font-medium">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-white/35">
        {description}
      </p>
    </div>
  );
}