"use client";

import Link from "next/link";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Loader2 } from "lucide-react";
import type { UserProfile } from "@/lib/types";

export function AIPageLayout({
  children,
}: {
  children: (profile: UserProfile) => React.ReactNode;
}) {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !profile.age) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <User />
            Profile Incomplete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Please complete your profile to get personalized AI recommendations.
          </p>
          <Button asChild>
            <Link href="/">Go to Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return children(profile);
}
