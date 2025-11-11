"use client";

import React, { useMemo, useState } from "react";
import { useDailyDiet } from "@/hooks/use-daily-diet";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Link from "next/link";
import { Trash2, Search, FileText, CheckSquare, Loader2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartTooltip, Legend as RechartLegend } from "recharts";

export default function DietDashboard() {
  const accent = "#309c3e";
  const accentDark = "#1f6b2a";
  const {
    diet,
    loading,
    toggleMealCompletion,
    deleteTodaysDiet,
    getCompletionPercentage,
    setTodaysMeals,
  } = useDailyDiet();

  const [query, setQuery] = useState("");
  const [filterTime, setFilterTime] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const dailyCalorieGoal = 2000;
  const remainingCalories = diet ? Math.max(0, dailyCalorieGoal - diet.totalCalories) : dailyCalorieGoal;
  const completionPercentage = getCompletionPercentage();
  const caloriePercentage = diet ? Math.min(100, (diet.totalCalories / dailyCalorieGoal) * 100) : 0;

  const filteredMeals = useMemo(() => {
    if (!diet) return [];
    return diet.meals.filter((m) => {
      const matchesQuery = `${m.name} ${m.time}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filterTime === "all" ? true : (m.time || "").toLowerCase() === filterTime;
      return matchesQuery && matchesFilter;
    });
  }, [diet, query, filterTime]);

  const mealsBySection = useMemo(() => {
    if (!diet) return {};
    const sections: Record<string, typeof diet.meals> = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snacks: [],
    };
    
    diet.meals.forEach((m) => {
      const mealType = (m.time || "").toLowerCase();
      if (mealType.includes("breakfast")) sections.Breakfast.push(m);
      else if (mealType.includes("lunch")) sections.Lunch.push(m);
      else if (mealType.includes("dinner")) sections.Dinner.push(m);
      else if (mealType.includes("snack")) sections.Snacks.push(m);
    });
    
    return Object.fromEntries(Object.entries(sections).filter(([_, meals]) => meals.length > 0));
  }, [diet]);

  const mealTimeSummary = useMemo(() => {
    if (!diet) return [];
    const map: Record<string, number> = {};
    diet.meals.forEach((m) => {
      const key = (m.time || "Other").toString();
      map[key] = (map[key] || 0) + (m.calories || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [diet]);

  const COLORS = ["#309c3e", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

  // Map meal sections to specific solid colors used for the Pie chart slices.
  // Breakfast -> orange, Lunch -> cyan, Dinner -> purple/pink, Snacks -> amber
  const sectionColorsMap: Record<string, string> = {
    Breakfast: "#fb923c", // orange-400
    Lunch: "#06b6d4", // cyan-500
    Dinner: "#c084fc", // purple-300 / pinkish
    Snacks: "#eefb00ff", // amber-500
  };

  const getColorForName = (name: string | undefined, index: number) => {
    const n = (name || "").toLowerCase();
    if (n.includes("breakfast")) return sectionColorsMap.Breakfast;
    if (n.includes("lunch")) return sectionColorsMap.Lunch;
    if (n.includes("dinner")) return sectionColorsMap.Dinner;
    if (n.includes("snack")) return sectionColorsMap.Snacks;
    return COLORS[index % COLORS.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0a0e27] via-[#0f1a37] to-[#0b1220]">
        <div className="text-slate-300 flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Loading your diet...</div>
      </div>
    );
  }

  const handleExportCSV = async () => {
    if (!diet) return;
    setExporting(true);
    try {
      // Helper function to escape CSV values
      const escapeCSV = (value: string) => {
        if (value === undefined || value === null) return "";
        const str = value.toString().replace(/\r|\n/g, " ");
        // If value contains comma, quote, or newline, wrap in quotes
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Create proper CSV table format (exclude Meal Time column per user request)
      const headers = ["Meal Type", "Meal Name", "Quantity", "Calories", "Completed"];
      const rows = diet.meals.map((m) => {
        // Extract meal type from time field (e.g., "breakfast - Meal Name" -> "breakfast")
        const mealType = escapeCSV(m.time?.split(" - ")[0] || "");
        const name = escapeCSV(m.name || "");
        const quantity = escapeCSV((m as any).quantity || "");
        const calories = String(m.calories ?? "");
        const completed = m.completed ? "Yes" : "No";
        return [mealType, name, quantity, calories, completed].join(",");
      });

      // Combine headers and rows
      const headerRow = headers.join(",");
      const csv = [headerRow, ...rows].join("\n");

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diet-${diet.date || new Date().toLocaleDateString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleMarkAllComplete = () => {
    if (!diet) return;
    const updated = diet.meals.map((m) => ({ ...m, completed: true }));
    setTodaysMeals(updated);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const performDelete = () => {
    deleteTodaysDiet();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1a37] to-[#0b1220] text-slate-100">
      <div className="w-full max-w-full p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg bg-gradient-to-br from-emerald-100 to-green-100 p-2"
            >
              <svg width="100%" height="100%" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                {/* Tree trunk */}
                <rect x="85" y="160" width="30" height="70" fill="#4a5568" />
                
                {/* Main branches and leaves */}
                {/* Top center leaf */}
                <ellipse cx="100" cy="50" rx="18" ry="28" fill="#22c55e" transform="rotate(0 100 50)" />
                
                {/* Upper left leaves */}
                <ellipse cx="65" cy="70" rx="15" ry="25" fill="#16a34a" transform="rotate(-35 65 70)" />
                <ellipse cx="55" cy="95" rx="14" ry="22" fill="#22c55e" transform="rotate(-50 55 95)" />
                <ellipse cx="50" cy="125" rx="12" ry="20" fill="#16a34a" transform="rotate(-60 50 125)" />
                
                {/* Upper right leaves */}
                <ellipse cx="135" cy="70" rx="15" ry="25" fill="#16a34a" transform="rotate(35 135 70)" />
                <ellipse cx="145" cy="95" rx="14" ry="22" fill="#22c55e" transform="rotate(50 145 95)" />
                <ellipse cx="150" cy="125" rx="12" ry="20" fill="#16a34a" transform="rotate(60 150 125)" />
                
                {/* Middle left leaves */}
                <ellipse cx="70" cy="100" rx="13" ry="18" fill="#22c55e" transform="rotate(-45 70 100)" />
                <ellipse cx="60" cy="130" rx="11" ry="16" fill="#16a34a" transform="rotate(-55 60 130)" />
                
                {/* Middle right leaves */}
                <ellipse cx="130" cy="100" rx="13" ry="18" fill="#22c55e" transform="rotate(45 130 100)" />
                <ellipse cx="140" cy="130" rx="11" ry="16" fill="#16a34a" transform="rotate(55 140 130)" />
                
                {/* Small accent leaves scattered */}
                <ellipse cx="80" cy="60" rx="8" ry="12" fill="#86efac" transform="rotate(-30 80 60)" />
                <ellipse cx="120" cy="60" rx="8" ry="12" fill="#86efac" transform="rotate(30 120 60)" />
                <ellipse cx="45" cy="110" rx="7" ry="10" fill="#86efac" transform="rotate(-40 45 110)" />
                <ellipse cx="155" cy="110" rx="7" ry="10" fill="#86efac" transform="rotate(40 155 110)" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">
                Daily Nutrition Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Track and manage your meals for today ({diet?.date || new Date().toLocaleDateString()})</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <Button 
              variant="ghost" 
              className="gap-2 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              onClick={handleMarkAllComplete}
            >
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2 text-slate-100 bg-slate-800/30 border border-emerald-600/30 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-600 hover:text-white transition-all px-3 py-1 rounded-md"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{exporting ? "..." : "Export"}</span>
            </Button>
            <div className="text-right text-sm">
              <div className="text-xs text-slate-500">Today</div>
              <div className="font-semibold text-slate-200">{diet?.date || new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </header>

        {!diet || diet.meals.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900/40 to-slate-800/20 p-8 shadow-xl border border-emerald-500/20 text-center backdrop-blur">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-2xl font-bold mb-2 text-slate-100">No Diet Plan Yet</h2>
            <p className="text-slate-400 mb-6">Generate a personalized diet plan to see your meals here and start tracking!</p>
            <Link href="/diet-plan">
              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 shadow-lg">
                Generate Diet Plan
              </Button>
            </Link>
          </div>
        ) : (
          <main className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Left column: Meals by section */}
            <section className="xl:col-span-2 space-y-6">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gradient-to-r from-slate-900/40 to-slate-800/20 p-4 rounded-xl border border-slate-700/50 backdrop-blur">
                <Input 
                  placeholder="Search meals..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-emerald-500 transition-colors"
                />
                <Select onValueChange={(v) => setFilterTime(v)} value={filterTime}>
                  <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All times</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snacks</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm font-semibold text-emerald-400 whitespace-nowrap">
                  {diet.totalCalories} kcal
                </div>
              </div>

              {/* Meal Sections */}
              <div className="space-y-5">
                {Object.entries(mealsBySection).length > 0 ? (
                  Object.entries(mealsBySection).map(([section, meals]) => {
                    const sectionMeals = query || filterTime !== "all" 
                      ? meals.filter((m) => {
                          const matchesQuery = `${m.name} ${m.time}`.toLowerCase().includes(query.toLowerCase());
                          const matchesFilter = filterTime === "all" ? true : (m.time || "").toLowerCase() === filterTime;
                          return matchesQuery && matchesFilter;
                        })
                      : meals;
                    
                    if (sectionMeals.length === 0) return null;

                    const sectionCalories = sectionMeals.reduce((sum, m) => sum + m.calories, 0);
                    const sectionCompleted = sectionMeals.filter((m) => m.completed).length;

                    const sectionColors: Record<string, string> = {
                      Breakfast: "from-orange-500 to-amber-600",
                      Lunch: "from-blue-500 to-cyan-600",
                      Dinner: "from-purple-500 to-pink-600",
                      Snacks: "from-yellow-500 to-orange-600",
                    };

                    return (
                      <div 
                        key={section} 
                        className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 overflow-hidden shadow-lg backdrop-blur hover:shadow-xl transition-all"
                      >
                        <div className={`bg-gradient-to-r ${sectionColors[section] || "from-emerald-500 to-green-600"} px-5 py-3 flex items-center justify-between`}>
                          <h3 className="text-lg font-bold text-white">{section}</h3>
                          <div className="text-sm font-semibold text-white/90">
                            {sectionCompleted}/{sectionMeals.length} • {sectionCalories} kcal
                          </div>
                        </div>
                        <ul className="space-y-2 p-4">
                          {sectionMeals.map((meal) => (
                            <li
                              key={meal.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                meal.completed
                                  ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15"
                                  : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60"
                              }`}
                            >
                              <Checkbox
                                checked={meal.completed}
                                onCheckedChange={() => toggleMealCompletion(meal.id)}
                                className="h-5 w-5"
                                style={{
                                  borderColor: meal.completed ? accent : undefined,
                                  backgroundColor: meal.completed ? accent : undefined,
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${meal.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                                  {meal.name}
                                </div>
                                {meal.quantity && (
                                  <div className="text-xs text-slate-400 truncate">{meal.quantity}</div>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-semibold text-sm text-emerald-400">{meal.calories} kcal</div>
                                <div className="text-xs text-slate-500">{meal.completed ? "✓ Done" : "Pending"}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-slate-400 py-12 rounded-xl bg-slate-900/30 border border-slate-700/30">
                    <p className="text-lg">No meals match your search or filter</p>
                  </div>
                )}
              </div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 p-4 shadow-lg">
                  <div className="text-sm text-slate-400 mb-1">Remaining Calories</div>
                  <div className="text-3xl font-bold text-emerald-400">{remainingCalories}</div>
                  <div className="text-xs text-slate-500 mt-1">of {dailyCalorieGoal} kcal goal</div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 p-4 shadow-lg">
                  <div className="text-sm text-slate-400 mb-1">Meals Completed</div>
                  <div className="text-3xl font-bold text-emerald-400">{completionPercentage}%</div>
                  <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }} 
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 p-4 shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Total Meals</div>
                    <div className="text-3xl font-bold text-emerald-400">{diet.meals.length}</div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete} 
                    className="mt-3 gap-2 w-full bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-400 text-sm"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Diet
                  </Button>
                </div>
              </div>
            </section>

            {/* Right column: Summary & Chart */}
            <aside className="space-y-6">
              {/* Summary Card */}
              <div className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 p-6 shadow-xl backdrop-blur overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
                
                <h3 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Diet Summary
                </h3>

                <div className="space-y-4">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/30 p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Daily Calories</div>
                    <div className="text-3xl font-bold text-emerald-400">{diet.totalCalories}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
                          style={{ width: `${caloriePercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span>{Math.round(caloriePercentage)}%</span>
                        <span>{dailyCalorieGoal} kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Daily Goal</div>
                    <div className="text-2xl font-bold text-slate-200">{dailyCalorieGoal} kcal</div>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-800/30 border border-slate-700/50 p-6 shadow-xl backdrop-blur">
                <h4 className="text-lg font-bold text-slate-100 mb-4">Calorie Breakdown</h4>
                <div className="w-full">
                  {mealTimeSummary.length > 0 ? (
                    <div className="space-y-4">
                      {/* Chart */}
                      <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <RechartTooltip 
                              contentStyle={{
                                backgroundColor: "#5aff76ff",
                                border: "2px solid #10b981",
                                borderRadius: "8px",
                                color: "#e2e8f0",
                                padding: "8px 12px"
                              }}
                              formatter={(value) => `${value} kcal`}
                            />
                            <Pie 
                              data={mealTimeSummary} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={110}
                              paddingAngle={4}
                              label={({ name, percent }) => `${Math.round((percent || 0) * 100)}%`}
                              labelLine={false}
                            >
                              {mealTimeSummary.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColorForName(entry.name, index)} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legend - Improved */}
                      <div className="mt-6 border-t border-slate-700/50 pt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {mealTimeSummary.map((item, index) => (
                            <div key={`legend-${index}`} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getColorForName(item.name, index) }}
                              />
                              <div className="truncate">
                                <span className="text-slate-300 truncate">{item.name}</span>
                                <span className="text-emerald-400 font-semibold ml-1">{item.value} kcal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-12">
                      <p>No breakdown available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/view-diet-plan" className="block">
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                  View Full Diet Plan
                </Button>
              </Link>
            </aside>
          </main>
        )}

        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-slate-900/95 border border-slate-700 backdrop-blur">
            <DialogHeader>
              <DialogTitle className="text-emerald-400">Delete today's diet?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-400">This will remove today's plan from local storage and cannot be undone. You can always regenerate a new plan.</p>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={performDelete} 
                className="gap-2 bg-red-900/60 hover:bg-red-900/80"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}