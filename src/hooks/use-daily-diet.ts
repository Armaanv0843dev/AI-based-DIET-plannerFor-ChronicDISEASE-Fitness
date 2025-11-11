"use client";

import { useState, useEffect, useCallback } from "react";

export interface Meal {
  id: string;
  name: string;
  calories: number;
  time: string;
  completed: boolean;
  quantity?: string; // e.g., '100g paneer', '1 cup cooked rice'
}

export interface DailyDiet {
  date: string;
  meals: Meal[];
  totalCalories: number;
  mealType?: string; // breakfast, lunch, dinner, snacks
}

const DAILY_DIET_STORAGE_KEY = "chronoDietAIDailyPlan";

export function useDailyDiet() {
  const [diet, setDiet] = useState<DailyDiet | null>(null);
  const [loading, setLoading] = useState(true);

  // Load diet from localStorage on mount
  useEffect(() => {
    try {
      const storedDiet = localStorage.getItem(DAILY_DIET_STORAGE_KEY);
      if (storedDiet) {
        const parsedDiet = JSON.parse(storedDiet);
        // Check if stored diet is for today
        const today = new Date().toLocaleDateString();
        if (parsedDiet.date === today) {
          // Normalize quantity values if present (ensure 'gm' units for numeric quantities)
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

          const normalized = {
            ...parsedDiet,
            meals: (parsedDiet.meals || []).map((m: any) => ({
              ...m,
              quantity: normalizeQuantity(m?.quantity || ""),
            })),
          };
          setDiet(normalized);
        } else {
          // Clear old diet
          localStorage.removeItem(DAILY_DIET_STORAGE_KEY);
          setDiet(null);
        }
      }
    } catch (error) {
      console.error("Failed to load daily diet from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save diet to localStorage
  const saveDailyDiet = useCallback((newDiet: DailyDiet) => {
    try {
      localStorage.setItem(DAILY_DIET_STORAGE_KEY, JSON.stringify(newDiet));
      setDiet(newDiet);
    } catch (error) {
      console.error("Failed to save daily diet to localStorage", error);
    }
  }, []);

  // Save meals for today
  const setTodaysMeals = useCallback((meals: Meal[]) => {
    const today = new Date().toLocaleDateString();
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const newDiet: DailyDiet = {
      date: today,
      meals,
      totalCalories,
    };
    saveDailyDiet(newDiet);
  }, [saveDailyDiet]);

  // Toggle meal completion status
  const toggleMealCompletion = useCallback((mealId: string) => {
    if (!diet) return;
    const updatedMeals = diet.meals.map((meal) =>
      meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
    );
    saveDailyDiet({ ...diet, meals: updatedMeals });
  }, [diet, saveDailyDiet]);

  // Delete all meals for today (clear diet)
  const deleteTodaysDiet = useCallback(() => {
    try {
      localStorage.removeItem(DAILY_DIET_STORAGE_KEY);
      setDiet(null);
    } catch (error) {
      console.error("Failed to delete daily diet from localStorage", error);
    }
  }, []);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!diet || diet.meals.length === 0) return 0;
    const completed = diet.meals.filter((m) => m.completed).length;
    return Math.round((completed / diet.meals.length) * 100);
  }, [diet]);

  return {
    diet,
    loading,
    setTodaysMeals,
    toggleMealCompletion,
    deleteTodaysDiet,
    getCompletionPercentage,
  };
}
