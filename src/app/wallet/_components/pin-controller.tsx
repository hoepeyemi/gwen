"use client";

import { useState, useEffect } from "react";
import { useAuth } from "~/providers/auth-provider";
import PinEntry from "./pin";
import { api } from "~/trpc/react";
import { Card } from "~/components/ui/card";
import { Loader2 } from "lucide-react";

interface PinControllerProps {
  onSuccess: () => void;
  onCancel?: () => void;
  forceCreate?: boolean;
}

export default function PinController({ 
  onSuccess,
  onCancel,
  forceCreate = false
}: PinControllerProps) {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasPinSet, setHasPinSet] = useState(false);

  // Get the user to check if they have a PIN set
  const checkPinStatus = api.users.checkPin.useQuery(
    { userId: user?.id || 0 },
    {
      enabled: !!user?.id,
    }
  );

  // Handle the query result
  useEffect(() => {
    if (checkPinStatus.isSuccess) {
      setHasPinSet(checkPinStatus.data.hasPinSet);
      setLoading(false);
    } else if (checkPinStatus.isError) {
      console.error("Error checking PIN status:", checkPinStatus.error);
      setHasPinSet(false);
      setLoading(false);
    }
  }, [
    checkPinStatus.isSuccess, 
    checkPinStatus.isError, 
    checkPinStatus.data, 
    setHasPinSet, 
    setLoading
  ]);

  // Refresh user data when the component mounts
  useEffect(() => {
    const checkUserPin = async () => {
      if (user?.id) {
        try {
          await refreshUserData(user.id);
          setHasPinSet(!!user.hashedPin);
        } catch (error) {
          console.error("Error refreshing user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkUserPin();
  }, [user, refreshUserData]);

  if (loading) {
    return (
      <Card className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading your PIN settings...</p>
        </div>
      </Card>
    );
  }

  // Determine if we should show PIN creation or verification
  const showPinCreation = forceCreate || !hasPinSet;

  return (
    <PinEntry 
      onSuccess={onSuccess}
      onCancel={onCancel}
      isCreating={showPinCreation}
    />
  );
} 