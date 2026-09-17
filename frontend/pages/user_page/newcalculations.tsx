"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Loader2,
  RotateCcw,
  TriangleAlert,
  Cpu,
  Clock3,
  Building2,
  Leaf,
  Droplets,
  Flame,
  Wind,
  Trees,
  Home,
  Car,
  Plane,
  Gauge,
  Database,
} from "lucide-react";
import Link from "next/link";

type FormState = {
  facility_area_m2: string;
  gpu_model: string;
  gpu_count: string;
  hours_used: string;
  renewable_energy_percent: string;
};

type CalculationResponse = {
  id: number;
  user_id: number;
  facility_area_m2: number;
  gpu_model: string;
  gpu_count: number;
  hours_used: number;
  renewable_energy_percent: number;
  impact: {
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
  created_at: string;
  updated_at: string;
};

const initialForm: FormState = {
  facility_area_m2: "",
  gpu_model: "",
  gpu_count: "",
  hours_used: "",
  renewable_energy_percent: "",
};

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

export default function NewCalculationPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [calculation, setCalculation] =
    useState<CalculationResponse | null>(null);

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
    setCalculation(null);
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        facility_area_m2: Number(form.facility_area_m2),
        gpu_model: form.gpu_model,
        gpu_count: Number(form.gpu_count),
        hours_used: Number(form.hours_used),
        renewable_energy_percent: Number(
          form.renewable_energy_percent,
        ),
      };

      console.log("Creating calculation with:", payload);

      const response = await fetch(
        "/api/calculations/getcalculation/create",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const responseData = await response
        .json()
        .catch(() => null);

      console.log(
        "Create calculation response:",
        responseData,
      );

      if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        if (typeof responseData?.message === "string") {
          message = responseData.message;
        } else if (
          Array.isArray(responseData?.message)
        ) {
          message = responseData.message
            .map(
              (item: { msg?: string }) =>
                item?.msg || "Validation error",
            )
            .join(", ");
        } else if (
          typeof responseData?.detail === "string"
        ) {
          message = responseData.detail;
        }

        throw new Error(message);
      }

      /*
       * The frontend route returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     id: ...,
       *     impact: {...},
       *     ...
       *   }
       * }
       *
       * Therefore the actual calculation object is
       * responseData.data.
       */

      if (!responseData?.data) {
        throw new Error(
          "Calculation data was not returned by the server",
        );
      }

      console.log(
        "Calculation object:",
        responseData.data,
      );

      setCalculation(responseData.data);
    } catch (error) {
      console.error(
        "Create calculation error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the calculation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------------------------------
   * RESULTS VIEW
   * --------------------------------------------------------------------------
   */

  if (calculation) {
    const { impact } = calculation;

    return (
      <main className="min-h-screen bg-[#06100d] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.08] blur-[140px]" />

          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[150px]" />

          <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-emerald-500/[0.04] blur-[130px]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1250px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/dashboard/calculations"
              className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
            >
              <ArrowLeft size={16} />
              Back to calculations
            </Link>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 size={16} />
                  Calculation completed
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Environmental impact
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
                  Your workload has been analysed using the
                  submitted facility and GPU information.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white/80"
              >
                <Calculator size={16} />
                New calculation
              </button>
            </div>
          </motion.div>

          {/* Workload summary */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
          >
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-white/25">
                Workload
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Calculation inputs
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <ResultInput
                icon={<Building2 size={16} />}
                label="Facility area"
                value={`${formatNumber(
                  calculation.facility_area_m2,
                )} m²`}
              />

              <ResultInput
                icon={<Cpu size={16} />}
                label="GPU model"
                value={calculation.gpu_model}
              />

              <ResultInput
                icon={<Database size={16} />}
                label="GPU count"
                value={formatNumber(
                  calculation.gpu_count,
                )}
              />

              <ResultInput
                icon={<Clock3 size={16} />}
                label="Hours used"
                value={formatNumber(
                  calculation.hours_used,
                )}
              />

              <ResultInput
                icon={<Leaf size={16} />}
                label="Renewable energy"
                value={`${formatNumber(
                  calculation.renewable_energy_percent,
                )}%`}
              />
            </div>
          </motion.section>

          {/* Main impact metrics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <ImpactCard
              icon={<Wind size={20} />}
              label="Total energy"
              value={formatNumber(
                impact.energy_kwh.total,
              )}
              unit="kWh"
              description={`IT energy: ${formatNumber(
                impact.energy_kwh.it,
              )} kWh`}
              delay={0.1}
            />

            <ImpactCard
              icon={<Droplets size={20} />}
              label="Water usage"
              value={formatNumber(
                impact.water.liters,
              )}
              unit="L"
              description={`${formatNumber(
                impact.water.cubic_meters,
              )} m³`}
              delay={0.15}
            />

            <ImpactCard
              icon={<Flame size={20} />}
              label="CO₂ emissions"
              value={formatNumber(impact.co2_kg)}
              unit="kg"
              description={`${formatNumber(
                impact.co2_kg_without_renewables,
              )} kg without renewables`}
              delay={0.2}
            />

            <ImpactCard
              icon={<Gauge size={20} />}
              label="Capacity estimate"
              value={formatNumber(
                impact.capacity_estimate,
              )}
              unit=""
              description="Estimated workload capacity"
              delay={0.25}
            />
          </div>

          {/* Energy / Heat / Water */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Energy */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <SectionHeader
                icon={<Wind size={18} />}
                title="Energy"
                subtitle="Energy consumption"
              />

              <div className="mt-6">
                <MetricLine
                  label="IT energy"
                  value={`${formatNumber(
                    impact.energy_kwh.it,
                  )} kWh`}
                />

                <MetricLine
                  label="Total energy"
                  value={`${formatNumber(
                    impact.energy_kwh.total,
                  )} kWh`}
                  highlighted
                />
              </div>
            </motion.section>

            {/* Heat */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <SectionHeader
                icon={<Flame size={18} />}
                title="Heat generated"
                subtitle="Thermal impact"
              />

              <div className="mt-6">
                <MetricLine
                  label="Kilowatt-hours"
                  value={`${formatNumber(
                    impact.heat.kwh,
                  )} kWh`}
                />

                <MetricLine
                  label="Megajoules"
                  value={`${formatNumber(
                    impact.heat.mj,
                  )} MJ`}
                />

                <MetricLine
                  label="BTU"
                  value={formatNumber(
                    impact.heat.btu,
                  )}
                  highlighted
                />
              </div>
            </motion.section>

            {/* Water */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
            >
              <SectionHeader
                icon={<Droplets size={18} />}
                title="Water usage"
                subtitle="Cooling and facility water"
              />

              <div className="mt-6">
                <MetricLine
                  label="Liters"
                  value={`${formatNumber(
                    impact.water.liters,
                  )} L`}
                  highlighted
                />

                <MetricLine
                  label="Cubic meters"
                  value={`${formatNumber(
                    impact.water.cubic_meters,
                  )} m³`}
                />
              </div>
            </motion.section>
          </div>

          {/* CO2 + renewable */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Carbon */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
            >
              <SectionHeader
                icon={<Wind size={18} />}
                title="Carbon impact"
                subtitle="Emissions associated with this workload"
              />

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-xs text-white/30">
                    With renewables
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(impact.co2_kg)}
                    <span className="ml-1 text-sm font-normal text-white/30">
                      kg CO₂
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-xs text-white/30">
                    Without renewables
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {formatNumber(
                      impact.co2_kg_without_renewables,
                    )}
                    <span className="ml-1 text-sm font-normal text-white/30">
                      kg CO₂
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/35">
                    Renewable energy contribution
                  </span>

                  <span className="font-medium text-emerald-400">
                    {formatNumber(
                      impact.renewable_energy_percent,
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
                        Math.max(
                          0,
                          impact.renewable_energy_percent,
                        ),
                      )}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.55,
                    }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
              </div>
            </motion.section>

            {/* Forest */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
            >
              <SectionHeader
                icon={<Trees size={18} />}
                title="Forest equivalent"
                subtitle="Land and tree equivalents"
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <SmallMetric
                  icon={<Trees size={17} />}
                  label="Trees equivalent"
                  value={formatNumber(
                    impact.forest.trees_equivalent,
                  )}
                />

                <SmallMetric
                  icon={<Leaf size={17} />}
                  label="Hectares needed"
                  value={formatNumber(
                    impact.forest.hectares_needed,
                  )}
                />

                <SmallMetric
                  icon={<Building2 size={17} />}
                  label="Land cleared"
                  value={`${formatNumber(
                    impact.forest.land_cleared_hectares,
                  )} ha`}
                />
              </div>
            </motion.section>
          </div>

          {/* Equivalences */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
          >
            <SectionHeader
              icon={<Gauge size={18} />}
              title="Real-world equivalences"
              subtitle="Putting the calculated impact into context"
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <EquivalenceCard
                icon={<Home size={19} />}
                label="Homes powered"
                value={formatNumber(
                  impact.equivalences
                    .homes_powered_for_a_day,
                )}
                description="homes for one day"
              />

              <EquivalenceCard
                icon={<Car size={19} />}
                label="Cars off the road"
                value={formatNumber(
                  impact.equivalences
                    .cars_off_the_road_for_a_year,
                )}
                description="car-years"
              />

              <EquivalenceCard
                icon={<Plane size={19} />}
                label="Flights"
                value={formatNumber(
                  impact.equivalences
                    .flights_one_way_per_passenger,
                )}
                description="one-way passenger flights"
              />
            </div>
          </motion.section>

          {/* Sources */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
          >
            <SectionHeader
              icon={<Database size={18} />}
              title="Calculation parameters"
              subtitle="Values used by the calculation engine"
            />

            <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <SourceValue
                label="GPU TDP"
                value={`${formatNumber(
                  impact.sources.gpu_tdp_w,
                )} W`}
              />

              <SourceValue
                label="PUE"
                value={formatNumber(
                  impact.sources.pue,
                )}
              />

              <SourceValue
                label="WUE"
                value={`${formatNumber(
                  impact.sources.wue_l_per_kwh,
                )} L/kWh`}
              />

              <SourceValue
                label="Carbon intensity"
                value={`${formatNumber(
                  impact.sources.carbon_intensity_g_per_kwh,
                )} g/kWh`}
              />

              <SourceValue
                label="CO₂ per tree / year"
                value={`${formatNumber(
                  impact.sources.co2_per_tree_kg_year,
                )} kg`}
              />

              <SourceValue
                label="CO₂ per hectare / year"
                value={`${formatNumber(
                  impact.sources.co2_per_hectare_kg_year,
                )} kg`}
              />
            </div>
          </motion.section>

          {/* Notes */}
          {impact.notes?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-400">
                  <TriangleAlert size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Calculation notes
                  </h2>

                  <p className="text-xs text-white/25">
                    Additional information from the calculation
                    engine
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {impact.notes.map((note, index) => (
                  <div
                    key={`${note}-${index}`}
                    className="rounded-xl border border-white/[0.06] bg-black/10 px-4 py-3 text-sm leading-6 text-white/45"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Metadata */}
          <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-xs text-white/20 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Calculation ID: #{calculation.id}
            </span>

            <span>
              Created{" "}
              {new Date(
                calculation.created_at,
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * FORM VIEW
   * --------------------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#06100d] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.08] blur-[140px]" />

        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[150px]" />

        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-emerald-500/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/calculations"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft size={16} />
            Back to calculations
          </Link>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
              <Calculator size={16} />
              <span>Environmental calculations</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              New calculation
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
              Enter your facility and GPU usage data to calculate
              the environmental impact of your workload.
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-400/[0.06] p-4"
          >
            <TriangleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-red-300">
                Unable to create calculation
              </p>

              <p className="mt-1 text-xs leading-5 text-red-200/50">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Form */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
            >
              <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
                <h2 className="font-semibold">
                  Workload details
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Provide the facility and GPU usage information
                  required for the calculation.
                </p>
              </div>

              <div className="space-y-7 p-5 sm:p-7">
                {/* Facility area */}
                <div>
                  <label
                    htmlFor="facility_area_m2"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Facility area
                    <span className="ml-1 text-emerald-400">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Building2
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <input
                      id="facility_area_m2"
                      type="number"
                      step="any"
                      min="0"
                      value={form.facility_area_m2}
                      onChange={(event) =>
                        updateField(
                          "facility_area_m2",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 500"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 pl-11 pr-16 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                      m²
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/25">
                    Total physical area of the computing facility.
                  </p>
                </div>

                {/* GPU model */}
                <div>
                  <label
                    htmlFor="gpu_model"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    GPU model
                    <span className="ml-1 text-emerald-400">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Cpu
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <select
                      id="gpu_model"
                      value={form.gpu_model}
                      onChange={(event) =>
                        updateField(
                          "gpu_model",
                          event.target.value,
                        )
                      }
                      disabled={submitting}
                      className="h-12 w-full appearance-none rounded-xl border border-white/[0.09] bg-black/20 px-11 text-sm text-white outline-none transition focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                    >
                      <option
                        value=""
                        className="bg-[#08120f]"
                      >
                        Select GPU model
                      </option>

                      {gpuModels.map((model) => (
                        <option
                          key={model}
                          value={model}
                          className="bg-[#08120f]"
                        >
                          {model}
                        </option>
                      ))}
                    </select>

                    <ArrowRight
                      size={14}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/25"
                    />
                  </div>
                </div>

                {/* GPU count + hours */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="gpu_count"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      GPU count
                      <span className="ml-1 text-emerald-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Cpu
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                      />

                      <input
                        id="gpu_count"
                        type="number"
                        step="1"
                        min="1"
                        value={form.gpu_count}
                        onChange={(event) =>
                          updateField(
                            "gpu_count",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. 8"
                        disabled={submitting}
                        className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="hours_used"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Hours used
                      <span className="ml-1 text-emerald-400">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Clock3
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                      />

                      <input
                        id="hours_used"
                        type="number"
                        step="any"
                        min="0"
                        value={form.hours_used}
                        onChange={(event) =>
                          updateField(
                            "hours_used",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. 24"
                        disabled={submitting}
                        className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 pl-10 pr-14 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                        hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Renewable */}
                <div>
                  <label
                    htmlFor="renewable_energy_percent"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Renewable energy
                    <span className="ml-1 text-emerald-400">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Leaf
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                    />

                    <input
                      id="renewable_energy_percent"
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={form.renewable_energy_percent}
                      onChange={(event) =>
                        updateField(
                          "renewable_energy_percent",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 40"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/25">
                      %
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-white/25">
                    Enter a value between 0 and 100.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] bg-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white/70 disabled:opacity-40"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>

                <div className="flex gap-3">
                  <Link
                    href="/calculations"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/[0.08] px-5 text-sm text-white/50 transition hover:bg-white/[0.04] hover:text-white/70"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-[#03100b] shadow-[0_0_30px_rgba(16,185,129,0.15)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Calculating...
                      </>
                    ) : (
                      <>
                        Calculate impact
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Side information */}
            <motion.aside
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-400">
                    <Calculator size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Calculation preview
                    </h3>

                    <p className="text-xs text-white/25">
                      Live form preview
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <PreviewRow
                    label="Facility area"
                    value={
                      form.facility_area_m2
                        ? `${form.facility_area_m2} m²`
                        : "Not provided"
                    }
                  />

                  <PreviewRow
                    label="GPU model"
                    value={
                      form.gpu_model || "Not selected"
                    }
                  />

                  <PreviewRow
                    label="GPU count"
                    value={
                      form.gpu_count
                        ? `${form.gpu_count} GPUs`
                        : "Not provided"
                    }
                  />

                  <PreviewRow
                    label="Hours used"
                    value={
                      form.hours_used
                        ? `${form.hours_used} hours`
                        : "Not provided"
                    }
                  />

                  <PreviewRow
                    label="Renewable energy"
                    value={
                      form.renewable_energy_percent
                        ? `${form.renewable_energy_percent}%`
                        : "Not provided"
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <h3 className="text-sm font-semibold">
                  What happens next?
                </h3>

                <div className="mt-5 space-y-5">
                  <Step
                    number="01"
                    title="Submit"
                    description="Your workload information is sent to the calculation service."
                  />

                  <Step
                    number="02"
                    title="Calculate"
                    description="Energy, heat, water and carbon impact are calculated."
                  />

                  <Step
                    number="03"
                    title="Review"
                    description="The complete environmental impact report appears here."
                  />
                </div>
              </div>
            </motion.aside>
          </div>
        </form>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/20">
        {label}
      </div>

      <div className="mt-1 truncate text-sm text-white/65">
        {value}
      </div>
    </div>
  );
}

function Step({
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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] font-medium text-emerald-400">
        {number}
      </div>

      <div>
        <p className="text-xs font-medium text-white/65">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {description}
        </p>
      </div>
    </div>
  );
}

function ResultInput({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
      <div className="flex items-center gap-2 text-white/25">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-medium text-white/75">
        {value}
      </p>
    </div>
  );
}

function ImpactCard({
  icon,
  label,
  value,
  unit,
  description,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-400">
          {icon}
        </div>

        <span className="text-xs text-white/35">
          {label}
        </span>
      </div>

      <div className="mt-6">
        <span className="text-3xl font-semibold tracking-tight">
          {value}
        </span>

        {unit && (
          <span className="ml-2 text-sm text-white/30">
            {unit}
          </span>
        )}

        <p className="mt-2 text-xs text-white/25">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/[0.07] text-emerald-400">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-semibold">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-white/25">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function MetricLine({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3 last:border-0">
      <span className="text-xs text-white/35">
        {label}
      </span>

      <span
        className={`text-sm font-medium ${
          highlighted
            ? "text-emerald-400"
            : "text-white/70"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SmallMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
      <div className="text-emerald-400/70">
        {icon}
      </div>

      <p className="mt-4 text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/30">
        {label}
      </p>
    </div>
  );
}

function EquivalenceCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/[0.07] text-cyan-400">
        {icon}
      </div>

      <p className="mt-5 text-xs text-white/30">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/20">
        {description}
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
    <div className="flex items-center justify-between border-b border-white/[0.05] py-3">
      <span className="text-xs text-white/30">
        {label}
      </span>

      <span className="text-sm text-white/60">
        {value}
      </span>
    </div>
  );
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}