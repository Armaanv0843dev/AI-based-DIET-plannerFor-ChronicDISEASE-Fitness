"use client";

import { useState } from "react";
import { generatePersonalizedDietPlan, GeneratePersonalizedDietPlanOutput } from "@/ai/flows/generate-personalized-diet-plan";
import { AIPageLayout } from "@/components/ai-page-layout";
import { Chatbot } from '@/components/chatbot';
import { Button } from "@/components/ui/button";
import { useDailyDiet, Meal } from "@/hooks/use-daily-diet";
import { useFullDietPlan } from "@/hooks/use-full-diet-plan";
import { useRequireCompleteProfile } from "@/hooks/use-route-protection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Soup, Salad, Fish, Apple, Flame, Droplets, Beef, Wheat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

const mealIcons = {
  breakfast: <Soup className="h-6 w-6 text-[#309c3e]" />,
  lunch: <Salad className="h-6 w-6 text-[#309c3e]" />,
  dinner: <Fish className="h-6 w-6 text-[#309c3e]" />,
  snacks: <Apple className="h-6 w-6 text-[#309c3e]" />,
};

type MealCategory = keyof typeof mealIcons;

export default function DietPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratePersonalizedDietPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setTodaysMeals } = useDailyDiet();
  const { saveFullDietPlan } = useFullDietPlan();
  const { profile: guardProfile, loading: guardLoading } = useRequireCompleteProfile();

  const handleGenerate = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log('[handleGenerate] Starting with profile:', profile);
      const response = await generatePersonalizedDietPlan(profile);
      console.log('[handleGenerate] Response received:', response);
      
      setResult(response);
      
      // Save full diet plan for viewing later
      saveFullDietPlan(response);
      
      // Extract all meals from the diet plan and save to localStorage
      const normalizeQuantity = (q?: string) => {
        if (!q) return "";
        const s = q.toString().trim();
        if (!s) return "";
        // If numeric only, assume grams
        const numericOnly = s.match(/^(\d+(?:\.\d+)?)$/);
        if (numericOnly) return `${numericOnly[1]} gm`;
        // If already mentions g, gm, gram(s)
        const gramsMatch = s.match(/^(\d+(?:\.\d+)?)\s*(g|gm|gram|grams)$/i);
        if (gramsMatch) return `${gramsMatch[1]} gm`;
        // If kg provided, convert to grams
        const kgMatch = s.match(/^(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms)$/i);
        if (kgMatch) return `${parseFloat(kgMatch[1]) * 1000} gm`;
        // Otherwise return original string (e.g., '1 cup', '1 medium')
        return s;
      };

      const allMeals: Meal[] = [];
      Object.entries(response.dietPlan).forEach(([category, meals]) => {
        meals.forEach((meal, index) => {
          const rawQty = (meal as any).quantity || "";
          allMeals.push({
            id: `${category}-${index}`,
            name: meal.name,
            calories: meal.calories,
            time: `${category} - ${meal.name}`,
            quantity: normalizeQuantity(rawQty),
            completed: false,
          });
        });
      });
      
      // Save meals to daily diet storage
      setTodaysMeals(allMeals);
      
      // notify chatbot to open with profile context
      try { window.dispatchEvent(new CustomEvent('dietPlan:generated', { detail: { profile } })); } catch (e) { /* noop on server */ }
    } catch (e) {
      console.error('[handleGenerate] Exception caught:', e);
      setError("Failed to generate diet plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking profile
  if (guardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <AIPageLayout>
      {(profile) => (
        <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] py-8 px-4">
          <div className="container mx-auto max-w-4xl space-y-6">
            <Chatbot profile={profile} />
            <Card className="bg-[#072026]/60 border border-transparent">
            <CardHeader>
              <CardTitle className="font-headline text-3xl text-white">Personalized Diet Plan</CardTitle>
              <CardDescription className="text-gray-400">
                Based on your profile, our AI will create a personalized diet recommendation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleGenerate(profile)} 
                disabled={loading}
                className="bg-[#309c3e] hover:bg-[#309c3e]/90 text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Diet Plan"}
              </Button>
            </CardContent>
          </Card>
          
          <Alert className="bg-red-900/100 border border-red-700">
            <TriangleAlert className="h-7 w-6 text-white" />
            <AlertTitle className="font-headline text-white text-lg">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-white/90">
              <p>
                ChronoDietAI provides AI-generated dietary suggestions and is not a
                substitute for professional medical advice. Always consult with a
                healthcare provider before making any changes to your diet. Your data
                is stored locally on your device for privacy.
              </p>
            </AlertDescription>
          </Alert>
          
          {error && <p className="text-red-400">{error}</p>}
          
          {loading && <ResultSkeleton />}
          
          {result && (
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <Card className="bg-[#072026]/50 border border-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium font-headline text-white">Total Calories</CardTitle>
                            <Flame className="h-4 w-4 text-[#309c3e]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{result.calorieBreakdown}</div>
                            <p className="text-xs text-gray-400">Estimated daily intake</p>
                        </CardContent>
                    </Card>
                  <Card className="bg-[#072026]/50 border border-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium font-headline text-white">Protein</CardTitle>
                           <Beef className="h-4 w-4 text-[#309c3e]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{result.macronutrientBreakdown.protein}g</div>
                            <p className="text-xs text-gray-400">Essential for muscle repair</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-[#072026]/50 border border-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium font-headline text-white">Carbohydrates</CardTitle>
                           <Wheat className="h-4 w-4 text-[#309c3e]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{result.macronutrientBreakdown.carbs}g</div>
                             <p className="text-xs text-gray-400">Primary source of energy</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-[#072026]/50 border border-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <CardTitle className="text-sm font-medium font-headline text-white">Fat</CardTitle>
                           <Droplets className="h-4 w-4 text-[#309c3e]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{result.macronutrientBreakdown.fat}g</div>
                             <p className="text-xs text-gray-400">Important for hormone regulation</p>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-[#072026]/50 border border-transparent">
                    <CardHeader><CardTitle className="font-headline text-white">Suggested Meal Plan</CardTitle></CardHeader>
                    <CardContent>
                       <Accordion type="multiple" defaultValue={["breakfast"]} className="w-full space-y-4">
                        {Object.entries(result.dietPlan).map(([category, meals]) => (
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
        <Card className="bg-[#072026]/50 border border-transparent">
          <CardHeader>
            <CardTitle className="font-headline text-white">Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300">{renderImportantNotes(result.importantNotes)}</div>
          </CardContent>
        </Card>
                <div className="flex justify-end items-center gap-3">
                  <button
                    className="inline-flex items-center px-4 py-2 rounded bg-[#0f1724] border border-gray-700 text-white"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/diet-pdf', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ ...result, profile }),
                        });
                        if (!res.ok) throw new Error('PDF generation failed');
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'diet-plan.pdf';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (e) {
                        console.error(e);
                        alert('Failed to download PDF');
                      }
                    }}
                  >
                    Download PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/diet-dashboard')}
                    className="inline-flex items-center px-4 py-2 rounded bg-[#309c3e] hover:bg-[#2b8233] text-white"
                  >
                    View Dashboard
                  </button>
                </div>
            </div>
          )}
          </div>
        </div>
      )}
    </AIPageLayout>
  );
}


function ResultSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="bg-[#072026]/50 border border-transparent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-2/3 bg-[#061419]" />
                            <Skeleton className="h-4 w-4 bg-[#061419]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/3 bg-[#061419]" />
                            <Skeleton className="h-3 w-1/2 mt-1 bg-[#061419]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="bg-[#072026]/50 border border-transparent">
                <CardHeader><Skeleton className="h-7 w-1/3 bg-[#061419]" /></CardHeader>
                <CardContent className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg bg-[#061419]" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function renderImportantNotes(notes: string | string[]) {
  const items = Array.isArray(notes)
    ? notes.slice(0, 6)
    : String(notes).split(/[\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 6);

  const renderItem = (text: string, idx: number) => {
    // If starts with markdown bold (**...**), extract that as keyword
    const mdBoldMatch = text.match(/^\s*\*\*(.+?)\*\*/);
    let prefix = '';
    let rest = text;
    if (mdBoldMatch) {
      prefix = mdBoldMatch[1];
      rest = text.replace(mdBoldMatch[0], '').trim();
    } else {
      // fallback: first 1-2 words
      const words = text.split(/\s+/).filter(Boolean);
      prefix = words.slice(0, 2).join(' ');
      rest = words.slice(2).join(' ');
    }

    return (
      <li key={idx} className="mb-2 text-gray-300">
        <span className="font-semibold text-white">{prefix}</span>
        <span className="ml-1">{rest}</span>
      </li>
    );
  };

  return (
    <ul className="list-disc pl-5">
      {items.map(renderItem)}
    </ul>
  );
}
