"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

type FormState = {
  name: string;
  calculationType: string;
  description: string;
  value: string;
  unit: string;
};

const initialForm: FormState = {
  name: "",
  calculationType: "",
  description: "",
  value: "",
  unit: "",
};

const calculationTypes = [
  {
    value: "energy",
    label: "Energy",
    description: "Electricity and energy consumption",
  },
  {
    value: "transport",
    label: "Transport",
    description: "Travel and transportation emissions",
  },
  {
    value: "waste",
    label: "Waste",
    description: "Waste generation and disposal",
  },
  {
    value: "water",
    label: "Water",
    description: "Water consumption and impact",
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "Industrial activity and processes",
  },
  {
    value: "other",
    label: "Other",
    description: "Other environmental calculations",
  },
];

export default function NewCalculationPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.name.trim()) {
      setError("Please enter a calculation name.");
      return;
    }

    if (!form.calculationType) {
      setError("Please select a calculation type.");
      return;
    }

    if (!form.value.trim()) {
      setError("Please enter a value.");
      return;
    }

    const numericValue = Number(form.value);

    if (!Number.isFinite(numericValue)) {
      setError("Value must be a valid number.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * IMPORTANT
       *
       * This is the only place where the backend payload needs
       * to be adjusted once we have the exact FastAPI POST schema.
       *
       * Do NOT change the rest of the page.
       */
      const payload = {
        name: form.name.trim(),
        calculation_type: form.calculationType,
        description: form.description.trim() || undefined,
        value: numericValue,
        unit: form.unit.trim() || undefined,
      };

      const response = await fetch(
        "/api/calculations/create",
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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof data?.detail === "string"
            ? data.detail
            : typeof data?.message === "string"
              ? data.message
              : `Request failed with status ${response.status}`;

        throw new Error(message);
      }

      console.log(
        "Calculation created successfully:",
        data,
      );

      setSuccess(true);

      /*
       * Give the user a small success state before going
       * back to calculations.
       */
      setTimeout(() => {
        router.push("/calculations");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("Create calculation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create calculation.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
                <Calculator size={16} />
                <span>Calculations</span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                New calculation
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40 sm:text-base">
                Create a new environmental impact calculation
                using your activity data.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 text-xs text-emerald-300 sm:flex">
              <Sparkles size={14} />
              Backend connected
            </div>
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

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4"
          >
            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            <div>
              <p className="text-sm font-medium text-emerald-300">
                Calculation created successfully
              </p>

              <p className="mt-1 text-xs text-emerald-200/40">
                Redirecting to your calculations...
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Main form */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
            >
              {/* Section header */}
              <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
                <h2 className="font-semibold">
                  Calculation details
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Provide the information required to create
                  your calculation.
                </p>
              </div>

              <div className="space-y-7 p-5 sm:p-7">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Calculation name
                    <span className="ml-1 text-emerald-400">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Office Energy Assessment"
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                  />
                </div>

                {/* Type */}
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-white/70">
                      Calculation type
                      <span className="ml-1 text-emerald-400">
                        *
                      </span>
                    </label>

                    <p className="mt-1 text-xs text-white/30">
                      Select the category that best describes
                      your calculation.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {calculationTypes.map((type) => {
                      const selected =
                        form.calculationType ===
                        type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            updateField(
                              "calculationType",
                              type.value,
                            )
                          }
                          className={`group rounded-xl border p-4 text-left transition ${
                            selected
                              ? "border-emerald-400/30 bg-emerald-400/[0.07]"
                              : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.035]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`text-sm font-medium ${
                                selected
                                  ? "text-emerald-300"
                                  : "text-white/70"
                              }`}
                            >
                              {type.label}
                            </span>

                            <div
                              className={`h-4 w-4 rounded-full border ${
                                selected
                                  ? "border-emerald-400 bg-emerald-400"
                                  : "border-white/20"
                              }`}
                            >
                              {selected && (
                                <div className="m-[3px] h-1.5 w-1.5 rounded-full bg-[#06100d]" />
                              )}
                            </div>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-white/30">
                            {type.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Value + Unit */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="value"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Activity value
                      <span className="ml-1 text-emerald-400">
                        *
                      </span>
                    </label>

                    <input
                      id="value"
                      type="number"
                      step="any"
                      min="0"
                      value={form.value}
                      onChange={(event) =>
                        updateField(
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="0.00"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="unit"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Unit
                    </label>

                    <input
                      id="unit"
                      value={form.unit}
                      onChange={(event) =>
                        updateField(
                          "unit",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. kWh"
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Description
                    <span className="ml-2 text-xs font-normal text-white/25">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Add some context about this calculation..."
                    rows={5}
                    disabled={submitting}
                    className="w-full resize-none rounded-xl border border-white/[0.09] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-emerald-400/35 focus:bg-black/30 disabled:opacity-50"
                  />
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
                    disabled={submitting || success}
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-semibold text-[#03100b] shadow-[0_0_30px_rgba(16,185,129,0.15)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create calculation
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
              {/* Preview */}
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
                    label="Name"
                    value={
                      form.name ||
                      "Untitled calculation"
                    }
                  />

                  <PreviewRow
                    label="Type"
                    value={
                      calculationTypes.find(
                        (item) =>
                          item.value ===
                          form.calculationType,
                      )?.label || "Not selected"
                    }
                  />

                  <PreviewRow
                    label="Value"
                    value={
                      form.value
                        ? `${form.value}${form.unit ? ` ${form.unit}` : ""}`
                        : "Not provided"
                    }
                  />
                </div>
              </div>

              {/* Process */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <h3 className="text-sm font-semibold">
                  What happens next?
                </h3>

                <div className="mt-5 space-y-5">
                  <Step
                    number="01"
                    title="Submit"
                    description="Your calculation data is sent securely to the backend."
                  />

                  <Step
                    number="02"
                    title="Process"
                    description="The calculation engine processes your environmental data."
                  />

                  <Step
                    number="03"
                    title="Analyse"
                    description="The resulting calculation becomes available in your workspace."
                  />
                </div>
              </div>

              {/* Security note */}
              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />

                  <p className="text-xs leading-5 text-white/35">
                    Your authentication cookie is automatically
                    included with the request. No access token is
                    stored in browser localStorage.
                  </p>
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
/* Preview Row                                                                */
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

/* -------------------------------------------------------------------------- */
/* Step                                                                       */
/* -------------------------------------------------------------------------- */

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