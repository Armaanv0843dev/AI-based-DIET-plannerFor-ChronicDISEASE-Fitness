"use client";

import React from "react";
import DietDashboard from "@/components/diet-dashboard";
import { useRequireDietPlan } from "@/hooks/use-route-protection";

export default function Page() {
  const { loading } = useRequireDietPlan();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#071023] to-[#0b1220]">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return <DietDashboard />;
}
