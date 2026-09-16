"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
        },
      });

      tl.fromTo(
        ".nav-item",
        {
          y: -20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
        }
      )
        .fromTo(
          ".hero-eyebrow",
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          "-=0.3"
        )
        .fromTo(
          titleRef.current,
          {
            y: 80,
            opacity: 0,
            filter: "blur(12px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
          },
          "-=0.3"
        )
        .fromTo(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          "-=0.7"
        )
        .fromTo(
          actionsRef.current,
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
          },
          "-=0.5"
        )
        .fromTo(
          visualRef.current,
          {
            x: 80,
            opacity: 0,
            scale: 0.95,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
          },
          "-=0.8"
        );

      gsap.to(".orb-one", {
        y: -30,
        x: 20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".orb-two", {
        y: 30,
        x: -25,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".dashboard-float", {
        y: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 70,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card) => {
        gsap.fromTo(
          card,
          {
            y: 60,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      gsap.fromTo(
        ".workflow-line",
        {
          scaleX: 0,
          transformOrigin: "left center",
        },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ".workflow-section",
            start: "top 70%",
            once: true,
          },
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={heroRef}
      className="min-h-screen overflow-hidden bg-[#07100c] text-white"
    >
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(44,255,142,0.10),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(73,180,255,0.08),transparent_28%),linear-gradient(180deg,#07100c_0%,#09140f_45%,#050a07_100%)]" />

        <div className="orb-one absolute left-[8%] top-[15%] h-72 w-72 rounded-full bg-emerald-400/10 blur-[120px]" />

        <div className="orb-two absolute right-[5%] top-[40%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[130px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:70px_70px]" />
      </div>

      {/* NAVBAR */}
      <nav className="nav-item mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="nav-item flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10">
            <span className="text-xl">◈</span>
          </div>

          <div>
            <div className="text-lg font-bold tracking-tight">
              Envo<span className="text-emerald-400">Centre</span>
            </div>

            <div className="text-[9px] uppercase tracking-[0.28em] text-white/40">
              Environmental Intelligence
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a
            href="#features"
            className="nav-item transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#workflow"
            className="nav-item transition hover:text-white"
          >
            How it works
          </a>

          <a
            href="#calculations"
            className="nav-item transition hover:text-white"
          >
            Calculations
          </a>
        </div>

        <Link
          href="/dashboard"
          className="nav-item rounded-full border border-emerald-300/20 bg-white/[0.04] px-5 py-2.5 text-sm font-medium transition hover:border-emerald-300/40 hover:bg-emerald-400/10"
        >
          Open Platform
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl items-center px-6 pb-20 pt-10 lg:px-10 lg:pt-0">
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          {/* LEFT */}
          <div>
            <div className="hero-eyebrow mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-300/15 bg-emerald-400/[0.07] px-4 py-2 text-xs uppercase tracking-[0.18em] text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              Environmental intelligence platform
            </div>

            <h1
              ref={titleRef}
              className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-8xl"
            >
              Measure impact.
              <br />

              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                Understand change.
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="mt-8 max-w-xl text-base leading-7 text-white/55 sm:text-lg"
            >
              Turn environmental data into meaningful calculations,
              measurable insights, and better decisions — all from one
              intelligent platform.
            </p>

            <div ref={actionsRef} className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/auth/login"
                className="group flex items-center gap-3 rounded-full bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#041009] transition hover:bg-emerald-300"
              >
                Get Started

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#features"
                className="rounded-full border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-medium text-white/75 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                Explore the platform
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/10 pt-7">
              <div>
                <p className="text-2xl font-semibold">01</p>
                <p className="mt-1 text-xs text-white/40">
                  Centralized calculations
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold">02</p>
                <p className="mt-1 text-xs text-white/40">
                  Structured environmental data
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold">03</p>
                <p className="mt-1 text-xs text-white/40">
                  Actionable insights
                </p>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div ref={visualRef} className="relative">
            <div className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-[100px]" />

            <div className="dashboard-float relative rounded-[28px] border border-white/10 bg-[#0b1711]/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* top bar */}
              <div className="flex items-center justify-between border-b border-white/10 px-3 pb-4">
                <div>
                  <p className="text-xs text-white/40">OVERVIEW</p>
                  <p className="mt-1 font-medium">Environmental Dashboard</p>
                </div>

                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400/70" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                </div>
              </div>

              {/* metric */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs text-white/40">TOTAL CALCULATIONS</p>
                  <p className="mt-3 text-3xl font-semibold">1,248</p>

                  <p className="mt-2 text-xs text-emerald-300">
                    ↑ 18.4% this month
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-300/10 bg-emerald-400/[0.06] p-5">
                  <p className="text-xs text-white/40">IMPACT SCORE</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-300">
                    84.7
                  </p>

                  <p className="mt-2 text-xs text-white/40">
                    Current assessment
                  </p>
                </div>
              </div>

              {/* graph */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Environmental impact
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      Calculation trend
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-300">
                    LIVE
                  </span>
                </div>

                <div className="relative mt-7 h-36">
                  <div className="absolute inset-x-0 top-0 border-t border-white/5" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-white/5" />
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/5" />

                  <svg
                    viewBox="0 0 500 150"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="area"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity=".25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 125 C45 112, 65 118, 105 95 S165 75, 205 88 S260 70, 300 58 S355 72, 390 45 S455 30, 500 12 L500 150 L0 150 Z"
                      fill="url(#area)"
                    />

                    <path
                      d="M0 125 C45 112, 65 118, 105 95 S165 75, 205 88 S260 70, 300 58 S355 72, 390 45 S455 30, 500 12"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              {/* bottom cards */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  ["CO₂", "2.84t"],
                  ["Energy", "482kWh"],
                  ["Water", "1.2kL"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <p className="text-[10px] uppercase text-white/35">
                      {label}
                    </p>

                    <p className="mt-2 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-emerald-300/10 bg-[#0b1711]/90 px-5 py-4 shadow-xl backdrop-blur-xl">
              <p className="text-[10px] uppercase tracking-wider text-white/35">
                Analysis status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-emerald-300">
                  Calculation ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / STATEMENT */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="reveal grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">
              Why EnvoCentre
            </p>

            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight text-white/90 sm:text-4xl lg:text-5xl">
              Environmental decisions become powerful when{" "}
              <span className="text-emerald-300">
                data becomes understandable.
              </span>
            </h2>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
        <div className="reveal max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            The platform
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to understand your environmental numbers.
          </h2>

          <p className="mt-6 leading-7 text-white/45">
            EnvoCentre brings calculations, results, history and environmental
            intelligence together so you can focus on what the numbers mean.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              number: "01",
              title: "Smart calculations",
              text: "Run structured environmental calculations without juggling spreadsheets, formulas and disconnected tools.",
              icon: "∑",
            },
            {
              number: "02",
              title: "Centralized history",
              text: "Keep your calculations organized and accessible so you can compare previous assessments and track change.",
              icon: "↗",
            },
            {
              number: "03",
              title: "Clear insights",
              text: "Transform raw environmental inputs into results that are easier to interpret and act upon.",
              icon: "◌",
            },
            {
              number: "04",
              title: "Structured data",
              text: "Work with consistent calculation records and structured results designed for reliable analysis.",
              icon: "⌘",
            },
            {
              number: "05",
              title: "Built for decisions",
              text: "The goal isn't another dashboard. It's helping you understand what your environmental data actually means.",
              icon: "◆",
            },
            {
              number: "06",
              title: "One platform",
              text: "Bring your environmental calculation workflow into one focused, modern workspace.",
              icon: "◎",
            },
          ].map((feature) => (
            <div
              key={feature.number}
              className="feature-card group relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.025] p-7 transition duration-500 hover:-translate-y-1 hover:border-emerald-300/20 hover:bg-emerald-400/[0.035]"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/5 blur-3xl transition group-hover:bg-emerald-400/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/25">
                    {feature.number}
                  </span>

                  <span className="text-2xl text-emerald-300/80">
                    {feature.icon}
                  </span>
                </div>

                <h3 className="mt-14 text-xl font-medium">{feature.title}</h3>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="workflow-section border-y border-white/5 bg-[#09130e]"
      >
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <div className="reveal text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Simple by design
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              From input to insight in three steps.
            </h2>
          </div>

          <div className="relative mt-20 grid gap-12 md:grid-cols-3">
            <div className="workflow-line absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-emerald-400/10 via-emerald-400/50 to-emerald-400/10 md:block" />

            {[
              {
                step: "01",
                title: "Enter your data",
                text: "Provide the information required for your environmental calculation.",
              },
              {
                step: "02",
                title: "Calculate",
                text: "Let the platform process your inputs and produce a structured result.",
              },
              {
                step: "03",
                title: "Understand",
                text: "Explore the result, compare your history and turn data into decisions.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="reveal relative text-center md:text-left"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-[#09130e] text-sm font-semibold text-emerald-300 md:mx-0">
                  {item.step}
                </div>

                <h3 className="mt-7 text-xl font-medium">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATIONS */}
      <section
        id="calculations"
        className="mx-auto max-w-7xl px-6 py-28 lg:px-10"
      >
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="reveal">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Calculations
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Your calculations.
              <br />
              <span className="text-white/40">Your environmental story.</span>
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-white/45">
              Every calculation becomes part of a structured record. Review
              what you've calculated, understand your results and build a
              clearer picture over time.
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-6 py-3 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
            >
              Explore calculations →
            </Link>
          </div>

          <div className="reveal">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/30">RECENT ACTIVITY</p>
                  <h3 className="mt-1 font-medium">Calculation history</h3>
                </div>

                <span className="text-xs text-white/30">View all →</span>
              </div>

              <div className="space-y-2">
                {[
                  ["Environmental Assessment", "Today", "84.7"],
                  ["Resource Impact", "Yesterday", "72.3"],
                  ["Carbon Calculation", "Sep 12", "91.8"],
                  ["Energy Assessment", "Sep 10", "67.4"],
                ].map(([name, date, score], index) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:border-emerald-300/10 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-sm text-emerald-300">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="mt-1 text-xs text-white/30">{date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">{score}</p>
                      <p className="mt-1 text-[10px] text-emerald-300">
                        SCORE
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-emerald-300/10 bg-gradient-to-br from-emerald-400/[0.12] via-white/[0.025] to-cyan-400/[0.06] px-8 py-20 text-center sm:px-12">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]" />

          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Start with the numbers
            </p>

            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
              The environment is complex.
              <br />
              <span className="text-emerald-300">
                Understanding it shouldn't be.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
              Start exploring environmental calculations with EnvoCentre and
              turn data into something you can actually use.
            </p>

            <Link
              href="/dashboard"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-emerald-400 px-7 py-4 text-sm font-semibold text-[#041009] transition hover:bg-emerald-300"
            >
              Enter EnvoCentre
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
              ◈
            </div>

            <span>EnvoCentre</span>
          </div>

          <p>
            Environmental intelligence for better decisions.
          </p>

          <p>© {new Date().getFullYear()} EnvoCentre</p>
        </div>
      </footer>
    </main>
  );
}
