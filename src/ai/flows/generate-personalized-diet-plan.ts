'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized diet plans based on user health profiles and dietary preferences.
 *
 * - generatePersonalizedDietPlan - A function that takes user health profile and dietary preferences as input and returns a personalized diet plan.
 * - GeneratePersonalizedDietPlanInput - The input type for the generatePersonalizedDietPlan function.
 * - GeneratePersonalizedDietPlanOutput - The return type for the generatePersonalizedDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedDietPlanInputSchema = z.object({
  age: z.number().describe('Age of the user.'),
  gender: z.string().describe('Gender of the user.'),
  height: z.number().describe('Height of the user in cm.'),
  weight: z.number().describe('Weight of the user in kg.'),
  dietaryPreference: z.string().describe("The user's dietary preference (e.g., Non-Vegetarian, Vegetarian)."),
  chronicDisease: z.string().describe("The user's primary chronic disease, if any."),
  fitnessGoal: z.string().describe("The user's primary fitness goal."),
  region: z.string().describe("The user's region or country to suggest local foods."),
  otherConditions: z.string().optional().describe("Any other conditions or details."),
});
export type GeneratePersonalizedDietPlanInput = z.infer<
  typeof GeneratePersonalizedDietPlanInputSchema
>;

const MealSchema = z.object({
  name: z.string().describe("Name of the meal (e.g., 'Scrambled Eggs with Spinach')"),
  description: z.string().describe("A short description of the meal and why it's recommended."),
  calories: z.number().describe("Estimated calories for the meal."),
  protein: z.number().describe("Grams of protein."),
  carbs: z.number().describe("Grams of carbohydrates."),
  fat: z.number().describe("Grams of fat."),
  quantity: z.string().describe("Quantity/portion information for the main ingredient or serving (e.g., '100g paneer', '1 cup cooked rice')."),
});

const GeneratePersonalizedDietPlanOutputSchema = z.object({
  dietPlan: z.object({
    breakfast: z.array(MealSchema).describe("Up to 5 breakfast meal suggestions."),
    lunch: z.array(MealSchema).describe("Up to 5 lunch meal suggestions."),
    dinner: z.array(MealSchema).describe("Up to 5 dinner meal suggestions."),
    snacks: z.array(MealSchema).describe("Up to 5 snack suggestions for throughout the day."),
  }).describe("A structured personalized diet plan for the user, broken down by meals."),
  calorieBreakdown: z
    .number()
    .describe('The total estimated daily calorie intake for the diet plan.'),
  macronutrientBreakdown: z
    .object({
        protein: z.number().describe("Total grams of protein for the day."),
        carbs: z.number().describe("Total grams of carbohydrates for the day."),
        fat: z.number().describe("Total grams of fat for the day."),
    })
    .describe('The macronutrient breakdown of the diet plan in grams.'),
  importantNotes: z
    .array(z.string())
    .describe(
      'Important notes and concise actionable tips (array of 5-6 short strings).' 
    ),
});

export type GeneratePersonalizedDietPlanOutput = z.infer<
  typeof GeneratePersonalizedDietPlanOutputSchema
>;

export async function generatePersonalizedDietPlan(
  input: GeneratePersonalizedDietPlanInput
): Promise<GeneratePersonalizedDietPlanOutput> {
  return generatePersonalizedDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedDietPlanPrompt',
  input: {schema: GeneratePersonalizedDietPlanInputSchema},
  output: {schema: GeneratePersonalizedDietPlanOutputSchema},
  prompt: `You are a registered dietician and nutritionist specializing in Indian cuisine.

Based on the user's detailed profile, create a personalized Indian diet plan.

User Profile:
- Age: {{{age}}}
- Gender: {{{gender}}}
- Height: {{{height}}} cm
- Weight: {{{weight}}} kg
- Dietary Preference: {{{dietaryPreference}}}
- Primary Chronic Disease: {{{chronicDisease}}}
- Fitness Goal: {{{fitnessGoal}}}
- Region / Country: {{{region}}}
- Other Conditions or Details: {{{otherConditions}}}

Provide a detailed diet plan with up to 5 alternative options for breakfast, lunch, dinner, and snacks. The meals should be based on Indian cuisine from the specified region. For each meal, provide a name, description, and estimated macronutrients (calories, protein, carbs, fat). Also include a concise "quantity" string giving the main ingredient portion or serving size (e.g., '100 gm paneer', '1 cup cooked rice', '1 medium apple'). When possible, prefer returning quantities in grams using the unit 'gm' (for example: '100 gm paneer' or '150 gm cooked rice'). If grams are not applicable (e.g., liquids or whole fruits), provide the best textual representation such as '1 cup' or '1 medium'. Also provide overall calorie and macronutrient breakdowns for the day.

Important Notes instructions:
  - Return exactly 5 to 6 concise, plan-specific tips relevant to the meal plan and user's profile.
  - Each tip must be one short sentence (8-12 words) and actionable.
  - Bold or emphasize the most important 1-2 words at the start of each tip (use **markdown** for bold).
  - Return importantNotes as a JSON array of strings in the output payload (not a single concatenated string).
  - Keep the tone friendly and practical. Example array (for guidance only):
    [
      "**Hydrate** regularly with water between meals to control appetite.",
      "**Prefer** whole grains over refined carbs for steady energy."
    ]

Provide the importantNotes field as an array in the flow output following these rules.
`,
});

const generatePersonalizedDietPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedDietPlanFlow',
    inputSchema: GeneratePersonalizedDietPlanInputSchema,
    outputSchema: GeneratePersonalizedDietPlanOutputSchema,
  },
  async input => {
    console.log('[generatePersonalizedDietPlanFlow] Starting with input:', JSON.stringify(input).substring(0, 200));
    
    // Retry helper for transient errors (503, rate limits, network blips)
    async function retryAsync<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 1200): Promise<T> {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        try {
          console.log(`[retryAsync] Attempt ${i + 1}/${attempts}`);
          return await fn();
        } catch (err: any) {
          lastErr = err;
          // If it's the last attempt, break and rethrow later
          if (i === attempts - 1) break;
          // simple exponential backoff with jitter
          const backoff = baseDelayMs * Math.pow(2, i);
          const jitter = Math.floor(Math.random() * 300);
          const delay = backoff + jitter;
          // Log the transient error and retry
          console.warn(`[retryAsync] Attempt ${i + 1} failed (${err?.message || err}), retrying in ${delay}ms`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
      // After retries exhausted, throw last error
      console.error('[retryAsync] All retry attempts failed:', lastErr?.message || lastErr);
      throw lastErr;
    }

    try {
      // wrap prompt call with retries to handle model overloads (503)
      const resp = await retryAsync(() => prompt(input), 3, 1200);
      const {output} = resp;
      if (output) {
        const totalMeals = Object.values(output.dietPlan).reduce((sum, meals) => sum + meals.length, 0);
        console.log('[generatePersonalizedDietPlanFlow] Successfully generated plan with', totalMeals, 'meals');
      }
      return output!;
    } catch (err: any) {
      // Log the error - no fallback, let the error bubble up
      const errMsg = err?.message || JSON.stringify(err);
      console.error('[generatePersonalizedDietPlanFlow] AI request failed:', errMsg);
      throw new Error('Failed to generate personalized diet plan. Please try again.');
    }
  }
);
