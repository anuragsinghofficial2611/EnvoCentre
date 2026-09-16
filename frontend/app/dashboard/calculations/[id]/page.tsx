"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Calculator,
  CalendarDays,
  Car,
  CheckCircle2,
  Cloud,
  Droplets,
  Gauge,
  Globe2,
  Home,
  Info,
  Leaf,
  Map,
  Server,
  Sparkles,
  TreePine,
  Trees,
  Waves,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

type AIImpactResponse = {
  calculation_id: number;
  model: string;
  analysis: string;
  generated_at: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 2,
) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(value)
  ) {
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

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CalculationDetailPage() {
  const params = useParams();

  const id = params?.id;

  const [calculation, setCalculation] =
    useState<Calculation | null>(null);

  const [aiImpact, setAiImpact] =
    useState<AIImpactResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Fetch calculation + AI analysis                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!id) return;

    const fetchCalculation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/calculations/getcalculation/${id}`,
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

        console.log(
          "Calculation detail response:",
          data,
        );

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

        const result =
          data?.data && !Array.isArray(data.data)
            ? data.data
            : data;

        if (
          !result ||
          typeof result !== "object"
        ) {
          throw new Error(
            "Calculation data was not returned by the server.",
          );
        }

        setCalculation(result);
      } catch (err) {
        console.error(
          "Calculation detail error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load calculation.",
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchAIImpact = async () => {
      try {
        setAiLoading(true);
        setAiError("");

        /*
         * This frontend request goes to our Next.js API route.
         * That route proxies the request to:
         *
         * POST /api/v1/calculations/{calc_id}/ai-impact
         */

        const response = await fetch(
          `/api/calculations/getcalculation/${id}/ai-impact`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        const data = await response.json().catch(() => null);

        console.log(
          "AI impact response:",
          data,
        );

        if (!response.ok) {
          let message = `AI analysis request failed with status ${response.status}`;

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

        const result =
          data?.data && !Array.isArray(data.data)
            ? data.data
            : data;

        if (
          !result ||
          typeof result !== "object"
        ) {
          throw new Error(
            "AI analysis was not returned by the server.",
          );
        }

        setAiImpact(result);
      } catch (err) {
        console.error(
          "AI impact error:",
          err,
        );

        setAiError(
          err instanceof Error
            ? err.message
            : "Unable to generate AI analysis.",
        );
      } finally {
        setAiLoading(false);
      }
    };

    /*
     * Run both requests independently.
     *
     * This means the calculation can finish loading even
     * if the AI request takes longer.
     */

    fetchCalculation();
    fetchAIImpact();
  }, [id]);

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return <DetailLoading />;
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error || !calculation) {
    return (
      <main className="min-h-screen bg-[#06100d] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/[0.06] text-red-400">
              <Info size={20} />
            </div>

            <h1 className="text-xl font-semibold">
              Calculation not found
            </h1>

            <p className="mt-2 text-sm text-white/40">
              {error ||
                "The requested calculation could not be loaded."}
            </p>

            <Link
              href="/dashboard/calculations"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to calculations
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const renewablePercent =
    calculation.renewable_energy_percent;

  return (
    <main className="min-h-screen bg-[#06100d] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-green-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/dashboard/calculations"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to calculations
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
                <Calculator size={16} />
                Calculation #{calculation.id}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Environmental Impact Report
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45 sm:text-base">
                Complete environmental calculation details,
                including workload inputs, environmental
                impact and AI-powered analysis.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-4 py-3">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />

              <div>
                <div className="text-xs text-white/35">
                  Calculation status
                </div>

                <div className="text-sm font-medium text-emerald-300">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Calculation Inputs                                               */}
        {/* ---------------------------------------------------------------- */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
        >
          <div className="border-b border-white/[0.06] p-5">
            <SectionTitle
              icon={<Server size={17} />}
              title="Calculation inputs"
              description="The workload parameters used to generate this result."
            />
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-5">
            <InputMetric
              label="Facility area"
              value={formatNumber(
                calculation.facility_area_m2,
              )}
              unit="m²"
              icon={<Map size={16} />}
            />

            <InputMetric
              label="GPU model"
              value={calculation.gpu_model}
              unit="GPU"
              icon={<Server size={16} />}
            />

            <InputMetric
              label="GPU count"
              value={formatNumber(
                calculation.gpu_count,
                0,
              )}
              unit="GPUs"
              icon={<Calculator size={16} />}
            />

            <InputMetric
              label="Hours used"
              value={formatNumber(
                calculation.hours_used,
              )}
              unit="hours"
              icon={<Gauge size={16} />}
            />

            <InputMetric
              label="Renewable energy"
              value={formatNumber(
                calculation.renewable_energy_percent,
                1,
              )}
              unit="%"
              icon={<Leaf size={16} />}
            />
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Main Impact                                                       */}
        {/* ---------------------------------------------------------------- */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SectionTitle
            icon={<Leaf size={17} />}
            title="Environmental impact"
            description="Primary impact values calculated by EnvoCentre."
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ImpactHero
              icon={<Zap size={21} />}
              label="Total energy"
              value={formatNumber(
                calculation.impact.energy_kwh.total,
              )}
              unit="kWh"
            />

            <ImpactHero
              icon={<Droplets size={21} />}
              label="Water consumption"
              value={formatNumber(
                calculation.impact.water.liters,
              )}
              unit="liters"
            />

            <ImpactHero
              icon={<Cloud size={21} />}
              label="CO₂ emissions"
              value={formatNumber(
                calculation.impact.co2_kg,
              )}
              unit="kg CO₂"
            />

            <ImpactHero
              icon={<BarChart3 size={21} />}
              label="Capacity estimate"
              value={formatNumber(
                calculation.impact.capacity_estimate,
              )}
              unit="estimate"
            />
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Energy + Heat                                                    */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DetailSection
            icon={<Zap size={17} />}
            title="Energy consumption"
            description="IT energy and total energy after facility overhead."
          >
            <DetailMetric
              label="IT energy"
              value={formatNumber(
                calculation.impact.energy_kwh.it,
              )}
              unit="kWh"
            />

            <DetailMetric
              label="Total energy"
              value={formatNumber(
                calculation.impact.energy_kwh.total,
              )}
              unit="kWh"
              highlight
            />
          </DetailSection>

          <DetailSection
            icon={<Waves size={17} />}
            title="Heat generation"
            description="Estimated heat output in multiple units."
          >
            <DetailMetric
              label="Heat"
              value={formatNumber(
                calculation.impact.heat.kwh,
              )}
              unit="kWh"
            />

            <DetailMetric
              label="Heat"
              value={formatNumber(
                calculation.impact.heat.mj,
              )}
              unit="MJ"
            />

            <DetailMetric
              label="Heat"
              value={formatNumber(
                calculation.impact.heat.btu,
              )}
              unit="BTU"
            />
          </DetailSection>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Water + Carbon                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DetailSection
            icon={<Droplets size={17} />}
            title="Water consumption"
            description="Estimated water usage associated with the calculation."
          >
            <DetailMetric
              label="Liters"
              value={formatNumber(
                calculation.impact.water.liters,
              )}
              unit="L"
              highlight
            />

            <DetailMetric
              label="Cubic meters"
              value={formatNumber(
                calculation.impact.water.cubic_meters,
              )}
              unit="m³"
            />
          </DetailSection>

          <DetailSection
            icon={<Cloud size={17} />}
            title="Carbon emissions"
            description="Carbon output with and without renewable energy."
          >
            <DetailMetric
              label="CO₂ with renewables"
              value={formatNumber(
                calculation.impact.co2_kg,
              )}
              unit="kg"
              highlight
            />

            <DetailMetric
              label="CO₂ without renewables"
              value={formatNumber(
                calculation.impact
                  .co2_kg_without_renewables,
              )}
              unit="kg"
            />

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-white/40">
                  Renewable contribution
                </span>

                <span className="font-medium text-emerald-300">
                  {formatNumber(
                    calculation.impact
                      .renewable_energy_percent,
                    1,
                  )}
                  %
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      Math.max(0, renewablePercent),
                    )}%`,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="h-full rounded-full bg-emerald-400"
                />
              </div>
            </div>
          </DetailSection>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Forest                                                           */}
        {/* ---------------------------------------------------------------- */}

        <DetailSection
          icon={<Trees size={17} />}
          title="Forest impact"
          description="Equivalent land and tree impact derived from the calculated carbon footprint."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <LargeMetric
              icon={<TreePine size={19} />}
              label="Trees equivalent"
              value={formatNumber(
                calculation.impact.forest
                  .trees_equivalent,
              )}
            />

            <LargeMetric
              icon={<Globe2 size={19} />}
              label="Hectares needed"
              value={formatNumber(
                calculation.impact.forest
                  .hectares_needed,
              )}
            />

            <LargeMetric
              icon={<Map size={19} />}
              label="Land cleared"
              value={formatNumber(
                calculation.impact.forest
                  .land_cleared_hectares,
              )}
            />
          </div>
        </DetailSection>

        {/* ---------------------------------------------------------------- */}
        {/* Equivalences                                                     */}
        {/* ---------------------------------------------------------------- */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6"
        >
          <SectionTitle
            icon={<Globe2 size={17} />}
            title="Real-world equivalences"
            description="The calculated impact translated into familiar environmental equivalents."
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Equivalence
              icon={<Home size={21} />}
              label="Homes powered"
              value={formatNumber(
                calculation.impact.equivalences
                  .homes_powered_for_a_day,
              )}
              description="Homes powered for one day"
            />

            <Equivalence
              icon={<Car size={21} />}
              label="Cars off the road"
              value={formatNumber(
                calculation.impact.equivalences
                  .cars_off_the_road_for_a_year,
              )}
              description="Cars off the road for one year"
            />

            <Equivalence
              icon={<Cloud size={21} />}
              label="Flights"
              value={formatNumber(
                calculation.impact.equivalences
                  .flights_one_way_per_passenger,
              )}
              description="One-way passenger flight equivalent"
            />
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* AI IMPACT ANALYSIS                                               */}
        {/* ---------------------------------------------------------------- */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] via-emerald-400/[0.025] to-transparent"
        >
          <div className="border-b border-white/[0.06] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.08] text-cyan-300">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    AI Impact Analysis
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    AI-generated interpretation of this
                    calculation.
                  </p>
                </div>
              </div>

              {aiImpact && (
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/20 px-3 py-2">
                  <Sparkles
                    size={13}
                    className="text-cyan-300"
                  />

                  <span className="text-xs text-white/45">
                    {aiImpact.model}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {aiLoading ? (
              <AIAnalysisLoading />
            ) : aiError ? (
              <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-red-400"
                  />

                  <div>
                    <h3 className="text-sm font-medium text-red-300">
                      AI analysis unavailable
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-white/40">
                      {aiError}
                    </p>
                  </div>
                </div>
              </div>
            ) : aiImpact ? (
              <div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-300/60">
                    <Sparkles size={13} />
                    Grok analysis
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-7 text-white/65 sm:text-[15px]">
                    {aiImpact.analysis}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Calculation ID:{" "}
                    {aiImpact.calculation_id}
                  </span>

                  <span>
                    Generated:{" "}
                    {formatDate(
                      aiImpact.generated_at,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-white/30">
                No AI analysis was returned.
              </div>
            )}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Source Parameters                                                */}
        {/* ---------------------------------------------------------------- */}

        <DetailSection
          icon={<Gauge size={17} />}
          title="Calculation source parameters"
          description="Underlying technical parameters returned by the backend."
          className="mt-6"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2">
            <SourceRow
              label="GPU TDP"
              value={formatNumber(
                calculation.impact.sources.gpu_tdp_w,
              )}
              unit="W"
            />

            <SourceRow
              label="PUE"
              value={formatNumber(
                calculation.impact.sources.pue,
              )}
              unit=""
            />

            <SourceRow
              label="WUE"
              value={formatNumber(
                calculation.impact.sources.wue_l_per_kwh,
              )}
              unit="L/kWh"
            />

            <SourceRow
              label="Carbon intensity"
              value={formatNumber(
                calculation.impact.sources
                  .carbon_intensity_g_per_kwh,
              )}
              unit="g/kWh"
            />

            <SourceRow
              label="CO₂ per tree / year"
              value={formatNumber(
                calculation.impact.sources
                  .co2_per_tree_kg_year,
              )}
              unit="kg/year"
            />

            <SourceRow
              label="CO₂ per hectare / year"
              value={formatNumber(
                calculation.impact.sources
                  .co2_per_hectare_kg_year,
              )}
              unit="kg/year"
            />
          </div>
        </DetailSection>

        {/* ---------------------------------------------------------------- */}
        {/* Notes                                                            */}
        {/* ---------------------------------------------------------------- */}

        {calculation.impact.notes?.length > 0 && (
          <DetailSection
            icon={<Info size={17} />}
            title="Calculation notes"
            description="Additional information returned by the calculation engine."
            className="mt-6"
          >
            <div className="space-y-2">
              {calculation.impact.notes.map(
                (note, index) => (
                  <div
                    key={`${note}-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/[0.08] text-emerald-400">
                      <CheckCircle2 size={13} />
                    </div>

                    <p className="text-sm leading-6 text-white/55">
                      {note}
                    </p>
                  </div>
                ),
              )}
            </div>
          </DetailSection>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Metadata                                                         */}
        {/* ---------------------------------------------------------------- */}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Metadata
            icon={<Calculator size={16} />}
            label="Calculation ID"
            value={String(calculation.id)}
          />

          <Metadata
            icon={<CalendarDays size={16} />}
            label="Created"
            value={formatDate(
              calculation.created_at,
            )}
          />

          <Metadata
            icon={<CalendarDays size={16} />}
            label="Last updated"
            value={formatDate(
              calculation.updated_at,
            )}
          />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8 flex justify-start pb-8">
          <Link
            href="/dashboard/calculations"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to all calculations
          </Link>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>
    </div>
  );
}

function DetailSection({
  icon,
  title,
  description,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 ${className}`}
    >
      <SectionTitle
        icon={icon}
        title={title}
        description={description}
      />

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function InputMetric({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-[#07120f] p-5">
      <div className="flex items-center gap-2 text-xs text-white/30">
        <span className="text-emerald-400">
          {icon}
        </span>

        {label}
      </div>

      <div className="mt-3 break-words text-lg font-semibold text-white/85">
        {value}
      </div>

      {unit && (
        <div className="mt-1 text-xs text-white/25">
          {unit}
        </div>
      )}
    </div>
  );
}

function ImpactHero({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-emerald-400/15"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400">
        {icon}
      </div>

      <div className="mt-5 text-xs uppercase tracking-wider text-white/30">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </div>

      <div className="mt-1 text-xs text-white/25">
        {unit}
      </div>
    </motion.div>
  );
}

function DetailMetric({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3 last:border-0">
      <span className="text-sm text-white/45">
        {label}
      </span>

      <div className="text-right">
        <span
          className={`text-sm font-semibold ${
            highlight
              ? "text-emerald-300"
              : "text-white/75"
          }`}
        >
          {value}
        </span>

        {unit && (
          <span className="ml-1 text-xs text-white/25">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function LargeMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-xs text-white/35">
        <span className="text-emerald-400">
          {icon}
        </span>

        {label}
      </div>

      <div className="mt-3 text-xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function Equivalence({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/[0.06] text-emerald-400">
        {icon}
      </div>

      <div className="mt-5 text-xs uppercase tracking-wider text-white/25">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold">
        {value}
      </div>

      <div className="mt-1 text-xs leading-5 text-white/30">
        {description}
      </div>
    </motion.div>
  );
}

function SourceRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3 last:border-0">
      <span className="text-sm text-white/40">
        {label}
      </span>

      <div>
        <span className="text-sm font-medium text-white/75">
          {value}
        </span>

        {unit && (
          <span className="ml-1 text-xs text-white/25">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function Metadata({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/25">
        {icon}
        {label}
      </div>

      <div className="mt-2 truncate text-sm text-white/65">
        {value}
      </div>
    </div>
  );
}

function AIAnalysisLoading() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />

      <div className="space-y-2 rounded-xl border border-white/[0.05] bg-black/20 p-5">
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
        <div className="h-4 w-[95%] animate-pulse rounded bg-white/[0.05]" />
        <div className="h-4 w-[88%] animate-pulse rounded bg-white/[0.05]" />
        <div className="h-4 w-[72%] animate-pulse rounded bg-white/[0.05]" />
        <div className="mt-4 h-4 w-[92%] animate-pulse rounded bg-white/[0.05]" />
        <div className="h-4 w-[80%] animate-pulse rounded bg-white/[0.05]" />
      </div>

      <p className="text-xs text-white/25">
        Generating AI analysis for this calculation...
      </p>
    </div>
  );
}

function DetailLoading() {
  return (
    <main className="min-h-screen bg-[#06100d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="h-6 w-36 animate-pulse rounded bg-white/[0.05]" />

        <div className="mt-8 h-12 w-96 max-w-full animate-pulse rounded bg-white/[0.05]" />

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl bg-white/[0.04]"
              />
            ),
          )}
        </div>

        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white/[0.04]" />

        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    </main>
  );
}