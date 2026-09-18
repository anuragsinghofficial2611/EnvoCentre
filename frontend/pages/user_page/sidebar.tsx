"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Activity,
  BarChart3,
  Calculator,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  GitCompare,
  Home,
  Menu,
  Plus,
  Settings,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

/* =========================================================
   Navigation
========================================================= */

const workspaceItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Calculations",
    href: "/dashboard/calculations",
    icon: Calculator,
  },
  {
    label: "Compare",
    href: "/dashboard/calculations/compare",
    icon: GitCompare,
  },
];

const manageItems = [
  {
    label: "Batch Calculations",
    href: "/dashboard/calculations/batch",
    icon: Upload,
  },
  
];

const settingsItems = [
];

/* =========================================================
   Sidebar
========================================================= */

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const ambientRef = useRef<HTMLDivElement | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  /* -------------------------------------------------------
     Restore sidebar state
  ------------------------------------------------------- */

  useEffect(() => {
    const storedState =
      window.localStorage.getItem("envocentre-sidebar");

    if (storedState === "collapsed") {
      setCollapsed(true);
    }
  }, []);

  /* -------------------------------------------------------
     Initial GSAP animation
  ------------------------------------------------------- */

  useEffect(() => {
    if (!sidebarRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sidebarRef.current,
        {
          x: -30,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        },
      );

      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          {
            y: -12,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            delay: 0.15,
            ease: "power3.out",
          },
        );
      }

      if (navRef.current) {
        gsap.fromTo(
          navRef.current.children,
          {
            x: -15,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.055,
            delay: 0.22,
            ease: "power2.out",
          },
        );
      }

      if (ambientRef.current) {
        gsap.to(ambientRef.current, {
          y: 25,
          x: 10,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  /* -------------------------------------------------------
     Mobile animation
  ------------------------------------------------------- */

  useEffect(() => {
    if (!mobileOpen || !sidebarRef.current) return;

    gsap.fromTo(
      sidebarRef.current,
      {
        x: -300,
      },
      {
        x: 0,
        duration: 0.45,
        ease: "power3.out",
      },
    );
  }, [mobileOpen]);

  /* -------------------------------------------------------
     Collapse
  ------------------------------------------------------- */

  const toggleCollapsed = () => {
    const nextState = !collapsed;

    setCollapsed(nextState);

    window.localStorage.setItem(
      "envocentre-sidebar",
      nextState ? "collapsed" : "expanded",
    );
  };

  /* -------------------------------------------------------
     Route active state
  ------------------------------------------------------- */

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname?.startsWith(`${href}/`)
    );
  };

  /* -------------------------------------------------------
     Navigation item
  ------------------------------------------------------- */

  const renderNavigationItem = (
    item: {
      label: string;
      href: string;
      icon: React.ElementType;
    },
  ) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => onMobileClose?.()}
        title={collapsed ? item.label : undefined}
        className={`
          group relative flex items-center gap-3
          rounded-xl px-3 py-2.5
          text-sm font-medium
          transition-all duration-200
          ${collapsed ? "justify-center" : ""}
          ${
            active
              ? "bg-emerald-400/[0.10] text-emerald-300"
              : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-100"
          }
        `}
      >
        {/* Active indicator */}

        {active && (
          <span
            className="
              absolute left-0 top-1/2
              h-5 w-0.5
              -translate-y-1/2
              rounded-full
              bg-emerald-400
              shadow-[0_0_10px_rgba(52,211,153,0.65)]
            "
          />
        )}

        {/* Icon */}

        <Icon
          size={18}
          strokeWidth={1.8}
          className={`
            shrink-0 transition-colors
            ${
              active
                ? "text-emerald-300"
                : "text-zinc-500 group-hover:text-zinc-300"
            }
          `}
        />

        {/* Label */}

        {!collapsed && (
          <span className="truncate">
            {item.label}
          </span>
        )}

        {/* Collapsed tooltip */}

        {collapsed && (
          <span
            className="
              pointer-events-none absolute
              left-[calc(100%+12px)]
              z-[100]
              whitespace-nowrap
              rounded-lg
              border border-white/[0.08]
              bg-[#090f0c]
              px-3 py-2
              text-xs
              font-medium
              text-zinc-200
              opacity-0
              shadow-2xl
              transition-opacity duration-200
              group-hover:opacity-100
            "
          >
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* =====================================================
          Mobile backdrop
      ===================================================== */}

      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="
            fixed inset-0 z-40
            bg-black/65
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 z-50
          flex h-screen flex-col
          overflow-hidden
          border-r border-white/[0.07]
          bg-[#07100c]/95
          backdrop-blur-2xl

          transition-[width] duration-300

          ${
            collapsed
              ? "w-[76px]"
              : "w-[260px]"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =================================================
            Ambient glow
        ================================================= */}

        <div
          ref={ambientRef}
          className="
            pointer-events-none
            absolute
            -right-24
            top-24
            h-48
            w-48
            rounded-full
            bg-emerald-400/[0.035]
            blur-[70px]
          "
        />

        {/* =================================================
            Logo section
        ================================================= */}

        <div
          ref={logoRef}
          className={`
            relative
            flex h-[78px]
            shrink-0
            items-center
            border-b border-white/[0.06]

            ${
              collapsed
                ? "justify-center px-3"
                : "px-5"
            }
          `}
        >
          <Link
            href="/dashboard"
            onClick={() => onMobileClose?.()}
            className="
              group flex items-center gap-3
            "
          >
            {/* Logo icon */}

            <div
              className="
                relative
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                border border-emerald-400/20
                bg-emerald-400/[0.08]
              "
            >
              <div
                className="
                  absolute inset-0
                  rounded-xl
                  bg-emerald-400/[0.08]
                  blur-md
                  transition-all
                  duration-300
                  group-hover:bg-emerald-400/[0.18]
                "
              />

              <Activity
                size={21}
                strokeWidth={2}
                className="
                  relative
                  text-emerald-300
                "
              />
            </div>

            {/* Brand */}

            {!collapsed && (
              <div>
                <div
                  className="
                    text-[17px]
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  Envo
                  <span className="text-emerald-400">
                    Centre
                  </span>
                </div>

                <div
                  className="
                    mt-0.5
                    text-[9px]
                    uppercase
                    tracking-[0.2em]
                    text-zinc-600
                  "
                >
                  Environmental intelligence
                </div>
              </div>
            )}
          </Link>

          {/* Mobile close */}

          <button
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="
              ml-auto
              rounded-lg
              p-2
              text-zinc-500
              transition-colors
              hover:bg-white/[0.05]
              hover:text-white
              lg:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            Navigation
        ================================================= */}

        <div
          ref={navRef}
          className="
            relative
            flex-1
            overflow-y-auto
            px-3 py-5
            scrollbar-none
          "
        >
          {/* Workspace */}

          <SectionLabel
            label="Workspace"
            collapsed={collapsed}
          />

          <nav className="space-y-1">
            {workspaceItems.map(
              renderNavigationItem,
            )}
          </nav>

          {/* =================================================
              New calculation CTA
          ================================================= */}

          <div
            className="
              my-5
              border-t
              border-white/[0.06]
              pt-5
            "
          >
            <Link
              href="/dashboard/calculations/new"
              onClick={() => onMobileClose?.()}
              title={
                collapsed
                  ? "New Calculation"
                  : undefined
              }
              className={`
                group relative
                flex items-center gap-3
                overflow-hidden
                rounded-xl
                border
                border-emerald-400/20
                bg-emerald-400/[0.08]
                px-3 py-2.5
                text-sm
                font-medium
                text-emerald-300

                transition-all duration-300

                hover:border-emerald-300/30
                hover:bg-emerald-400/[0.13]

                ${
                  collapsed
                    ? "justify-center"
                    : ""
                }
              `}
            >
              {/* Hover shine */}

              <div
                className="
                  absolute inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/[0.07]
                  to-transparent
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <Plus
                size={18}
                strokeWidth={2}
                className="
                  relative
                  shrink-0
                "
              />

              {!collapsed && (
                <span className="relative">
                  New Calculation
                </span>
              )}

              {/* Tooltip */}

              {collapsed && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-[calc(100%+12px)]
                    z-[100]
                    whitespace-nowrap
                    rounded-lg
                    border border-white/[0.08]
                    bg-[#090f0c]
                    px-3 py-2
                    text-xs
                    text-zinc-200
                    opacity-0
                    shadow-2xl
                    transition-opacity
                    group-hover:opacity-100
                  "
                >
                  New Calculation
                </span>
              )}
            </Link>
          </div>

          {/* Manage */}

          <SectionLabel
            label="Manage"
            collapsed={collapsed}
          />

          <nav className="space-y-1">
            {manageItems.map(
              renderNavigationItem,
            )}
          </nav>
        </div>

        {/* =================================================
            Bottom section
        ================================================= */}

        <div
          className="
            relative
            shrink-0
            border-t
            border-white/[0.06]
            p-3
          "
        >
          {/* Settings */}

          <nav className="space-y-1">
            {settingsItems.map(
              renderNavigationItem,
            )}
          </nav>

          {/* =================================================
              User profile
          ================================================= */}

          {!collapsed ? (
            <div
              className="
                mt-3
                flex items-center gap-3
                rounded-xl
                border border-white/[0.05]
                bg-white/[0.025]
                p-2.5
              "
            >
              <div
                className="
                  flex h-9 w-9
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-emerald-400/20
                  to-cyan-400/10
                  text-sm
                  font-semibold
                  text-emerald-300
                "
              >
                A
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-xs
                    font-medium
                    text-zinc-200
                  "
                >
                  Your workspace
                </p>

                <p
                  className="
                    truncate
                    text-[10px]
                    text-zinc-600
                  "
                >
                  Environmental account
                </p>
              </div>

              <div
                className="
                  h-1.5 w-1.5
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.8)]
                "
              />
            </div>
          ) : (
            <div className="mt-3 flex justify-center">
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-emerald-400/20
                  to-cyan-400/10
                  text-sm
                  font-semibold
                  text-emerald-300
                "
              >
                A
              </div>
            </div>
          )}

          {/* =================================================
              Collapse button
          ================================================= */}

          <button
            onClick={toggleCollapsed}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className="
              mt-3
              hidden
              w-full
              items-center
              justify-center
              rounded-lg
              border border-white/[0.05]
              py-2
              text-zinc-600
              transition-all
              hover:bg-white/[0.04]
              hover:text-zinc-300
              lg:flex
            "
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />

                <span className="ml-2 text-[11px]">
                  Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   Section Label
========================================================= */

function SectionLabel({
  label,
  collapsed,
}: {
  label: string;
  collapsed: boolean;
}) {
  return (
    <div className="mb-3 px-2">
      {collapsed ? (
        <div
          className="
            mx-auto
            h-px
            w-5
            bg-white/[0.10]
          "
        />
      ) : (
        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-zinc-600
          "
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   Mobile Menu Button
========================================================= */

export function MobileMenuButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Open navigation"
      className="
        flex h-10 w-10
        items-center justify-center
        rounded-xl
        border border-white/[0.08]
        bg-white/[0.035]
        text-zinc-300
        transition-all

        hover:border-white/[0.12]
        hover:bg-white/[0.07]
        hover:text-white

        lg:hidden
      "
    >
      <Menu size={19} />
    </button>
  );
}