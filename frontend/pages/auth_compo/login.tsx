"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

type FormData = {
  email: string;
  password: string;
};

type FormErrors = {
  email?: string;
  password?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://envocentre-183a75cb.fastapicloud.dev";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      tl.fromTo(
        ".login-nav",
        {
          y: -30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
        }
      )
        .fromTo(
          ".login-copy",
          {
            x: -50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
          },
          "-=0.45"
        )
        .fromTo(
          ".login-form",
          {
            x: 50,
            opacity: 0,
            scale: 0.97,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
          },
          "-=0.7"
        )
        .fromTo(
          ".login-stat",
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
          },
          "-=0.5"
        )
        .fromTo(
          ".floating-symbol",
          {
            scale: 0,
            opacity: 0,
            rotation: -20,
          },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.7,
            stagger: 0.15,
          },
          "-=0.5"
        );

      gsap.to(".ambient-orb-1", {
        x: 50,
        y: -35,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".ambient-orb-2", {
        x: -40,
        y: 30,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-symbol-1", {
        y: -15,
        rotation: 8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-symbol-2", {
        y: 15,
        rotation: -8,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-symbol-3", {
        y: -12,
        x: 8,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  const validate = () => {
    const newErrors: FormErrors = {};

    const email = form.email.trim();

    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setApiError("");

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setApiError("");

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
        console.log(data);
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          data?.error ||
          "Unable to sign in. Please check your credentials.";

        throw new Error(
          typeof message === "string"
            ? message
            : "Unable to sign in. Please try again."
        );
      }

      /*
       * If your backend returns a token instead of using
       * an HTTP-only cookie, handle it here according to
       * the API's actual authentication contract.
       *
       * For HTTP-only cookie authentication, credentials:
       * "include" above allows the backend to set/use cookies.
       */

      router.push("/dashboard");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      gsap.fromTo(
        ".login-form-card",
        {
          x: 0,
        },
        {
          x: -8,
          duration: 0.08,
          repeat: 5,
          yoyo: true,
          ease: "power2.inOut",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06110d] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="ambient-orb-1 absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="ambient-orb-2 absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.025] blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="login-nav relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-400/20 bg-emerald-400/10">
            <div className="absolute inset-0 bg-emerald-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="relative h-6 w-6 text-emerald-300"
            >
              <path
                d="M20 4C12.8 8.3 8 14.1 8 21.2C8 28.4 13.4 34 20 36C26.6 34 32 28.4 32 21.2C32 14.1 27.2 8.3 20 4Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 12V29M14 20.5C17 21.5 19 23.5 20 26C21 23.5 23 21.5 26 20.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="text-lg font-semibold tracking-tight">
              Envo<span className="text-emerald-400">Centre</span>
            </div>

            <div className="text-[9px] uppercase tracking-[0.28em] text-white/30">
              Environmental Intelligence
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-white/40 sm:block">
            New to EnvoCentre?
          </span>

          <Link
            href="/auth/register"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-white/80 transition-all duration-300 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            Create account
          </Link>
        </div>
      </nav>

      {/* Main */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl items-center px-5 pb-12 pt-4 sm:px-8 lg:px-10 lg:pb-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          {/* Left Content */}
          <div className="login-copy relative">
            {/* Floating symbols */}
            <div className="floating-symbol floating-symbol-1 absolute -right-4 top-0 hidden h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] text-2xl text-emerald-300/60 backdrop-blur-xl lg:flex">
              ◌
            </div>

            <div className="floating-symbol floating-symbol-2 absolute bottom-20 right-20 hidden h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] text-xl text-cyan-300/60 backdrop-blur-xl lg:flex">
              ≋
            </div>

            <div className="floating-symbol floating-symbol-3 absolute -left-4 bottom-5 hidden h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] text-lg text-emerald-300/60 backdrop-blur-xl lg:flex">
              +
            </div>

            {/* Eyebrow */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/80">
                Your environmental workspace
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Turn
              <span className="block text-white">
                environmental
              </span>

              <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                data into impact.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/45 sm:text-lg">
              Welcome back. Continue analyzing environmental
              calculations, tracking your results, and turning
              complex data into decisions that matter.
            </p>

            {/* Stats */}
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <div className="login-stat rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl font-semibold tracking-tight text-white">
                  Data
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Driven
                </div>
              </div>

              <div className="login-stat rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl font-semibold tracking-tight text-white">
                  Smart
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Analysis
                </div>
              </div>

              <div className="login-stat rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl font-semibold tracking-tight text-white">
                  Clear
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/30">
                  Insights
                </div>
              </div>
            </div>

            {/* Small trust statement */}
            <div className="mt-8 flex items-center gap-3 text-xs text-white/30">
              <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full border-2 border-[#06110d] bg-emerald-300/20" />
                <div className="h-7 w-7 rounded-full border-2 border-[#06110d] bg-cyan-300/20" />
                <div className="h-7 w-7 rounded-full border-2 border-[#06110d] bg-teal-300/20" />
              </div>

              <span>
                One workspace for understanding your impact.
              </span>
            </div>
          </div>

          {/* Login Card */}
          <div className="login-form relative mx-auto w-full max-w-[480px] lg:ml-auto">
            <div className="login-form-card relative overflow-hidden rounded-[30px] border border-white/[0.09] bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
              {/* Card glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-[70px]" />

              <div className="relative">
                {/* Header */}
                <div className="mb-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5 text-emerald-300"
                    >
                      <path
                        d="M15 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21H15"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M11 12h9M16.5 8.5 20 12l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
                    Welcome back.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    Sign in to continue your environmental
                    intelligence journey.
                  </p>
                </div>

                {/* API Error */}
                {apiError && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.06] p-4"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-xs text-red-300">
                      !
                    </div>

                    <p className="text-sm leading-5 text-red-200/80">
                      {apiError}
                    </p>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-white/50"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                        >
                          <path
                            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="m5 7 7 5 7-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) =>
                          handleChange(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="you@example.com"
                        className={`h-14 w-full rounded-2xl border bg-white/[0.035] pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 ${
                          errors.email
                            ? "border-red-400/40 focus:border-red-400/60"
                            : "border-white/[0.08] focus:border-emerald-400/40 focus:bg-emerald-400/[0.025]"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-2 text-xs text-red-300/80">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium uppercase tracking-[0.12em] text-white/50"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs text-emerald-300/70 transition-colors hover:text-emerald-300"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                        >
                          <rect
                            x="4"
                            y="10"
                            width="16"
                            height="11"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M8 10V7a4 4 0 0 1 8 0v3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(event) =>
                          handleChange(
                            "password",
                            event.target.value
                          )
                        }
                        placeholder="Enter your password"
                        className={`h-14 w-full rounded-2xl border bg-white/[0.035] pl-12 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/20 ${
                          errors.password
                            ? "border-red-400/40 focus:border-red-400/60"
                            : "border-white/[0.08] focus:border-emerald-400/40 focus:bg-emerald-400/[0.025]"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/60"
                      >
                        {showPassword ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                          >
                            <path
                              d="M3 3l18 18"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M9.9 4.4A10.6 10.6 0 0 1 12 4.2c5.1 0 8.4 4.2 9.5 6.1.3.5.3 1.1 0 1.6a15.5 15.5 0 0 1-3.5 4.1M6.2 6.2A15.2 15.2 0 0 0 2.5 10.3c-.3.5-.3 1.1 0 1.6 1.1 1.9 4.4 6.1 9.5 6.1 1 0 1.9-.1 2.8-.4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5"
                          >
                            <path
                              d="M2.5 12s3.3-6.1 9.5-6.1 9.5 6.1 9.5 6.1-3.3 6.1-9.5 6.1S2.5 12 2.5 12Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-2 text-xs text-red-300/80">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      className="peer sr-only"
                    />

                    <span className="flex h-4 w-4 items-center justify-center rounded border border-white/15 bg-white/[0.03] transition-all peer-checked:border-emerald-400/60 peer-checked:bg-emerald-400/20">
                      {rememberMe && (
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-3 w-3 text-emerald-300"
                        >
                          <path
                            d="m4 10 3.5 3.5L16 5.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span className="text-xs text-white/40">
                      Keep me signed in
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-emerald-400 font-medium text-[#06110d] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

                    {isLoading ? (
                      <span className="relative flex items-center gap-3">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#06110d]/25 border-t-[#06110d]" />
                        Signing you in...
                      </span>
                    ) : (
                      <span className="relative flex items-center gap-2">
                        Enter EnvoCentre

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          <path
                            d="M5 12h13M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/[0.07]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                    Secure workspace
                  </span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                {/* Security */}
                <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-emerald-300/60"
                  >
                    <path
                      d="M12 3 5 6v5c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6l-7-3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span>
                    Your environmental workspace, protected.
                  </span>
                </div>

                {/* Register */}
                <p className="mt-7 text-center text-sm text-white/35">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-emerald-300 transition-colors hover:text-emerald-200"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>

            {/* Card bottom decoration */}
            <div className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/[0.05] px-5 py-6 text-[10px] uppercase tracking-[0.16em] text-white/20 sm:flex-row sm:px-8 lg:px-10">
        <span>
          © {new Date().getFullYear()} EnvoCentre
        </span>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="transition-colors hover:text-white/50"
          >
            Home
          </Link>

          <Link
            href="/register"
            className="transition-colors hover:text-white/50"
          >
            Register
          </Link>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            Environmental Intelligence
          </span>
        </div>
      </footer>
    </main>
  );
}