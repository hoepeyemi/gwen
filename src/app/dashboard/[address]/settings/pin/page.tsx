"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Key, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import PinEntry from "~/app/wallet/_components/pin";

export default function PinSetupPage() {
  const { address } = useParams();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const { user } = useAuth();
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [pinMode, setPinMode] = useState<'create' | 'verify'>('create');
  
  // Check if user has a PIN set
  const { data: pinStatus, isLoading: checkingPin } = api.users.hasPinSet.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const handleBack = () => {
    clickFeedback();
    router.push(`/dashboard/${address}`);
  };

  const handleSetupPin = () => {
    clickFeedback();
    setIsSettingPin(true);
  };

  const handlePinSuccess = () => {
    clickFeedback("success");
    setIsSettingPin(false);
    toast.success(pinStatus?.hasPinSet ? "PIN updated successfully" : "PIN created successfully");
    
    // Redirect back to dashboard after a short delay
    setTimeout(() => {
      router.push(`/dashboard/${address}`);
    }, 2000);
  };

  const handleCancel = () => {
    clickFeedback();
    setIsSettingPin(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <p className="text-center text-gray-500">
            Please sign in to access this page.
          </p>
          <Button 
            onClick={() => router.push("/auth/signin")}
            className="mt-4"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (checkingPin) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-center text-gray-500">
            Checking your PIN status...
          </p>
        </div>
      </div>
    );
  }

  if (isSettingPin) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-center">
                  {pinStatus?.hasPinSet ? "Change PIN" : "Create PIN"}
                </CardTitle>
                <div className="w-10"></div> {/* Spacer for centering */}
              </div>
            </CardHeader>
            <CardContent>
              <PinEntry 
                onSuccess={handlePinSuccess} 
                onCancel={handleCancel}
                mode="create"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="mb-8 self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="mb-8 text-2xl font-bold">Security PIN</h1>

        <Card className="mb-8 w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              {pinStatus?.hasPinSet ? (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <ShieldCheck className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">PIN Already Set</h3>
                    <p className="mt-1 text-gray-500">
                      You already have a security PIN set for your account.
                      You can choose to update it if needed.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSetupPin}
                    className="mt-4"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Change PIN
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <ShieldAlert className="h-8 w-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No PIN Set</h3>
                    <p className="mt-1 text-gray-500">
                      You haven't set up a security PIN yet. 
                      A PIN is required for making payments and other sensitive operations.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSetupPin}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Set Up PIN
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 