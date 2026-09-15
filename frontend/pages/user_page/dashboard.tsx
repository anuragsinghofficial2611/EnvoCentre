"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  ChevronRight,
  Clock3,
  FileDown,
  FileSpreadsheet,
  GitCompare,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

type Calculation = Record<string, unknown>;

function extractCalculations(payload: unknown): Calculation[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Calculation =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item)
    );
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;

  const possibleArrays = [
    data.data,
    data.calculations,
    data.items,
    data.results,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is Calculation =>
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item)
      );
    }
  }

  return [];
}

function getString(
  object: Calculation,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = object[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
  }

  return null;
}

function getDate(calculation: Calculation): string | null {
  return getString(calculation, [
    "created_at",
    "createdAt",
    "date",
    "calculated_at",
    "updated_at",
    "updatedAt",
  ]);
}

function formatDate(value: string | null) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCalculationName(
  calculation: Calculation,
  index: number
) {
  return (
    getString(calculation, [
      "name",
      "title",
      "calculation_name",
      "calculationName",
    ]) || `Calculation ${index + 1}`
  );
}

function getCalculationId(
  calculation: Calculation
): string | null {
  return getString(calculation, [
    "id",
    "calc_id",
    "calculation_id",
    "_id",
  ]);
}

function getCalculationType(
  calculation: Calculation
) {
  return (
    getString(calculation, [
      "type",
      "calculation_type",
      "calculationType",
      "category",
    ]) || "Calculation"
  );
}

function getImpact(calculation: Calculation) {
  return getString(calculation, [
    "impact",
    "total_impact",
    "totalImpact",
    "carbon_impact",
    "carbonImpact",
    "emissions",
  ]);
}

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const orbOneRef = useRef<HTMLDivElement | null>(null);
  const orbTwoRef = useRef<HTMLDivElement | null>(null);

  const [calculations, setCalculations] = useState<
    Calculation[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  /*
   * IMPORTANT:
   * API endpoint intentionally unchanged.
   */
  const fetchCalculations = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await fetch(
        `/api/calculations/getcalculation`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        let message = "Unable to load calculations.";

        try {
          const body = await response.json();

          console.log(body);

          if (typeof body?.detail === "string") {
            message = body.detail;
          } else if (typeof body?.message === "string") {
            message = body.message;
          }
        } catch {
          // Ignore invalid error body.
        }

        throw new Error(message);
      }

      const data = await response.json();

      console.log(data);

      setCalculations(extractCalculations(data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading calculations."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, []);

  /*
   * GSAP animations
   */
  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        {
          y: 24,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        cardsRef.current?.children || [],
        {
          y: 24,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          delay: 0.1,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        contentRef.current?.children || [],
        {
          y: 28,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          delay: 0.2,
          ease: "power3.out",
        }
      );

      if (orbOneRef.current) {
        gsap.to(orbOneRef.current, {
          x: 45,
          y: 35,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orbTwoRef.current) {
        gsap.to(orbTwoRef.current, {
          x: -40,
          y: -30,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const filteredCalculations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return calculations;
    }

    return calculations.filter((calculation, index) => {
      const name = getCalculationName(
        calculation,
        index
      ).toLowerCase();

      const type = getCalculationType(
        calculation
      ).toLowerCase();

      return (
        name.includes(query) ||
        type.includes(query)
      );
    });
  }, [calculations, search]);

  const recentCalculations =
    filteredCalculations.slice(0, 5);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050b08] text-zinc-100"
    >
      {/* =====================================================
          Ambient Background
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          ref={orbOneRef}
          className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.045] blur-[120px]"
        />

        <div
          ref={orbTwoRef}
          className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-cyan-500/[0.035] blur-[120px]"
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
      </div>

      {/* =====================================================
          Main
          
          NO Sidebar here.
          NO lg:ml-[260px] here.

          Workspace layout already handles sidebar spacing.
      ===================================================== */}

      <main className="relative min-h-screen w-full">
        {/* ===================================================
            Header
        =================================================== */}

        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#050b08]/75 backdrop-blur-xl">
          <div className="flex h-[78px] items-center justify-between px-5 sm:px-7 lg:px-10 xl:px-12">
            {/* Mobile brand */}

            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <p className="text-sm font-semibold text-white">
                  Envo
                  <span className="text-emerald-400">
                    Centre
                  </span>
                </p>
              </div>

              {/* Desktop page indicator */}

              <div className="hidden items-center gap-2 lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  Workspace
                </span>
              </div>
            </div>

            {/* Search */}

            <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 md:flex">
              <Search
                size={17}
                className="text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search calculations..."
                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-zinc-600 transition-colors hover:text-zinc-300"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              <kbd className="hidden rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[10px] text-zinc-600 lg:block">
                /
              </kbd>
            </div>

            {/* Right side */}

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition-all hover:bg-white/[0.06] hover:text-zinc-200"
                aria-label="Activity"
              >
                <Clock3 size={17} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>

              <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />

              <button className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition-colors hover:bg-white/[0.04]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 text-xs font-semibold text-emerald-300">
                  A
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-medium text-zinc-200">
                    Your workspace
                  </p>

                  <p className="text-[10px] text-zinc-600">
                    Personal account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================
            Content
        =================================================== */}

        <div className="relative w-full px-5 py-8 sm:px-7 lg:px-10 xl:px-12">
          {/* Page heading */}

          <section
            ref={headerRef}
            className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"
          >
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  Environmental workspace
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                Understand your{" "}
                <span className="text-emerald-400">
                  impact.
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-[15px]">
                Create, compare and analyze environmental
                calculations from one workspace.
              </p>
            </div>

            <Link
              href="/calculations/new"
              className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-[#04100a] shadow-[0_0_30px_rgba(52,211,153,0.10)] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_0_35px_rgba(52,211,153,0.18)]"
            >
              <Plus size={17} />

              <span>New Calculation</span>

              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </section>

          {/* =================================================
              KPI Cards
          ================================================= */}

          <section
            ref={cardsRef}
            className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              icon={<Calculator size={18} />}
              label="Total calculations"
              value={
                loading
                  ? "—"
                  : calculations.length.toLocaleString()
              }
              description="Your saved calculations"
              iconClass="text-emerald-300 bg-emerald-400/[0.08] border-emerald-400/10"
            />

            <MetricCard
              icon={<Clock3 size={18} />}
              label="Recent activity"
              value={
                loading
                  ? "—"
                  : Math.min(
                      calculations.length,
                      5
                    ).toString()
              }
              description="Latest calculations"
              iconClass="text-cyan-300 bg-cyan-400/[0.07] border-cyan-400/10"
            />

            <MetricCard
              icon={<GitCompare size={18} />}
              label="Compare"
              value="Ready"
              description="Analyze two calculations"
              iconClass="text-violet-300 bg-violet-400/[0.07] border-violet-400/10"
            />

            <MetricCard
              icon={<Sparkles size={18} />}
              label="AI impact"
              value="Ready"
              description="Generate an impact report"
              iconClass="text-amber-300 bg-amber-400/[0.07] border-amber-400/10"
            />
          </section>

          {/* =================================================
              Main Content Grid
          ================================================= */}

          <div
            ref={contentRef}
            className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]"
          >
            {/* =================================================
                Recent calculations
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
              <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-white">
                    Recent calculations
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your latest environmental calculations
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchCalculations(true)}
                    disabled={refreshing}
                    className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh
                  </button>

                  <Link
                    href="/calculations"
                    className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-400/[0.07]"
                  >
                    View all
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {loading ? (
                <CalculationSkeleton />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={() => fetchCalculations()}
                />
              ) : recentCalculations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y divide-white/[0.045]">
                  {recentCalculations.map(
                    (calculation, index) => {
                      const id =
                        getCalculationId(
                          calculation
                        );

                      const name =
                        getCalculationName(
                          calculation,
                          index
                        );

                      const type =
                        getCalculationType(
                          calculation
                        );

                      const impact =
                        getImpact(calculation);

                      const date =
                        getDate(calculation);

                      return (
                        <Link
                          href={
                            id
                              ? `/calculations/${id}`
                              : "/calculations"
                          }
                          key={
                            id ||
                            `${name}-${index}`
                          }
                          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300">
                            <Calculator
                              size={17}
                              strokeWidth={1.7}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
                              {name}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 text-[10px] text-zinc-600">
                                {type}
                              </span>

                              <span className="text-[10px] text-zinc-700">
                                {formatDate(date)}
                              </span>
                            </div>
                          </div>

                          <div className="hidden text-right sm:block">
                            <p className="text-xs font-medium text-zinc-300">
                              {impact || "—"}
                            </p>

                            <p className="mt-1 text-[10px] text-zinc-700">
                              Impact
                            </p>
                          </div>

                          <ChevronRight
                            size={16}
                            className="shrink-0 text-zinc-700 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-400"
                          />
                        </Link>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                Quick actions
            ================================================= */}

            <section className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <div className="mb-5">
                <h2 className="text-[15px] font-semibold text-white">
                  Quick actions
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Move directly into your workflow
                </p>
              </div>

              <div className="space-y-2.5">
                <QuickAction
                  href="/calculations/new"
                  icon={<Plus size={18} />}
                  title="New calculation"
                  description="Start a fresh calculation"
                  accent="emerald"
                />

                <QuickAction
                  href="/calculations/compare"
                  icon={<GitCompare size={18} />}
                  title="Compare"
                  description="Compare two calculations"
                  accent="cyan"
                />

                <QuickAction
                  href="/batch"
                  icon={<Upload size={18} />}
                  title="Batch calculation"
                  description="Create calculations in bulk"
                  accent="violet"
                />

                <QuickAction
                  href="/exports"
                  icon={<FileDown size={18} />}
                  title="Export data"
                  description="Download your calculations"
                  accent="amber"
                />
              </div>

              {/* AI Feature */}

              <div className="relative mt-5 overflow-hidden rounded-xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.07] via-transparent to-cyan-400/[0.04] p-4">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/[0.08] blur-2xl" />

                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                    <Sparkles size={17} />
                  </div>

                  <h3 className="text-sm font-medium text-zinc-200">
                    AI Impact Reports
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                    Turn a completed calculation into
                    actionable environmental insights.
                  </p>

                  <Link
                    href="/ai-impact"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Explore AI Impact
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </section>

            {/* =================================================
                Bottom insight panel
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] xl:col-span-2">
              <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 md:flex-row md:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-300">
                    <BarChart3 size={20} />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-semibold text-white">
                      Your environmental workspace
                    </h2>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-600">
                      Create calculations, compare scenarios,
                      share results and generate AI-powered
                      impact reports from your saved data.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Capability
                    icon={<Calculator size={13} />}
                    text="Calculate"
                  />

                  <Capability
                    icon={<GitCompare size={13} />}
                    text="Compare"
                  />

                  <Capability
                    icon={<Share2 size={13} />}
                    text="Share"
                  />

                  <Capability
                    icon={<FileSpreadsheet size={13} />}
                    text="Export"
                  />

                  <Capability
                    icon={<Sparkles size={13} />}
                    text="AI"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =============================================================
   Metric Card
============================================================= */

function MetricCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.11] hover:bg-white/[0.035]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${iconClass}`}
        >
          {icon}
        </div>

        <TrendingUp
          size={15}
          className="text-zinc-700 transition-colors group-hover:text-zinc-500"
        />
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   Quick Action
============================================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent:
    | "emerald"
    | "cyan"
    | "violet"
    | "amber";
}) {
  const accentClasses = {
    emerald:
      "border-emerald-400/10 bg-emerald-400/[0.045] text-emerald-300",
    cyan:
      "border-cyan-400/10 bg-cyan-400/[0.045] text-cyan-300",
    violet:
      "border-violet-400/10 bg-violet-400/[0.045] text-violet-300",
    amber:
      "border-amber-400/10 bg-amber-400/[0.045] text-amber-300",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3 transition-all duration-200 hover:border-white/[0.09] hover:bg-white/[0.04]"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${accentClasses[accent]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-300 group-hover:text-white">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-zinc-600">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={14}
        className="text-zinc-700 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-400"
      />
    </Link>
  );
}

/* =============================================================
   Capability
============================================================= */

function Capability({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-zinc-500">
      {icon}
      {text}
    </span>
  );
}

/* =============================================================
   Loading Skeleton
============================================================= */

function CalculationSkeleton() {
  return (
    <div className="divide-y divide-white/[0.045]">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-5 py-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.05]" />

          <div className="flex-1">
            <div className="h-3 w-40 animate-pulse rounded bg-white/[0.05]" />

            <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-white/[0.035]" />
          </div>

          <div className="hidden h-3 w-20 animate-pulse rounded bg-white/[0.04] sm:block" />

          <div className="h-4 w-4 animate-pulse rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

/* =============================================================
   Empty State
============================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[310px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300">
        <Calculator size={24} strokeWidth={1.5} />
      </div>

      <h3 className="text-sm font-semibold text-zinc-200">
        No calculations yet
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-zinc-600">
        Start your first environmental calculation and
        your results will appear here.
      </p>

      <Link
        href="/calculations/new"
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-400 px-4 text-xs font-semibold text-[#04100a] transition-colors hover:bg-emerald-300"
      >
        <Plus size={14} />
        Create calculation
      </Link>
    </div>
  );
}

/* =============================================================
   Error State
============================================================= */

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[310px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.05] text-red-300">
        <RefreshCw size={20} />
      </div>

      <h3 className="text-sm font-semibold text-zinc-200">
        Couldn't load calculations
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-5 text-zinc-600">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}