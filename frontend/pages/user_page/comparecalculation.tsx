"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Cloud,
  Droplets,
  Flame,
  Gauge,
  Leaf,
  Loader2,
  RefreshCw,
  Server,
  TreePine,
  Trophy,
  Zap,
} from "lucide-react";

type SideInput = {
  facility_area_m2: string;
  gpu_model: string;
  gpu_count: string;
  hours_used: string;
  renewable_energy_percent: string;
};

type ComparisonPair = {
  metric: string;
  unit: string;
  left: number | null;
  right: number | null;
  delta: number | null;
  delta_percent: number | null;
};

type ComparisonResult = {
  left: Record<string, any>;
  right: Record<string, any>;
  pairs: ComparisonPair[];
};

type HistoryItem = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: any;
};

const emptySide = (): SideInput => ({
  facility_area_m2: "",
  gpu_model: "",
  gpu_count: "",
  hours_used: "",
  renewable_energy_percent: "",
});

const formatNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 2
) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(Number(value));
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${formatNumber(value, 2)}%`;
};

const getComparisonResult = (response: any): ComparisonResult | null => {
  /*
   * Our Next.js route now returns:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: {
   *      left: {...},
   *      right: {...},
   *      pairs: [...]
   *   }
   * }
   *
   * But this also supports the direct backend shape in case
   * the route is changed later.
   */

  const candidates = [
    response?.data,
    response,
    response?.data?.data,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      candidate.left &&
      candidate.right &&
      Array.isArray(candidate.pairs)
    ) {
      return candidate as ComparisonResult;
    }
  }

  return null;
};

const getHistoryItems = (response: any): HistoryItem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.calculations)) {
    return response.calculations;
  }

  if (Array.isArray(response?.data?.calculations)) {
    return response.data.calculations;
  }

  return [];
};

const getHistoryId = (item: HistoryItem) => {
  return item.id || item._id || "";
};

const getHistoryTitle = (item: HistoryItem, index: number) => {
  return (
    item.title ||
    item.name ||
    `Comparison ${index + 1}`
  );
};

const getHistoryDate = (item: HistoryItem) => {
  const date = item.created_at || item.createdAt;

  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/50 focus:bg-white/[0.065] focus:ring-2 focus:ring-emerald-400/10"
      />
    </div>
  );
}

function SideForm({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: SideInput;
  onChange: (next: SideInput) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
          <Server size={19} />
        </div>

        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-xs text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Facility area (m²)"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 1000"
          value={value.facility_area_m2}
          onChange={(v) =>
            onChange({
              ...value,
              facility_area_m2: v,
            })
          }
        />

        <InputField
          label="GPU model"
          placeholder="e.g. NVIDIA A100"
          value={value.gpu_model}
          onChange={(v) =>
            onChange({
              ...value,
              gpu_model: v,
            })
          }
        />

        <InputField
          label="GPU count"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 8"
          value={value.gpu_count}
          onChange={(v) =>
            onChange({
              ...value,
              gpu_count: v,
            })
          }
        />

        <InputField
          label="Hours used"
          type="number"
          min="0"
          step="0.1"
          placeholder="e.g. 24"
          value={value.hours_used}
          onChange={(v) =>
            onChange({
              ...value,
              hours_used: v,
            })
          }
        />

        <div className="sm:col-span-2">
          <InputField
            label="Renewable energy (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 40"
            value={value.renewable_energy_percent}
            onChange={(v) =>
              onChange({
                ...value,
                renewable_energy_percent: v,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  left,
  right,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  left: number | null | undefined;
  right: number | null | undefined;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="text-emerald-400">{icon}</span>
          {label}
        </div>

        <span className="text-xs text-zinc-600">{unit}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.035] p-3">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-zinc-600">
            Side A
          </p>
          <p className="text-xl font-semibold text-white">
            {formatNumber(left)}
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.035] p-3">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-zinc-600">
            Side B
          </p>
          <p className="text-xl font-semibold text-white">
            {formatNumber(right)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: any;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>

      <span className="text-sm font-medium text-white">
        {typeof value === "number"
          ? formatNumber(value)
          : value ?? "—"}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

function FacilityOverview({
  title,
  side,
}: {
  title: string;
  side: Record<string, any>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
          <Gauge size={17} />
        </div>

        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      <DetailItem label="GPU model" value={side?.gpu_model || "Not provided"} />
      <DetailItem label="GPU count" value={side?.gpu_count} />
      <DetailItem
        label="Capacity estimate"
        value={side?.capacity_estimate}
      />
      <DetailItem
        label="Renewable energy"
        value={side?.renewable_energy_percent}
        unit="%"
      />
    </div>
  );
}

function ComparisonTable({
  pairs,
}: {
  pairs: ComparisonPair[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">
            Detailed comparison
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-left">
              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Metric
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Side A
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Side B
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Difference
              </th>

              <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Change
              </th>
            </tr>
          </thead>

          <tbody>
            {pairs.map((pair, index) => {
              const increase =
                pair.delta_percent !== null &&
                pair.delta_percent > 0;

              return (
                <tr
                  key={`${pair.metric}-${pair.unit}-${index}`}
                  className="border-b border-white/[0.045] last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-200">
                      {pair.metric}
                    </div>

                    {pair.unit && (
                      <div className="mt-0.5 text-xs text-zinc-600">
                        {pair.unit}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4 font-medium text-white">
                    {formatNumber(pair.left)}
                  </td>

                  <td className="px-5 py-4 font-medium text-white">
                    {formatNumber(pair.right)}
                  </td>

                  <td className="px-5 py-4 text-zinc-300">
                    {formatNumber(pair.delta)}
                  </td>

                  <td className="px-5 py-4">
                    {pair.delta_percent === null ? (
                      <span className="text-zinc-600">—</span>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          increase
                            ? "bg-amber-400/10 text-amber-300"
                            : "bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {increase ? "+" : ""}
                        {formatNumber(pair.delta_percent)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultPanel({
  result,
}: {
  result: ComparisonResult;
}) {
  const left = result.left;
  const right = result.right;

  const metrics = [
    {
      label: "Total energy",
      icon: <Zap size={17} />,
      left: left?.energy_kwh?.total,
      right: right?.energy_kwh?.total,
      unit: "kWh",
    },
    {
      label: "IT energy",
      icon: <Server size={17} />,
      left: left?.energy_kwh?.it,
      right: right?.energy_kwh?.it,
      unit: "kWh",
    },
    {
      label: "Heat output",
      icon: <Flame size={17} />,
      left: left?.heat?.kwh,
      right: right?.heat?.kwh,
      unit: "kWh",
    },
    {
      label: "Water use",
      icon: <Droplets size={17} />,
      left: left?.water?.liters,
      right: right?.water?.liters,
      unit: "L",
    },
    {
      label: "CO₂ emissions",
      icon: <Cloud size={17} />,
      left: left?.co2_kg,
      right: right?.co2_kg,
      unit: "kg",
    },
    {
      label: "CO₂ without renewables",
      icon: <Leaf size={17} />,
      left: left?.co2_kg_without_renewables,
      right: right?.co2_kg_without_renewables,
      unit: "kg",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      {/* Result heading */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.09] via-white/[0.025] to-cyan-400/[0.05] p-6">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <CheckCircle2 size={14} />
              Comparison completed
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Environmental impact comparison
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Compare energy, heat, water, carbon emissions and
              environmental equivalences between both facilities.
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
            <ArrowLeftRight size={24} />
          </div>
        </div>
      </div>

      {/* Facility overview */}
      <div className="grid gap-5 lg:grid-cols-2">
        <FacilityOverview title="Side A" side={left} />
        <FacilityOverview title="Side B" side={right} />
      </div>

      {/* Main metrics */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Key metrics
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Direct values returned by the calculation engine.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              {...metric}
            />
          ))}
        </div>
      </div>

      {/* Detailed pairs */}
      {Array.isArray(result.pairs) && result.pairs.length > 0 && (
        <ComparisonTable pairs={result.pairs} />
      )}

      {/* Heat + Water */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-400/10 text-orange-300">
              <Flame size={17} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Heat output
              </h3>
              <p className="text-xs text-zinc-600">
                Thermal output from the facilities
              </p>
            </div>
          </div>

          <DetailItem
            label="Side A"
            value={left?.heat?.kwh}
            unit="kWh"
          />

          <DetailItem
            label="Side A"
            value={left?.heat?.mj}
            unit="MJ"
          />

          <DetailItem
            label="Side A"
            value={left?.heat?.btu}
            unit="BTU"
          />

          <div className="my-2 border-t border-white/[0.05]" />

          <DetailItem
            label="Side B"
            value={right?.heat?.kwh}
            unit="kWh"
          />

          <DetailItem
            label="Side B"
            value={right?.heat?.mj}
            unit="MJ"
          />

          <DetailItem
            label="Side B"
            value={right?.heat?.btu}
            unit="BTU"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
              <Droplets size={17} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Water usage
              </h3>
              <p className="text-xs text-zinc-600">
                Estimated water consumption
              </p>
            </div>
          </div>

          <DetailItem
            label="Side A liters"
            value={left?.water?.liters}
            unit="L"
          />

          <DetailItem
            label="Side A cubic meters"
            value={left?.water?.cubic_meters}
            unit="m³"
          />

          <div className="my-2 border-t border-white/[0.05]" />

          <DetailItem
            label="Side B liters"
            value={right?.water?.liters}
            unit="L"
          />

          <DetailItem
            label="Side B cubic meters"
            value={right?.water?.cubic_meters}
            unit="m³"
          />
        </div>
      </div>

      {/* Equivalences */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
            <Trophy size={17} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Environmental equivalences
            </h3>
            <p className="text-xs text-zinc-600">
              Backend-calculated real-world equivalences
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              Homes powered / day
            </p>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  left?.equivalences?.homes_powered_for_a_day
                )}
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  right?.equivalences?.homes_powered_for_a_day
                )}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              Cars off road / year
            </p>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  left?.equivalences?.cars_off_the_road_for_a_year,
                  4
                )}
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  right?.equivalences?.cars_off_the_road_for_a_year,
                  4
                )}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              One-way passenger flights
            </p>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  left?.equivalences?.flights_one_way_per_passenger
                )}
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="text-xl font-semibold text-white">
                {formatNumber(
                  right?.equivalences?.flights_one_way_per_passenger
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forest */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/10 text-green-300">
            <TreePine size={17} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Forest impact
            </h3>
            <p className="text-xs text-zinc-600">
              Land and tree equivalences
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              Hectares needed
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="font-semibold text-white">
                {formatNumber(left?.forest?.hectares_needed, 4)} ha
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="font-semibold text-white">
                {formatNumber(right?.forest?.hectares_needed, 4)} ha
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              Trees equivalent
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="font-semibold text-white">
                {formatNumber(left?.forest?.trees_equivalent)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="font-semibold text-white">
                {formatNumber(right?.forest?.trees_equivalent)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.025] p-4">
            <p className="text-xs text-zinc-600">
              Land cleared
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-600">A</span>
              <span className="font-semibold text-white">
                {formatNumber(
                  left?.forest?.land_cleared_hectares,
                  4
                )}{" "}
                ha
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-600">B</span>
              <span className="font-semibold text-white">
                {formatNumber(
                  right?.forest?.land_cleared_hectares,
                  4
                )}{" "}
                ha
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-400/10 text-zinc-300">
            <Gauge size={17} />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Calculation sources
            </h3>
            <p className="text-xs text-zinc-600">
              Constants used by the backend
            </p>
          </div>
        </div>

        <div className="grid gap-x-8 md:grid-cols-2">
          <DetailItem
            label="GPU TDP"
            value={left?.sources?.gpu_tdp_w}
            unit="W"
          />

          <DetailItem
            label="PUE"
            value={left?.sources?.pue}
          />

          <DetailItem
            label="WUE"
            value={left?.sources?.wue_l_per_kwh}
            unit="L/kWh"
          />

          <DetailItem
            label="Carbon intensity"
            value={left?.sources?.carbon_intensity_g_per_kwh}
            unit="g/kWh"
          />

          <DetailItem
            label="CO₂ / tree / year"
            value={left?.sources?.co2_per_tree_kg_year}
            unit="kg"
          />

          <DetailItem
            label="CO₂ / hectare / year"
            value={left?.sources?.co2_per_hectare_kg_year}
            unit="kg"
          />
        </div>
      </div>

      {/* Notes */}
      {((left?.notes?.length ?? 0) > 0 ||
        (right?.notes?.length ?? 0) > 0) && (
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
          <div className="mb-3 flex items-center gap-2 text-amber-300">
            <CircleAlert size={17} />
            <h3 className="font-semibold">Calculation notes</h3>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            {[...(left?.notes || []), ...(right?.notes || [])].map(
              (note: any, index: number) => (
                <p key={index}>• {String(note)}</p>
              )
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function CompareCalculationPage() {
  const [left, setLeft] = useState<SideInput>(emptySide());
  const [right, setRight] = useState<SideInput>(emptySide());

  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canSubmit = useMemo(() => {
    return (
      left.facility_area_m2.trim() !== "" &&
      left.gpu_model.trim() !== "" &&
      left.gpu_count.trim() !== "" &&
      left.hours_used.trim() !== "" &&
      left.renewable_energy_percent.trim() !== "" &&
      right.facility_area_m2.trim() !== "" &&
      right.gpu_model.trim() !== "" &&
      right.gpu_count.trim() !== "" &&
      right.hours_used.trim() !== "" &&
      right.renewable_energy_percent.trim() !== ""
    );
  }, [left, right]);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        "/api/calculations/comparision/get",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.detail ||
            `Request failed with status ${response.status}`
        );
      }

      setHistory(getHistoryItems(data));
    } catch (err) {
      console.error("[comparison] History error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setComparisonResult(null);

    if (!canSubmit) {
      setError("Please fill in all comparison fields.");
      return;
    }

    const leftFacility = Number(left.facility_area_m2);
    const leftGpuCount = Number(left.gpu_count);
    const leftHours = Number(left.hours_used);
    const leftRenewable = Number(
      left.renewable_energy_percent
    );

    const rightFacility = Number(right.facility_area_m2);
    const rightGpuCount = Number(right.gpu_count);
    const rightHours = Number(right.hours_used);
    const rightRenewable = Number(
      right.renewable_energy_percent
    );

    if (
      [
        leftFacility,
        leftGpuCount,
        leftHours,
        leftRenewable,
        rightFacility,
        rightGpuCount,
        rightHours,
        rightRenewable,
      ].some((value) => Number.isNaN(value))
    ) {
      setError("Please enter valid numeric values.");
      return;
    }

    if (
      leftRenewable < 0 ||
      leftRenewable > 100 ||
      rightRenewable < 0 ||
      rightRenewable > 100
    ) {
      setError(
        "Renewable energy percentage must be between 0 and 100."
      );
      return;
    }

    const payload = {
      left: {
        facility_area_m2: leftFacility,
        gpu_model: left.gpu_model.trim(),
        gpu_count: leftGpuCount,
        hours_used: leftHours,
        renewable_energy_percent: leftRenewable,
      },
      right: {
        facility_area_m2: rightFacility,
        gpu_model: right.gpu_model.trim(),
        gpu_count: rightGpuCount,
        hours_used: rightHours,
        renewable_energy_percent: rightRenewable,
      },
    };

    try {
      setLoading(true);

      console.log("[browser] Comparison request:", payload);

      const response = await fetch(
        "/api/calculations/comparision/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      console.log("[browser] Comparison response:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.detail ||
            data?.error ||
            `Request failed with status ${response.status}`
        );
      }

      /*
       * IMPORTANT:
       *
       * The Next.js route returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     left: ...,
       *     right: ...,
       *     pairs: ...
       *   }
       * }
       *
       * So extractComparisonResult(data) reads data.data.
       */
      const result = getComparisonResult(data);

      if (!result) {
        console.error(
          "[browser] Unexpected comparison response:",
          data
        );

        throw new Error(
          "Comparison was created, but the response did not contain left, right and pairs data."
        );
      }

      console.log(
        "[browser] Parsed comparison result:",
        result
      );

      setComparisonResult(result);
      setSuccessMessage(
        "Comparison created successfully."
      );

      await loadHistory();
    } catch (err) {
      console.error("[browser] Create comparison error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create comparison."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
            <ArrowLeftRight size={14} />
            Environmental comparison
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Compare calculations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Enter two facility configurations and compare
                their environmental impact using the calculation
                engine.
              </p>
            </div>

            <button
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  historyLoading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            {!comparisonResult && (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <SideForm
                    title="Side A"
                    subtitle="First facility configuration"
                    value={left}
                    onChange={setLeft}
                  />

                  <SideForm
                    title="Side B"
                    subtitle="Second facility configuration"
                    value={right}
                    onChange={setRight}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
                    <CircleAlert
                      size={18}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300">
                    <CheckCircle2
                      size={18}
                      className="shrink-0"
                    />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight size={17} />
                        Create comparison
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {comparisonResult && (
              <div>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setComparisonResult(null);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
                  >
                    <ChevronRight
                      size={15}
                      className="rotate-180"
                    />
                    New comparison
                  </button>
                </div>

                <ResultPanel result={comparisonResult} />
              </div>
            )}
          </section>

          {/* History */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] xl:sticky xl:top-6">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">
                    Recent comparisons
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your previous calculations
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-500">
                  <BarChart3 size={17} />
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto p-3">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10 text-zinc-600">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                </div>
              ) : history.length === 0 ? (
                <div className="px-3 py-10 text-center">
                  <BarChart3
                    size={25}
                    className="mx-auto mb-3 text-zinc-700"
                  />

                  <p className="text-sm text-zinc-500">
                    No comparisons yet
                  </p>

                  <p className="mt-1 text-xs text-zinc-700">
                    Your created comparisons will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {history.map((item, index) => (
                    <button
                      type="button"
                      key={
                        getHistoryId(item) ||
                        `${index}-${getHistoryTitle(
                          item,
                          index
                        )}`
                      }
                      className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.045]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-300 group-hover:text-white">
                          {getHistoryTitle(item, index)}
                        </p>

                        {getHistoryDate(item) && (
                          <p className="mt-1 text-xs text-zinc-700">
                            {getHistoryDate(item)}
                          </p>
                        )}
                      </div>

                      <ChevronRight
                        size={15}
                        className="shrink-0 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}