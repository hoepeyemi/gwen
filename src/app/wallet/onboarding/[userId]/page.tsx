"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { InfoIcon, ShieldIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function PinSetupPage() {
  const router = useRouter();
  const { userId } = useParams();
  const { user, refreshUserData } = useAuth();
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [step, setStep] = useState<number>(1); // 1: enter PIN, 2: confirm PIN
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);
  const { clickFeedback } = useHapticFeedback();

  // tRPC procedure for setting PIN
  const updatePin = api.users.updatePin.useMutation({
    onSuccess: () => {
      toast.success("PIN set successfully!");
      // Redirect to dashboard after PIN is set
      storeLocalPin(pin);
      router.push("/dashboard");
    },
    onError: (error) => {
      setError(error.message || "Failed to set PIN");
      setShake(true);
      setLoading(false);
    }
  });

  // Store the PIN locally for validation before server-side validation
  const storeLocalPin = (pinValue: string) => {
    try {
      // Store in dedicated pin storage
      localStorage.setItem("user_pin", JSON.stringify({ 
        pin: pinValue, 
        created: new Date().toISOString() 
      }));
      
      // Also store in auth_user
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        user.pin = pinValue;
        user.hashedPin = "PIN_SET"; // Indicate PIN is set without revealing the hash
        localStorage.setItem("auth_user", JSON.stringify(user));
      }
      
      console.log("PIN stored locally");
    } catch (err) {
      console.error("Failed to store PIN locally:", err);
    }
  };

  // Reset shake animation
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  // Auto-proceed to next step when 6 digits entered for first PIN
  useEffect(() => {
    if (step === 1 && pin.length === 6 && !loading) {
      setTimeout(() => {
        setStep(2);
        clickFeedback("medium");
      }, 300);
    }
  }, [pin, loading, step, clickFeedback]);

  // Auto-validate when 6 digits entered for confirmation PIN
  useEffect(() => {
    if (step === 2 && confirmPin.length === 6 && !loading) {
      validateAndSetPin();
    }
  }, [confirmPin, loading, step]);

  const handleNumberClick = (number: number) => {
    if (step === 1 && pin.length < 6) {
      clickFeedback("medium");
      setPin((prev) => prev + number);
    } else if (step === 2 && confirmPin.length < 6) {
      clickFeedback("medium");
      setConfirmPin((prev) => prev + number);
    } else {
      setShake(true);
      clickFeedback("medium");
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      if (pin.length === 0) {
        clickFeedback("medium");
        return;
      }
      clickFeedback("medium");
      setPin((prev) => prev.slice(0, -1));
    } else if (step === 2) {
      if (confirmPin.length === 0) {
        clickFeedback("medium");
        // Allow going back to the first step if no digits entered in confirmation
        setStep(1);
        return;
      }
      clickFeedback("medium");
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const validateAndSetPin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    if (pin !== confirmPin) {
      setError("PINs don't match. Please try again.");
      setShake(true);
      setConfirmPin("");
      setLoading(false);
      return;
    }
    
    try {
      // Call API to set PIN
      updatePin.mutate({
        userId: userId as string,
        pin: pin
      });
    } catch (err: unknown) {
      console.error("Error setting PIN:", err);
      setError("Failed to set PIN. Please try again.");
      setShake(true);
      setLoading(false);
    }
  };

  const renderPinDots = (value: string) => {
    return (
      <div className="mt-6 flex justify-center gap-3">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div
            key={index}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${
              shake ? "animate-shake" : ""
            } ${
              value.length > index
                ? "border-blue-500 bg-blue-500"
                : "border-blue-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderPinKeypad = () => {
    return (
      <div className="mt-8 grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            type="button"
            variant="outline"
            className="aspect-square h-14 text-lg font-medium"
            onClick={() => handleNumberClick(num)}
            disabled={loading}
          >
            {num}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="col-start-2 aspect-square h-14 text-lg font-medium"
          onClick={() => handleNumberClick(0)}
          disabled={loading}
        >
          0
        </Button>
        <Button
          type="button"
          variant="outline"
          className="col-start-3 aspect-square h-14"
          onClick={handleDelete}
          disabled={loading}
        >
          ←
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              <div className="flex items-center justify-center space-x-2">
                <ShieldIcon className="h-6 w-6 text-blue-500" />
                <span>Setup PIN</span>
              </div>
            </CardTitle>
            <p className="text-center text-gray-600">
              {step === 1 
                ? "Create a 6-digit PIN to secure your account" 
                : "Confirm your PIN"
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            
            {step === 1 ? renderPinDots(pin) : renderPinDots(confirmPin)}
            
            {renderPinKeypad()}
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <InfoIcon className="h-4 w-4" />
              <p>Your PIN will be used to authorize transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 