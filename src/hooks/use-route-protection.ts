"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "./use-user-profile";

/**
 * Hook to protect routes that require a complete user profile.
 * If profile is incomplete or missing, redirects to /profile.
 */
export function useRequireCompleteProfile() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;

    // Check if profile exists and is complete
    const isProfileComplete = profile && 
      profile.age > 0 &&
      profile.height > 0 &&
      profile.weight > 0 &&
      profile.region?.trim().length > 0;

    if (!isProfileComplete) {
      router.push("/profile");
    }
  }, [profile, loading, router]);

  return { profile, loading };
}

/**
 * Hook to protect dashboard route.
 * Requires complete profile AND a generated diet plan.
 */
export function useRequireDietPlan() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useRequireCompleteProfile();

  useEffect(() => {
    if (profileLoading) return;

    // Check if diet has been generated
    try {
      const storedDiet = localStorage.getItem("chronoDietAIDailyPlan");
      if (!storedDiet) {
        router.push("/diet-plan");
      }
    } catch (error) {
      console.error("Failed to check diet plan", error);
      router.push("/diet-plan");
    }
  }, [profileLoading, router]);

  return { profile, loading: profileLoading };
}
