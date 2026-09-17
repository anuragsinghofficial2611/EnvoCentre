"use client";

import {
  FormEvent,
  ReactNode,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cloud,
  Cpu,
  Droplets,
  Factory,
  Gauge,
  Globe2,
  Leaf,
  Loader2,
  RefreshCw,
  RotateCcw,
  Server,
  Sparkles,
  Trees,
  Waves,
  Zap,
} from "lucide-react";

/* ========================================================================== */
/* GPU MODELS                                                                 */
/* ========================================================================== */

const gpuModels = [
  "NVIDIA A100",
  "NVIDIA A100 40GB",
  "NVIDIA A100 80GB",
  "NVIDIA A40",
  "NVIDIA B100",
  "NVIDIA B200",
  "NVIDIA GB200 NVL72",
  "NVIDIA H100 PCIe",
  "NVIDIA H100 SXM",
  "NVIDIA H200 PCIe",
  "NVIDIA H200 SXM",
  "NVIDIA L40",
  "NVIDIA L40S",
  "NVIDIA RTX 4080",
  "NVIDIA RTX 4080 SUPER",
  "NVIDIA RTX 4090",
  "NVIDIA RTX A6000",
  "AMD MI100",
  "AMD MI210",
  "AMD MI250X",
  "AMD MI300A",
  "AMD MI300X",
  "AMD MI325X",
  "AMD MI350X",
  "AWS INFERENTIA",
  "AWS INFERENTIA2",
  "AWS TRAINIUM",
  "AWS TRAINIUM2",
  "GOOGLE TPU V5E",
  "GOOGLE TPU V5P",
];

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type CalculationInput = {
  facility_area_m2: number;
  gpu_model: string;
  gpu_count: number;
  hours_used: number;
  renewable_energy_percent: number;
};

type Equivalences = {
  homes_powered_for_a_day: number;
  cars_off_the_road_for_a_year: number;
  flights_one_way_per_passenger: number;
};

type Heat = {
  kwh: number;
  mj: number;
  btu: number;
};

type Water = {
  liters: number;
  cubic_meters: number;
};

type Energy = {
  it: number;
  total: number;
};

type Forest = {
  hectares_needed: number;
  trees_equivalent: number;
  land_cleared_hectares: number;
};

type Sources = {
  gpu_tdp_w: number;
  pue: number;
  wue_l_per_kwh: number;
  carbon_intensity_g_per_kwh: number;
  co2_per_tree_kg_year: number;
  co2_per_hectare_kg_year: number;
};

type Impact = {
  energy_kwh: Energy;
  heat: Heat;
  water: Water;
  co2_kg: number;
  co2_kg_without_renewables: number;
  renewable_energy_percent: number;
  equivalences: Equivalences;
  forest: Forest;
  capacity_estimate: number;
  sources: Sources;
  notes: string[];
};

type CalculationResult = {
  id: number;
  user_id: number;
  facility_area_m2: number;
  gpu_model: string;
  gpu_count: number;
  hours_used: number;
  renewable_energy_percent: number;
  impact: Impact;
  created_at: string;
  updated_at: string;
};

type BatchTotals = {
  it_energy_kwh: number;
  total_energy_kwh: number;
  heat_kwh: number;
  heat_mj: number;
  heat_btu: number;
  water_liters: number;
  water_cubic_meters: number;
  co2_kg: number;
  forest_hectares: number;
  trees_equivalent: number;
  equivalences: Equivalences;
};

type BatchResponse = {
  items: CalculationResult[];
  totals: BatchTotals;
  count: number;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const createEmptyItem = (): CalculationInput => ({
  facility_area_m2: 0,
  gpu_model: "",
  gpu_count: 1,
  hours_used: 1,
  renewable_energy_percent: 0,
});

function formatNumber(
  value: number,
  maximumFractionDigits = 2
) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits,
  });
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getErrorMessage(
  data: unknown,
  status: number
) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.detail === "string") {
      return obj.detail;
    }

    if (typeof obj.message === "string") {
      return obj.message;
    }

    if (Array.isArray(obj.detail)) {
      return obj.detail
        .map((error) => {
          if (
            !error ||
            typeof error !== "object"
          ) {
            return String(error);
          }

          const item =
            error as Record<string, unknown>;

          const location = Array.isArray(item.loc)
            ? item.loc.join(" → ")
            : "";

          const message =
            typeof item.msg === "string"
              ? item.msg
              : "Invalid value";

          return location
            ? `${location}: ${message}`
            : message;
        })
        .join("\n");
    }
  }

  return `Request failed with status ${status}`;
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default function BatchCalculationsPage() {
  const [items, setItems] = useState<
    CalculationInput[]
  >([createEmptyItem()]);

  const [loading, setLoading] = useState(false);

  const [response, setResponse] =
    useState<BatchResponse | null>(null);

  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* UPDATE ITEM                                                              */
  /* ------------------------------------------------------------------------ */

  const updateItem = <
    K extends keyof CalculationInput
  >(
    index: number,
    field: K,
    value: CalculationInput[K]
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  /* ------------------------------------------------------------------------ */
  /* ADD ITEM                                                                 */
  /* ------------------------------------------------------------------------ */

  const addItem = () => {
    setItems((current) => [
      ...current,
      createEmptyItem(),
    ]);
  };

  /* ------------------------------------------------------------------------ */
  /* REMOVE ITEM                                                              */
  /* ------------------------------------------------------------------------ */

  const removeItem = (index: number) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  };

  /* ------------------------------------------------------------------------ */
  /* RESET                                                                     */
  /* ------------------------------------------------------------------------ */

  const resetForm = () => {
    setItems([createEmptyItem()]);
    setResponse(null);
    setError("");
  };

  /* ------------------------------------------------------------------------ */
  /* VALIDATION                                                               */
  /* ------------------------------------------------------------------------ */

  const validateItems = () => {
    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      if (!item.gpu_model) {
        return `Please select a GPU model for calculation ${
          index + 1
        }.`;
      }

      if (item.facility_area_m2 <= 0) {
        return `Facility area must be greater than 0 for calculation ${
          index + 1
        }.`;
      }

      if (item.gpu_count <= 0) {
        return `GPU count must be greater than 0 for calculation ${
          index + 1
        }.`;
      }

      if (item.hours_used <= 0) {
        return `Hours used must be greater than 0 for calculation ${
          index + 1
        }.`;
      }

      if (
        item.renewable_energy_percent < 0 ||
        item.renewable_energy_percent > 100
      ) {
        return `Renewable energy percentage must be between 0 and 100 for calculation ${
          index + 1
        }.`;
      }
    }

    return "";
  };

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setResponse(null);

    const validationError =
      validateItems();

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * IMPORTANT:
     *
     * This request goes to the Next.js server route:
     *
     * /api/calculations/batch
     *
     * NOT directly to FastAPI.
     *
     * The HttpOnly access_token cookie is automatically
     * included with credentials: "include".
     */

    const payload = {
      items: items.map((item) => ({
        facility_area_m2: Number(
          item.facility_area_m2
        ),
        gpu_model: item.gpu_model,
        gpu_count: Number(item.gpu_count),
        hours_used: Number(item.hours_used),
        renewable_energy_percent: Number(
          item.renewable_energy_percent
        ),
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(
        "/api/calculations/batch",
        {
          method: "POST",

          credentials: "include",

          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const contentType =
        res.headers.get("content-type") || "";

      let data: unknown;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        throw new Error(
          getErrorMessage(
            data,
            res.status
          )
        );
      }

      setResponse(
        data as BatchResponse
      );
    } catch (err) {
      console.error(
        "[browser] Batch calculation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the batch."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-[#06100c] text-slate-100">
      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-15%] h-[430px] w-[430px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />

        <div className="absolute right-[5%] top-[25%] h-[380px] w-[380px] rounded-full bg-cyan-400/[0.045] blur-[120px]" />

        <div className="absolute bottom-[-15%] left-[40%] h-[400px] w-[400px] rounded-full bg-emerald-400/[0.035] blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="mb-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Batch workspace
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Create calculations in bulk
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Configure multiple GPU workloads
                and calculate their environmental
                impact in a single batch.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5">
              <Server className="h-4 w-4 text-cyan-300" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Request type
                </p>

                <p className="text-xs font-medium text-slate-200">
                  Bulk calculation
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================================================================ */}
        {/* FORM + SIDEBAR                                                    */}
        {/* ================================================================ */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)]">
          {/* ============================================================ */}
          {/* FORM                                                          */}
          {/* ============================================================ */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.08,
            }}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a1711]/80 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            {/* Form header */}
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                    <Activity className="h-5 w-5 text-emerald-300" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Calculation inputs
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Every row becomes one
                      calculation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400/35 hover:bg-emerald-400/[0.13]"
                >
                  <PlusIcon />
                  Add calculation
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-4 sm:p-6">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      layout
                      initial={{
                        opacity: 0,
                        y: 12,
                        scale: 0.985,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        scale: 0.985,
                      }}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 sm:p-5"
                    >
                      {/* Calculation title */}
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-xs font-bold text-emerald-300">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-200">
                              Calculation{" "}
                              {index + 1}
                            </h3>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                              GPU workload
                              configuration
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          disabled={
                            items.length === 1
                          }
                          className="rounded-lg border border-white/[0.06] p-2 text-slate-500 transition hover:border-red-400/20 hover:bg-red-400/[0.06] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Facility area */}
                        <InputField
                          label="Facility area"
                          unit="m²"
                          icon={
                            <Factory className="h-4 w-4" />
                          }
                          type="number"
                          min="0"
                          step="any"
                          value={
                            item.facility_area_m2 ===
                            0
                              ? ""
                              : item.facility_area_m2
                          }
                          placeholder="e.g. 120"
                          onChange={(event) =>
                            updateItem(
                              index,
                              "facility_area_m2",
                              Number(
                                event.target
                                  .value
                              )
                            )
                          }
                        />

                        {/* GPU MODEL SELECT */}
                        <SelectField
                          label="GPU model"
                          icon={
                            <Cpu className="h-4 w-4" />
                          }
                          value={
                            item.gpu_model
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "gpu_model",
                              event.target.value
                            )
                          }
                          options={
                            gpuModels
                          }
                          placeholder="Select GPU model"
                        />

                        {/* GPU COUNT */}
                        <InputField
                          label="GPU count"
                          unit="GPUs"
                          icon={
                            <Gauge className="h-4 w-4" />
                          }
                          type="number"
                          min="1"
                          step="1"
                          value={
                            item.gpu_count
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "gpu_count",
                              Number(
                                event.target
                                  .value
                              )
                            )
                          }
                        />

                        {/* HOURS */}
                        <InputField
                          label="Hours used"
                          unit="hours"
                          icon={
                            <Clock3 className="h-4 w-4" />
                          }
                          type="number"
                          min="0"
                          step="any"
                          value={
                            item.hours_used
                          }
                          onChange={(event) =>
                            updateItem(
                              index,
                              "hours_used",
                              Number(
                                event.target
                                  .value
                              )
                            )
                          }
                        />

                        {/* RENEWABLE */}
                        <div className="md:col-span-2">
                          <InputField
                            label="Renewable energy"
                            unit="%"
                            icon={
                              <Leaf className="h-4 w-4" />
                            }
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            value={
                              item.renewable_energy_percent
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                index,
                                "renewable_energy_percent",
                                Number(
                                  event.target
                                    .value
                                )
                              )
                            }
                          />

                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                            <motion.div
                              animate={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    item.renewable_energy_percent
                                  )
                                )}%`,
                              }}
                              className="h-full rounded-full bg-emerald-400/70"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add another */}
                <button
                  type="button"
                  onClick={addItem}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.015] py-4 text-xs font-medium text-slate-400 transition hover:border-emerald-400/25 hover:bg-emerald-400/[0.025] hover:text-emerald-300"
                >
                  <PlusIcon />
                  Add another calculation
                </button>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] p-4">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />

                        <div>
                          <p className="text-xs font-semibold text-red-200">
                            Unable to create
                            batch
                          </p>

                          <p className="mt-1 whitespace-pre-line text-xs leading-5 text-red-300/75">
                            {error}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-xs font-bold text-[#04100a] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating batch...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Create batch

                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.section>

          {/* ============================================================ */}
          {/* SIDEBAR                                                       */}
          {/* ============================================================ */}

          <div className="space-y-6">
            <motion.div
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.15,
              }}
              className="rounded-2xl border border-white/[0.08] bg-[#0a1711]/80 p-5 backdrop-blur-xl"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06]">
                  <BarChart3 className="h-4 w-4 text-cyan-300" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Batch overview
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Current request
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <MiniStat
                  label="Calculations"
                  value={items.length.toString()}
                  icon={<Server />}
                />

                <MiniStat
                  label="Input parameters"
                  value="5 / item"
                  icon={<Activity />}
                />

                <MiniStat
                  label="GPU models"
                  value={`${gpuModels.length} allowed`}
                  icon={<Cpu />}
                />

                <MiniStat
                  label="API operation"
                  value="Create batch"
                  icon={<Zap />}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.22,
              }}
              className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.06] to-cyan-400/[0.025] p-5"
            >
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300" />

                <span className="text-xs font-semibold text-emerald-200">
                  What happens after submission
                </span>
              </div>

              <div className="space-y-4">
                <InfoStep
                  number="01"
                  title="Batch request"
                  description="All configured calculation items are submitted together."
                />

                <InfoStep
                  number="02"
                  title="Impact calculation"
                  description="The backend calculates energy, heat, water, CO₂ and environmental equivalences."
                />

                <InfoStep
                  number="03"
                  title="Aggregated result"
                  description="The API returns individual calculations together with batch totals."
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RESULTS                                                           */}
        {/* ================================================================ */}

        <AnimatePresence>
          {response && (
            <motion.div
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="mt-7 space-y-6"
            >
              {/* ======================================================== */}
              {/* SUCCESS HEADER                                             */}
              {/* ======================================================== */}

              <section className="overflow-hidden rounded-2xl border border-emerald-400/15 bg-[#0a1711]/90 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
                <div className="flex flex-col gap-5 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.08]">
                      <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">
                          Batch created
                          successfully
                        </h2>

                        <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                          Success
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {response.count} calculation
                        {response.count === 1
                          ? ""
                          : "s"} returned by
                        the backend.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setResponse(null)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Clear result
                  </button>
                </div>

                {/* ====================================================== */}
                {/* TOTALS                                                   */}
                {/* ====================================================== */}

                <div className="p-5 sm:p-6">
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-emerald-300" />

                      <h3 className="text-sm font-semibold text-white">
                        Batch environmental
                        impact
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Aggregated from the API&apos;s{" "}
                      <span className="font-mono text-slate-400">
                        totals
                      </span>{" "}
                      object.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <ImpactMetric
                      icon={<Zap />}
                      label="IT energy"
                      value={`${formatNumber(
                        response.totals
                          .it_energy_kwh
                      )} kWh`}
                    />

                    <ImpactMetric
                      icon={<Activity />}
                      label="Total energy"
                      value={`${formatNumber(
                        response.totals
                          .total_energy_kwh
                      )} kWh`}
                      highlight
                    />

                    <ImpactMetric
                      icon={<Factory />}
                      label="Heat"
                      value={`${formatNumber(
                        response.totals.heat_kwh
                      )} kWh`}
                    />

                    <ImpactMetric
                      icon={<Droplets />}
                      label="Water"
                      value={`${formatNumber(
                        response.totals
                          .water_liters
                      )} L`}
                    />

                    <ImpactMetric
                      icon={<Cloud />}
                      label="CO₂"
                      value={`${formatNumber(
                        response.totals.co2_kg
                      )} kg`}
                    />

                    <ImpactMetric
                      icon={<Trees />}
                      label="Trees equivalent"
                      value={formatNumber(
                        response.totals
                          .trees_equivalent
                      )}
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <SecondaryMetric
                      label="Heat"
                      value={`${formatNumber(
                        response.totals
                          .heat_mj
                      )} MJ`}
                    />

                    <SecondaryMetric
                      label="Heat"
                      value={`${formatNumber(
                        response.totals
                          .heat_btu
                      )} BTU`}
                    />

                    <SecondaryMetric
                      label="Water"
                      value={`${formatNumber(
                        response.totals
                          .water_cubic_meters,
                        4
                      )} m³`}
                    />

                    <SecondaryMetric
                      label="Forest"
                      value={`${formatNumber(
                        response.totals
                          .forest_hectares,
                        4
                      )} ha`}
                    />
                  </div>
                </div>
              </section>

              {/* ======================================================== */}
              {/* EQUIVALENCES                                               */}
              {/* ======================================================== */}

              <section className="rounded-2xl border border-white/[0.08] bg-[#0a1711]/85 p-5 backdrop-blur-xl sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-emerald-300" />

                    <h3 className="text-sm font-semibold text-white">
                      Environmental
                      equivalences
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Equivalences returned by the
                    batch calculation.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <EquivalenceCard
                    icon={<Activity />}
                    label="Homes powered for a day"
                    value={formatNumber(
                      response.totals
                        .equivalences
                        .homes_powered_for_a_day
                    )}
                  />

                  <EquivalenceCard
                    icon={<Cloud />}
                    label="Cars off the road for a year"
                    value={formatNumber(
                      response.totals
                        .equivalences
                        .cars_off_the_road_for_a_year
                    )}
                  />

                  <EquivalenceCard
                    icon={<Globe2 />}
                    label="One-way passenger flights"
                    value={formatNumber(
                      response.totals
                        .equivalences
                        .flights_one_way_per_passenger
                    )}
                  />
                </div>
              </section>

              {/* ======================================================== */}
              {/* INDIVIDUAL RESULTS                                        */}
              {/* ======================================================== */}

              <section>
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-cyan-300" />

                      <h3 className="text-sm font-semibold text-white">
                        Individual calculations
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Detailed results returned for
                      each item in the batch.
                    </p>
                  </div>

                  <span className="w-fit rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400">
                    {response.items.length} result
                    {response.items.length ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <div className="space-y-4">
                  {response.items.map(
                    (
                      calculation,
                      index
                    ) => (
                      <CalculationResultCard
                        key={
                          calculation.id ??
                          index
                        }
                        calculation={
                          calculation
                        }
                        index={index}
                      />
                    )
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ========================================================================== */
/* SELECT FIELD                                                               */
/* ========================================================================== */

function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          <span className="text-slate-500">
            {icon}
          </span>

          {label}
        </span>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#09130e] px-3.5 pr-10 text-sm text-slate-100 outline-none transition hover:border-white/[0.12] focus:border-emerald-400/35 focus:bg-white/[0.025] focus:ring-2 focus:ring-emerald-400/[0.06]"
        >
          <option
            value=""
            disabled
            className="bg-[#09130e] text-slate-500"
          >
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-[#09130e] text-slate-100"
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}

/* ========================================================================== */
/* INPUT FIELD                                                                */
/* ========================================================================== */

function InputField({
  label,
  unit,
  icon,
  type,
  value,
  placeholder,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit?: string;
  icon: ReactNode;
  type: "text" | "number";
  value: string | number;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          <span className="text-slate-500">
            {icon}
          </span>

          {label}
        </span>

        {unit && (
          <span className="text-[10px] font-medium text-slate-600">
            {unit}
          </span>
        )}
      </div>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/10 px-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 hover:border-white/[0.12] focus:border-emerald-400/35 focus:bg-white/[0.025] focus:ring-2 focus:ring-emerald-400/[0.06]"
      />
    </label>
  );
}

/* ========================================================================== */
/* RESULT CARD                                                                */
/* ========================================================================== */

function CalculationResultCard({
  calculation,
  index,
}: {
  calculation: CalculationResult;
  index: number;
}) {
  const [expanded, setExpanded] =
    useState(true);

  const impact = calculation.impact;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
      }}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a1711]/85 shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() =>
          setExpanded((value) => !value)
        }
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.018] sm:p-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] text-xs font-bold text-cyan-300">
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-white">
                {calculation.gpu_model}
              </h4>

              <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 font-mono text-[9px] text-slate-500">
                ID #{calculation.id}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              {calculation.gpu_count} GPU
              {calculation.gpu_count ===
              1
                ? ""
                : "s"}{" "}
              ·{" "}
              {formatNumber(
                calculation.hours_used
              )}{" "}
              hours ·{" "}
              {formatNumber(
                calculation.renewable_energy_percent
              )}
              % renewable
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            expanded
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.07] p-5 sm:p-6">
              {/* Inputs */}
              <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultInput
                  label="Facility area"
                  value={`${formatNumber(
                    calculation.facility_area_m2
                  )} m²`}
                />

                <ResultInput
                  label="GPU model"
                  value={
                    calculation.gpu_model
                  }
                />

                <ResultInput
                  label="GPU count"
                  value={formatNumber(
                    calculation.gpu_count
                  )}
                />

                <ResultInput
                  label="Hours used"
                  value={formatNumber(
                    calculation.hours_used
                  )}
                />
              </div>

              {/* Energy */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-300" />

                  <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Energy & resource
                    impact
                  </h5>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ImpactMetric
                    icon={<Zap />}
                    label="IT energy"
                    value={`${formatNumber(
                      impact.energy_kwh
                        .it
                    )} kWh`}
                  />

                  <ImpactMetric
                    icon={<Activity />}
                    label="Total energy"
                    value={`${formatNumber(
                      impact.energy_kwh
                        .total
                    )} kWh`}
                    highlight
                  />

                  <ImpactMetric
                    icon={<Droplets />}
                    label="Water"
                    value={`${formatNumber(
                      impact.water
                        .liters
                    )} L`}
                  />

                  <ImpactMetric
                    icon={<Cloud />}
                    label="CO₂"
                    value={`${formatNumber(
                      impact.co2_kg
                    )} kg`}
                  />
                </div>
              </div>

              {/* Heat */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Waves className="h-4 w-4 text-cyan-300" />

                  <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Heat generation
                  </h5>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailMetric
                    label="kWh"
                    value={`${formatNumber(
                      impact.heat.kwh
                    )} kWh`}
                  />

                  <DetailMetric
                    label="Megajoules"
                    value={`${formatNumber(
                      impact.heat.mj
                    )} MJ`}
                  />

                  <DetailMetric
                    label="BTU"
                    value={formatNumber(
                      impact.heat.btu
                    )}
                  />
                </div>
              </div>

              {/* Carbon */}
              <div className="mb-6 grid gap-3 lg:grid-cols-2">
                <CarbonCard
                  label="CO₂ with renewable adjustment"
                  value={`${formatNumber(
                    impact.co2_kg
                  )} kg`}
                />

                <CarbonCard
                  label="CO₂ without renewable energy"
                  value={`${formatNumber(
                    impact.co2_kg_without_renewables
                  )} kg`}
                />
              </div>

              {/* Forest */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Trees className="h-4 w-4 text-emerald-300" />

                  <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Forest impact
                  </h5>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailMetric
                    label="Hectares needed"
                    value={`${formatNumber(
                      impact.forest
                        .hectares_needed,
                      4
                    )} ha`}
                  />

                  <DetailMetric
                    label="Trees equivalent"
                    value={formatNumber(
                      impact.forest
                        .trees_equivalent
                    )}
                  />

                  <DetailMetric
                    label="Land cleared"
                    value={`${formatNumber(
                      impact.forest
                        .land_cleared_hectares,
                      4
                    )} ha`}
                  />
                </div>
              </div>

              {/* Equivalences */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-cyan-300" />

                  <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Equivalences
                  </h5>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <EquivalenceCard
                    icon={<Activity />}
                    label="Homes / day"
                    value={formatNumber(
                      impact
                        .equivalences
                        .homes_powered_for_a_day
                    )}
                  />

                  <EquivalenceCard
                    icon={<Cloud />}
                    label="Cars / year"
                    value={formatNumber(
                      impact
                        .equivalences
                        .cars_off_the_road_for_a_year
                    )}
                  />

                  <EquivalenceCard
                    icon={<Globe2 />}
                    label="One-way flights"
                    value={formatNumber(
                      impact
                        .equivalences
                        .flights_one_way_per_passenger
                    )}
                  />
                </div>
              </div>

              {/* Sources */}
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-400" />

                  <h5 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Calculation sources
                  </h5>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <SourceValue
                    label="GPU TDP"
                    value={`${formatNumber(
                      impact.sources
                        .gpu_tdp_w
                    )} W`}
                  />

                  <SourceValue
                    label="PUE"
                    value={formatNumber(
                      impact.sources
                        .pue,
                      4
                    )}
                  />

                  <SourceValue
                    label="WUE"
                    value={`${formatNumber(
                      impact.sources
                        .wue_l_per_kwh,
                      4
                    )} L/kWh`}
                  />

                  <SourceValue
                    label="Carbon intensity"
                    value={`${formatNumber(
                      impact.sources
                        .carbon_intensity_g_per_kwh,
                      2
                    )} g/kWh`}
                  />

                  <SourceValue
                    label="CO₂ / tree / year"
                    value={`${formatNumber(
                      impact.sources
                        .co2_per_tree_kg_year,
                      2
                    )} kg`}
                  />

                  <SourceValue
                    label="CO₂ / hectare / year"
                    value={`${formatNumber(
                      impact.sources
                        .co2_per_hectare_kg_year,
                      2
                    )} kg`}
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-cyan-300" />

                    <span className="text-xs font-medium text-slate-400">
                      Capacity estimate
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-white">
                    {formatNumber(
                      impact.capacity_estimate,
                      4
                    )}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {impact.notes &&
                impact.notes.length > 0 && (
                  <div className="mb-6 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-300" />

                      <span className="text-xs font-semibold text-emerald-200">
                        Calculation notes
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {impact.notes.map(
                        (
                          note,
                          noteIndex
                        ) => (
                          <li
                            key={
                              noteIndex
                            }
                            className="flex gap-2 text-xs leading-5 text-slate-400"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/60" />

                            <span>
                              {note}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {/* Metadata */}
              <div className="grid gap-3 border-t border-white/[0.06] pt-4 text-[10px] text-slate-600 sm:grid-cols-2">
                <div>
                  Created:{" "}
                  <span className="text-slate-500">
                    {formatDate(
                      calculation.created_at
                    )}
                  </span>
                </div>

                <div className="sm:text-right">
                  Updated:{" "}
                  <span className="text-slate-500">
                    {formatDate(
                      calculation.updated_at
                    )}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* ========================================================================== */
/* UI COMPONENTS                                                              */
/* ========================================================================== */

function ImpactMetric({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-emerald-400/15 bg-emerald-400/[0.045]"
          : "border-white/[0.06] bg-white/[0.018]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={
            highlight
              ? "text-emerald-300"
              : "text-slate-500"
          }
        >
          {icon}
        </span>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-base font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function SecondaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ResultInput({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

function SourceValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-400">
        {value}
      </p>
    </div>
  );
}

function CarbonCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function EquivalenceCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
      <div className="mb-3 text-emerald-300">
        {icon}
      </div>

      <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.018] px-3 py-3">
      <div className="flex items-center gap-2.5">
        <span className="text-slate-600">
          {icon}
        </span>

        <span className="text-xs text-slate-400">
          {label}
        </span>
      </div>

      <span className="text-xs font-semibold text-slate-200">
        {value}
      </span>
    </div>
  );
}

function InfoStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[9px] font-bold text-emerald-300">
        {number}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <span className="text-base leading-none">
      +
    </span>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}