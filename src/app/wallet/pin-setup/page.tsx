"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import PinEntry from "~/app/wallet/_components/pin";
import LoadingScreen from "~/app/wallet/_components/loading-screen";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

export default function PinSetupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  // Query to check if user already has a PIN
  const userDetailsQuery = api.users.getUserDetails.useQuery(
    { userId: user?.id || 0 },
    {
      enabled: !!user?.id, // Only run the query if user is logged in
      retry: 1,
      retryDelay: 1000,
    }
  );
  
  // Handle query results with useEffect
  useEffect(() => {
    if (userDetailsQuery.isSuccess && userDetailsQuery.data) {
      if (userDetailsQuery.data.hasPinSetup) {
        // User already has a PIN, redirect to dashboard
        toast("PIN already set up", {
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
          },
        });
        router.push("/dashboard");
      } else {
        // User needs to set up their PIN
        setShowPinSetup(true);
        setIsLoading(false);
      }
    } else if (userDetailsQuery.isError) {
      // On error, show PIN setup anyway
      setShowPinSetup(true);
      setIsLoading(false);
    }
  }, [userDetailsQuery.isSuccess, userDetailsQuery.isError, userDetailsQuery.data, router]);
  
  // Check authentication status on mount
  useEffect(() => {
    if (!user) {
      // If not authenticated, redirect to sign in
      router.push("/auth/signin");
    } else if (userDetailsQuery.isLoading) {
      // If checking PIN status, show loading
      setIsLoading(true);
    }
  }, [user, router, userDetailsQuery.isLoading]);
  
  // Handler for PIN setup success
  const handlePinSuccess = () => {
    toast("PIN set up successfully", {
      icon: '✅',
      style: {
        borderRadius: '10px',
        background: '#10b981',
        color: '#fff',
      },
    });
    // Redirect to dashboard after PIN setup
    router.push("/dashboard");
  };
  
  // Handler for PIN setup cancellation
  const handleCancel = () => {
    // If user cancels PIN setup, redirect them back to sign in
    router.push("/auth/signin");
  };
  
  if (isLoading || !user) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Set Up PIN
          </CardTitle>
          <p className="text-center text-gray-600">
            Create a 6-digit PIN to secure your transactions
          </p>
        </CardHeader>
        <CardContent>
          {showPinSetup && (
            <PinEntry onSuccess={handlePinSuccess} onCancel={handleCancel} />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 