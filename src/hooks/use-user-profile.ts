
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";

const PROFILE_STORAGE_KEY = "chronoDietAIUserProfile";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
      } else {
        // Keep profile as null if nothing is stored - no default prefilled data
        setProfile(null);
      }
    } catch (error) {
      console.error("Failed to load user profile from local storage", error);
      setProfile(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const saveProfile = useCallback((newProfile: UserProfile) => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error("Failed to save user profile to local storage", error);
    }
  }, []);

  return { profile, saveProfile, loading };
}
