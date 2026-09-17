
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";

type FormData = {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      tl.fromTo(
        ".register-nav",
        {
          y: -25,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
        }
      )
        .fromTo(
          ".register-copy",
          {
            x: -60,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
          },
          "-=0.3"
        )
        .fromTo(
          ".register-form",
          {
            x: 60,
            opacity: 0,
            scale: 0.97,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
          },
          "-=0.8"
        )
        .fromTo(
          ".register-stat",
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.5"
        );

      gsap.to(".ambient-orb-one", {
        x: 35,
        y: -25,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".ambient-orb-two", {
        x: -30,
        y: 30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".floating-symbol", {
        y: -12,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setApiError("");
  };

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (form.username.length < 3) {
      newErrors.username = "Username must contain at least 3 characters.";
    } else if (form.username.length > 30) {
      newErrors.username = "Username cannot exceed 30 characters.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = "Please confirm your password.";
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) {
      return {
        score: 0,
        label: "",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        score,
        label: "Weak password",
      };
    }

    if (score <= 3) {
      return {
        score,
        label: "Moderate password",
      };
    }

    return {
      score,
      label: "Strong password",
    };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setApiError("");

    try {

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
          confirm_password: form.confirm_password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to create your account. Please try again."
        );
      }
      console.log(data);
      router.push("/auth/login");
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100c] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(52,211,153,0.12),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.08),transparent_28%),linear-gradient(135deg,#07100c,#09140f_50%,#050a07)]" />

        <div className="ambient-orb-one absolute left-[-8%] top-[20%] h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-[130px]" />

        <div className="ambient-orb-two absolute bottom-[-10%] right-[-5%] h-[450px] w-[450px] rounded-full bg-cyan-400/10 blur-[140px]" />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      {/* NAVBAR */}
      <nav className="register-nav relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-xl text-emerald-300">
            ◈
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight">
              Envo<span className="text-emerald-400">Centre</span>
            </div>

            <div className="text-[9px] uppercase tracking-[0.28em] text-white/35">
              Environmental Intelligence
            </div>
          </div>
        </Link>

        <div className="text-sm text-white/45">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="ml-1 font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl items-center px-6 pb-16 pt-8 lg:px-10 lg:pt-0">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_0.9fr]">
          {/* LEFT SIDE */}
          <div className="register-copy">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-300/15 bg-emerald-400/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,.8)]" />

              Start your environmental journey
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Make your data
              <br />

              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                mean something.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
              Create your EnvoCentre account and bring your environmental
              calculations, insights and history into one intelligent
              workspace.
            </p>

            {/* BENEFITS */}
            <div className="mt-10 space-y-4">
              {[
                {
                  title: "Centralize your calculations",
                  text: "Keep your environmental assessments organized.",
                },
                {
                  title: "Understand your impact",
                  text: "Turn structured data into meaningful insights.",
                },
                {
                  title: "Track your progress",
                  text: "Build a clearer picture of environmental change.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="register-stat flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/15 bg-emerald-400/[0.06] text-xs text-emerald-300">
                    0{index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white/85">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* TRUST */}
            <div className="mt-10 flex items-center gap-5 border-t border-white/8 pt-7">
              <div className="floating-symbol flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-300/10 bg-emerald-400/[0.05] text-xl text-emerald-300">
                🌱
              </div>

              <div>
                <p className="text-sm font-medium text-white/75">
                  Built around better decisions
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Data → Calculation → Understanding → Action
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="register-form">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a1510]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
              {/* FORM GLOW */}
              <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-emerald-400/10 blur-[80px]" />

              <div className="relative">
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                    Create account
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Welcome to EnvoCentre.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    Set up your account to start exploring the platform.
                  </p>
                </div>

                {apiError && (
                  <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className={`w-full rounded-2xl border bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.055] ${
                        errors.email
                          ? "border-red-400/40 focus:border-red-400/60"
                          : "border-white/10 focus:border-emerald-300/40"
                      }`}
                    />

                    {errors.email && (
                      <p className="mt-2 text-xs text-red-300">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* USERNAME */}
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username"
                      value={form.username}
                      onChange={(event) =>
                        updateField("username", event.target.value)
                      }
                      className={`w-full rounded-2xl border bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.055] ${
                        errors.username
                          ? "border-red-400/40 focus:border-red-400/60"
                          : "border-white/10 focus:border-emerald-300/40"
                      }`}
                    />

                    {errors.username && (
                      <p className="mt-2 text-xs text-red-300">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create a secure password"
                        value={form.password}
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        className={`w-full rounded-2xl border bg-white/[0.035] px-4 py-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.055] ${
                          errors.password
                            ? "border-red-400/40 focus:border-red-400/60"
                            : "border-white/10 focus:border-emerald-300/40"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-white/30 transition hover:text-white/70"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* PASSWORD STRENGTH */}
                    {form.password && (
                      <div className="mt-3">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition ${
                                level <= passwordStrength.score
                                  ? "bg-emerald-400"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="mt-2 flex justify-between">
                          <span className="text-[10px] text-white/30">
                            Use 8+ characters
                          </span>

                          <span className="text-[10px] text-emerald-300/70">
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="mt-2 text-xs text-red-300">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirm_password"
                      className="mb-2 block text-xs font-medium text-white/65"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <input
                        id="confirm_password"
                        type={
                          showConfirmPassword ? "text" : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        value={form.confirm_password}
                        onChange={(event) =>
                          updateField(
                            "confirm_password",
                            event.target.value
                          )
                        }
                        className={`w-full rounded-2xl border bg-white/[0.035] px-4 py-3.5 pr-20 text-sm text-white outline-none transition placeholder:text-white/20 focus:bg-white/[0.055] ${
                          errors.confirm_password
                            ? "border-red-400/40 focus:border-red-400/60"
                            : "border-white/10 focus:border-emerald-300/40"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-white/30 transition hover:text-white/70"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {form.confirm_password &&
                      form.password === form.confirm_password && (
                        <p className="mt-2 text-xs text-emerald-300">
                          ✓ Passwords match
                        </p>
                      )}

                    {errors.confirm_password && (
                      <p className="mt-2 text-xs text-red-300">
                        {errors.confirm_password}
                      </p>
                    )}
                  </div>

                  {/* TERMS */}
                  <div className="flex items-start gap-3 pt-1">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-400"
                    />

                    <label
                      htmlFor="terms"
                      className="text-xs leading-5 text-white/35"
                    >
                      I agree to the platform terms and understand that my
                      account will be used to access EnvoCentre's
                      environmental calculation services.
                    </label>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-semibold text-[#041009] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#041009]/30 border-t-[#041009]" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create my account
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* LOGIN */}
                <p className="mt-7 text-center text-xs text-white/30">
                  Already registered?{" "}
                  <Link
                    href="/auth/login"
                    className="text-emerald-300 transition hover:text-emerald-200"
                  >
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </div>

            {/* SECURITY NOTE */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
              <span>◈</span>
              Secure account creation
              <span>•</span>
              Environmental intelligence platform
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
