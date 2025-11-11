"use client";

import { useRouter } from "next/navigation";
import { useFullDietPlan } from "@/hooks/use-full-diet-plan";
import { useRequireCompleteProfile } from "@/hooks/use-route-protection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Soup, Salad, Fish, Apple, Flame, Droplets, Beef, Wheat, ArrowLeft } from "lucide-react";

const mealIcons = {
  breakfast: <Soup className="h-6 w-6 text-[#309c3e]" />,
  lunch: <Salad className="h-6 w-6 text-[#309c3e]" />,
  dinner: <Fish className="h-6 w-6 text-[#309c3e]" />,
  snacks: <Apple className="h-6 w-6 text-[#309c3e]" />,
};

type MealCategory = keyof typeof mealIcons;

export default function ViewFullDietPlan() {
  const router = useRouter();
  const { plan, loading: planLoading } = useFullDietPlan();
  const { profile, loading: profileLoading } = useRequireCompleteProfile();

  if (profileLoading || planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] flex items-center justify-center">
        <div className="text-white">Loading your diet plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Diet Plan Found</h2>
          <p className="text-gray-400 mb-6">Please generate a diet plan first from the diet plan page.</p>
          <Button 
            onClick={() => router.push("/diet-plan")}
            className="bg-[#309c3e] hover:bg-[#309c3e]/90 text-white"
          >
            Go to Diet Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] py-8 px-4">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Your Complete Diet Plan</h1>
          <div className="w-[100px]" />
        </div>

        {/* Macronutrient Summary */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#072026]/50 border border-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-headline text-white">Total Calories</CardTitle>
              <Flame className="h-4 w-4 text-[#309c3e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plan.calorieBreakdown}</div>
              <p className="text-xs text-gray-400">Estimated daily intake</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#072026]/50 border border-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-headline text-white">Protein</CardTitle>
              <Beef className="h-4 w-4 text-[#309c3e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plan.macronutrientBreakdown.protein}g</div>
              <p className="text-xs text-gray-400">Essential for muscle repair</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#072026]/50 border border-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-headline text-white">Carbohydrates</CardTitle>
              <Wheat className="h-4 w-4 text-[#309c3e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plan.macronutrientBreakdown.carbs}g</div>
              <p className="text-xs text-gray-400">Primary source of energy</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#072026]/50 border border-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-headline text-white">Fat</CardTitle>
              <Droplets className="h-4 w-4 text-[#309c3e]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{plan.macronutrientBreakdown.fat}g</div>
              <p className="text-xs text-gray-400">Important for hormone regulation</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Meal Plan */}
        <Card className="bg-[#072026]/50 border border-transparent">
          <CardHeader>
            <CardTitle className="font-headline text-white text-2xl">Suggested Meal Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["breakfast"]} className="w-full space-y-4">
              {Object.entries(plan.dietPlan).map(([category, meals]) => (
                <AccordionItem value={category} key={category} className="border-b-0">
                  <AccordionTrigger className="capitalize font-headline text-xl bg-[#061419] text-white px-4 py-3 rounded-lg hover:no-underline hover:bg-[#061419]/80">
                    <div className="flex items-center gap-3">
                      {mealIcons[category as MealCategory]}
                      {category}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      {meals.map((meal, index) => (
                        <Card key={index} className="bg-[#061419] border border-transparent">
                          <CardHeader>
                            <CardTitle className="font-headline text-lg text-white">{meal.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-gray-300">{meal.description}</p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <Badge variant="outline" className="border-gray-600 text-gray-300">Calories: {meal.calories}</Badge>
                              {meal.quantity && (
                                <Badge variant="outline" className="border-gray-600 text-gray-300">Qty: {meal.quantity}</Badge>
                              )}
                              <Badge variant="outline" className="border-gray-600 text-gray-300">Protein: {meal.protein}g</Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">Carbs: {meal.carbs}g</Badge>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">Fat: {meal.fat}g</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="bg-[#072026]/50 border border-transparent">
          <CardHeader>
            <CardTitle className="font-headline text-white">Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300">
              {Array.isArray(plan.importantNotes)
                ? plan.importantNotes.slice(0, 6).map((note, idx) => {
                    const mdBoldMatch = note.match(/^\s*\*\*(.+?)\*\*/);
                    let prefix = '';
                    let rest = note;
                    if (mdBoldMatch) {
                      prefix = mdBoldMatch[1];
                      rest = note.replace(mdBoldMatch[0], '').trim();
                    } else {
                      const words = note.split(/\s+/).filter(Boolean);
                      prefix = words.slice(0, 2).join(' ');
                      rest = words.slice(2).join(' ');
                    }
                    return (
                      <li key={idx} className="mb-2 text-gray-300 list-disc ml-5">
                        <span className="font-semibold text-white">{prefix}</span>
                        <span className="ml-1">{rest}</span>
                      </li>
                    );
                  })
                : String(plan.importantNotes)
                    .split(/[\n]+/)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((note, idx) => {
                      const mdBoldMatch = note.match(/^\s*\*\*(.+?)\*\*/);
                      let prefix = '';
                      let rest = note;
                      if (mdBoldMatch) {
                        prefix = mdBoldMatch[1];
                        rest = note.replace(mdBoldMatch[0], '').trim();
                      } else {
                        const words = note.split(/\s+/).filter(Boolean);
                        prefix = words.slice(0, 2).join(' ');
                        rest = words.slice(2).join(' ');
                      }
                      return (
                        <li key={idx} className="mb-2 text-gray-300 list-disc ml-5">
                          <span className="font-semibold text-white">{prefix}</span>
                          <span className="ml-1">{rest}</span>
                        </li>
                      );
                    })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={() => router.push("/diet-dashboard")}
            className="bg-[#309c3e] hover:bg-[#309c3e]/50 text-white"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => router.back()}
            className="bg-[#309c3e] hover:bg-[#309c3e]/50 text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
