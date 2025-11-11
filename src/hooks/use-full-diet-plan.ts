"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratePersonalizedDietPlanOutput } from "@/ai/flows/generate-personalized-diet-plan";

const FULL_DIET_PLAN_KEY = "chronoDietAIFullPlan";

export function useFullDietPlan() {
  const [plan, setPlan] = useState<GeneratePersonalizedDietPlanOutput | null>(null);
  const [loading, setLoading] = useState(true);

  // Load full plan from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FULL_DIET_PLAN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize quantities inside the full plan if present
        const normalizeQuantity = (q?: string) => {
          if (!q) return "";
          const s = q.toString().trim();
          if (!s) return "";
          const numericOnly = s.match(/^(\d+(?:\.\d+)?)$/);
          if (numericOnly) return `${numericOnly[1]} gm`;
          const gramsMatch = s.match(/^(\d+(?:\.\d+)?)\s*(g|gm|gram|grams)$/i);
          if (gramsMatch) return `${gramsMatch[1]} gm`;
          const kgMatch = s.match(/^(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms)$/i);
          if (kgMatch) return `${parseFloat(kgMatch[1]) * 1000} gm`;
          return s;
        };

        // Walk through dietPlan and normalize meal.quantity
        if (parsed && parsed.dietPlan) {
          for (const cat of Object.keys(parsed.dietPlan)) {
            const arr = parsed.dietPlan[cat] || [];
            parsed.dietPlan[cat] = arr.map((m: any) => ({ ...m, quantity: normalizeQuantity(m?.quantity || "") }));
          }
        }
        setPlan(parsed);
      }
    } catch (error) {
      console.error("Failed to load full diet plan", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save full plan to localStorage
  const saveFullDietPlan = useCallback((newPlan: GeneratePersonalizedDietPlanOutput) => {
    try {
      localStorage.setItem(FULL_DIET_PLAN_KEY, JSON.stringify(newPlan));
      setPlan(newPlan);
    } catch (error) {
      console.error("Failed to save full diet plan", error);
    }
  }, []);

  // Clear plan
  const clearFullDietPlan = useCallback(() => {
    try {
      localStorage.removeItem(FULL_DIET_PLAN_KEY);
      setPlan(null);
    } catch (error) {
      console.error("Failed to clear full diet plan", error);
    }
  }, []);

  return {
    plan,
    loading,
    saveFullDietPlan,
    clearFullDietPlan,
  };
}
