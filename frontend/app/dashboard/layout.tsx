"use client";

import { useState } from "react";
import Sidebar, {
  MobileMenuButton,
} from "@/pages/user_page/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06100d] text-white">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        // setMobileOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div className="min-h-screen lg:pl-[260px]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-white/[0.07] bg-[#06100d]/90 px-4 backdrop-blur-xl lg:hidden">
          <MobileMenuButton
            onClick={() => setSidebarOpen(true)}
          />

          <div className="ml-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-sm font-bold text-emerald-400">
              E
            </div>

            <span className="text-sm font-semibold">
              EnvoCentre
            </span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}