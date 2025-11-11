'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { UserProfile } from '@/lib/types';

const ChatInputSchema = z.object({
  message: z.string().min(1).describe('User message to the dietitian AI'),
  profile: z
    .object({
      age: z.number(),
      gender: z.string(),
      height: z.number(),
      weight: z.number(),
      dietaryPreference: z.string(),
      chronicDisease: z.string(),
      fitnessGoal: z.string(),
      region: z.string(),
      otherConditions: z.string().optional(),
    })
    .optional(),
});

const ChatOutputSchema = z.object({
  reply: z.string().describe('AI reply to the user'),
  suggestions: z.array(z.string()).optional().describe('Short quick-reply suggestion phrases the UI can show as buttons'),
  actions: z
    .array(
      z.object({
        type: z.string().describe('action type, e.g., "open_url", "generate_pdf", "ask_followup"'),
        label: z.string().describe('button label to show'),
        payload: z.any().optional().describe('arbitrary payload for the action'),
      })
    )
    .optional(),
  metadata: z.object({ topic: z.string().optional() }).optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema> & { profile?: UserProfile };
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const prompt = ai.definePrompt({
  name: 'dietitianChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful diet assistant bot.
- Your tone is helpful and friendly, but slightly formal, like a bot.
- Detect the user's language (English, Hindi, or Hinglish) and respond only in that language.
- Structure your 'reply' for readability. Use **bold text** for keywords and use \\n for line breaks.
- If asked for medical advice, state: "I am an AI assistant and cannot provide medical advice. Please consult a healthcare professional."

User Profile:
- Age: {{{profile.age}}}, Gender: {{{profile.gender}}}, Height: {{{profile.height}}} cm, Weight: {{{profile.weight}}} kg
- Preference: {{{profile.dietaryPreference}}}, Goal: {{{profile.fitnessGoal}}}
- Conditions: {{{profile.chronicDisease}}}, {{{profile.otherConditions}}}
- Region: {{{profile.region}}}

User question: {{{message}}}

Your entire output must be a single, valid JSON object matching the schema.
The 'reply' and 'suggestions' must be in the user's language.
Provide 3-4 short, relevant 'suggestions'.
Do not add any text or formatting outside of the JSON object.
`,
});

export async function chatWithDietitian(input: ChatInput): Promise<ChatOutput> {
  const {output} = await prompt(input as any);
  return output!;
}
