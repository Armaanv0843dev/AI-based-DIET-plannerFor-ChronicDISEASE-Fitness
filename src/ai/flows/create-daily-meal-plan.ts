'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating daily meal plans based on a user's dietary profile.
 *
 * - createDailyMealPlan - A function that generates a daily meal plan.
 * - DailyMealPlanInput - The input type for the createDailyMealPlan function.
 * - DailyMealPlanOutput - The return type for the createDailyMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyMealPlanInputSchema = z.object({
  dietaryProfile: z
    .string()
    .describe(
      'A detailed dietary profile including health conditions, dietary preferences, and personal goals.'
    ),
});
export type DailyMealPlanInput = z.infer<typeof DailyMealPlanInputSchema>;

const DailyMealPlanOutputSchema = z.object({
  mealPlan: z
    .string()
    .describe(
      'A structured daily meal plan including breakfast, lunch, dinner, and snack ideas with portion sizes.'
    ),
});
export type DailyMealPlanOutput = z.infer<typeof DailyMealPlanOutputSchema>;

export async function createDailyMealPlan(input: DailyMealPlanInput): Promise<DailyMealPlanOutput> {
  return createDailyMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createDailyMealPlanPrompt',
  input: {schema: DailyMealPlanInputSchema},
  output: {schema: DailyMealPlanOutputSchema},
  prompt: `You are a nutrition expert. Create a daily meal plan based on the following dietary profile. Be specific with the meal plan, and provide detailed information, including portion sizes.

Dietary Profile: {{{dietaryProfile}}}`,
});

const createDailyMealPlanFlow = ai.defineFlow(
  {
    name: 'createDailyMealPlanFlow',
    inputSchema: DailyMealPlanInputSchema,
    outputSchema: DailyMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
