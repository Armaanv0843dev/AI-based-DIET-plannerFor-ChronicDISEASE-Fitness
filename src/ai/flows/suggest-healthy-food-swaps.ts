'use server';
/**
 * @fileOverview Suggests healthy food swaps for less optimal choices.
 *
 * - suggestHealthyFoodSwaps - A function that suggests healthy food swaps.
 * - SuggestHealthyFoodSwapsInput - The input type for the suggestHealthyFoodSwaps function.
 * - SuggestHealthyFoodSwapsOutput - The return type for the suggestHealthyFoodSwaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHealthyFoodSwapsInputSchema = z.object({
  unhealthyFood: z
    .string()
    .describe('The unhealthy food choice the user wants to replace.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('The dietary preferences of the user.'),
});
export type SuggestHealthyFoodSwapsInput = z.infer<
  typeof SuggestHealthyFoodSwapsInputSchema
>;

const SuggestHealthyFoodSwapsOutputSchema = z.object({
  healthyFoodSwaps: z.array(
    z.object({
      swap: z.string().describe('The suggested healthy food swap.'),
      explanation: z.string().describe('Explanation of the swap.'),
    })
  ),
});
export type SuggestHealthyFoodSwapsOutput = z.infer<
  typeof SuggestHealthyFoodSwapsOutputSchema
>;

export async function suggestHealthyFoodSwaps(
  input: SuggestHealthyFoodSwapsInput
): Promise<SuggestHealthyFoodSwapsOutput> {
  return suggestHealthyFoodSwapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHealthyFoodSwapsPrompt',
  input: {schema: SuggestHealthyFoodSwapsInputSchema},
  output: {schema: SuggestHealthyFoodSwapsOutputSchema},
  prompt: `Suggest healthy food swaps for the following unhealthy food choice:

Unhealthy Food: {{{unhealthyFood}}}

Dietary Preferences: {{{dietaryPreferences}}}

Provide brief explanations for each recommendation.

Format the output as a JSON array of objects, each containing a "swap" and an "explanation" field.
`,
});

const suggestHealthyFoodSwapsFlow = ai.defineFlow(
  {
    name: 'suggestHealthyFoodSwapsFlow',
    inputSchema: SuggestHealthyFoodSwapsInputSchema,
    outputSchema: SuggestHealthyFoodSwapsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
