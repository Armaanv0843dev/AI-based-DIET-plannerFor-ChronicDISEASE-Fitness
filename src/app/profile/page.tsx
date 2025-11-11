"use client";

import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

const profileSchema = z.object({
  age: z.coerce.number().min(1, "Age is required."),
  gender: z.enum(['Male', 'Female']),
  height: z.coerce.number().min(1, "Height is required."),
  weight: z.coerce.number().min(1, "Weight is required."),
  dietaryPreference: z.enum(['Non-Vegetarian', 'Vegetarian', 'Vegan', 'Eggetarian']),
  chronicDisease: z.enum([
    'None',
    'Diabetes',
    'Hypertension',
    'High Blood Pressure',
    'High Cholesterol',
    'Coronary Artery Disease',
    'Heart Disease',
    'Asthma',
    'Thyroid Disorders',
    'Chronic Kidney Disease',
    'Chronic Liver Disease',
    'Osteoarthritis',
    'Chronic Obstructive Pulmonary Disease',
    'PCOS',
  ]),
  fitnessGoal: z.enum(['Weight Loss', 'Weight Gain', 'Maintain Weight', 'Muscle Gain']),
  region: z.string().min(1, "Region is required."),
  otherConditions: z.string().optional(),
});

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] py-8 px-4">
      <div className="container mx-auto max-w-3xl">
  <Card className="bg-[#072026]/50 border border-transparent">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { profile, saveProfile, loading } = useUserProfile();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: "",
      gender: 'Male',
      height: "",
      weight: "",
      dietaryPreference: 'Non-Vegetarian',
      chronicDisease: 'None',
      fitnessGoal: 'Weight Loss',
      region: '',
      otherConditions: '',
    },
  });

  // Note: Intentionally NOT populating form with existing profile
  // Users must fill the form from scratch every time
  useEffect(() => {
    // Do nothing - keep form empty
  }, []);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    saveProfile(data);
    toast({
      title: "Profile Saved",
      description: "Your profile has been successfully updated.",
    });
    // Navigate to the diet plan page immediately after saving the profile
    // so the user sees the generated diet plan / diet-plan tab.
    router.push("/diet-plan");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] py-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        <Alert className="bg-red-900/90 border border-red-700">
          <TriangleAlert className="h-7 w-6 text-white" />
          <AlertTitle className="font-headline text-white text-lg">Important Disclaimer</AlertTitle>
          <AlertDescription className="text-white/90">
            ChronoDietAI provides AI-generated dietary suggestions and is not a substitute for professional medical advice. Always consult with a healthcare provider before making any changes to your diet. Your data is stored locally on your device for privacy.
          </AlertDescription>
        </Alert>

        <Card className="bg-[#072026]/50 border border-transparent">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
            <CardDescription className="text-gray-400">
              Complete your profile to get personalized diet recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your age"
                            className="bg-[#061419] border border-transparent text-white placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Male" className="border-[#309c3e]" />
                              </FormControl>
                              <FormLabel className="text-white">Male</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <RadioGroupItem value="Female" className="border-[#309c3e]" />
                              </FormControl>
                              <FormLabel className="text-white">Female</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your height"
                            className="bg-[#061419] border border-transparent text-white placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your weight"
                            className="bg-[#061419] border border-transparent text-white placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dietaryPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Dietary Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#061419] border border-transparent text-white">
                              <SelectValue placeholder="Select dietary preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061419] border border-transparent">
                            <SelectItem value="Non-Vegetarian" className="text-white">Non-Vegetarian</SelectItem>
                            <SelectItem value="Vegetarian" className="text-white">Vegetarian</SelectItem>
                            <SelectItem value="Vegan" className="text-white">Vegan</SelectItem>
                            <SelectItem value="Eggetarian" className="text-white">Eggetarian</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chronicDisease"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Chronic Disease</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#061419] border border-transparent text-white">
                              <SelectValue placeholder="Select chronic disease" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061419] border border-transparent">
                            <SelectItem value="None" className="text-white">None</SelectItem>
                            <SelectItem value="Diabetes" className="text-white">Diabetes</SelectItem>
                            <SelectItem value="Hypertension" className="text-white">Hypertension</SelectItem>
                            <SelectItem value="High Blood Pressure" className="text-white">High Blood Pressure</SelectItem>
                            <SelectItem value="High Cholesterol" className="text-white">High Cholesterol</SelectItem>
                            <SelectItem value="Coronary Artery Disease" className="text-white">Coronary Artery Disease(Heart Disease)</SelectItem>
                            <SelectItem value="Asthma" className="text-white">Asthma</SelectItem>
                            <SelectItem value="Thyroid Disorders" className="text-white">Thyroid Disorders</SelectItem>
                            <SelectItem value="Chronic Kidney Disease" className="text-white">Chronic Kidney Disease</SelectItem>
                            <SelectItem value="Chronic Liver Disease" className="text-white">Chronic Liver Disease/Fatty Liver</SelectItem>
                            <SelectItem value="Osteoarthritisc" className="text-white">Osteoarthritis(Joint Pain)</SelectItem>
                            <SelectItem value="Chronic Obstructive Pulmonary Disease" className="text-white">Chronic Obstructive Pulmonary Disease(Lung Disease)</SelectItem>
                            <SelectItem value="PCOS" className="text-white">PCOS(Polycystic Ovary Syndrome)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fitnessGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Fitness Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#061419] border border-transparent text-white">
                              <SelectValue placeholder="Select fitness goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061419] border border-transparent">
                            <SelectItem value="Weight Loss" className="text-white">Weight Loss</SelectItem>
                            <SelectItem value="Weight Gain" className="text-white">Weight Gain</SelectItem>
                            <SelectItem value="Maintain Weight" className="text-white">Maintain Weight</SelectItem>
                            <SelectItem value="Muscle Gain" className="text-white">Muscle Gain</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Region</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your region"
                            className="bg-[#061419] border border-transparent text-white placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="otherConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Other Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any other health conditions or notes"
                          className="bg-[#061419] border border-transparent text-white placeholder:text-gray-500 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        Optional: Add any other health conditions or important notes
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#309c3e] hover:bg-[#309c3e]/90 text-white px-8"
                  >
                    Save Profile
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}