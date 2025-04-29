"use client";

import { type FC, useEffect, useState } from "react";
import { Fingerprint, ScanFaceIcon, Delete, Shield, Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

interface PinEntryProps {
  onSuccess: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'verify'; // Added mode prop to support both creating and verifying PINs
}

const PinEntry: FC<PinEntryProps> = ({ onSuccess, onCancel, mode = 'verify' }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'create' ? 'enter' : 'enter');
  const { clickFeedback } = useHapticFeedback();
  const { user, refreshUserData } = useAuth();
  const [biometricSupported] = useState<boolean>(
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  );
  
  // tRPC mutations for PIN operations
  const setPinMutation = api.users.setPin.useMutation({
    onSuccess: () => {
      toast.success("PIN created successfully");
      onSuccess();
    },
    onError: (error) => {
      setError(`Failed to set PIN: ${error.message}`);
      setPin("");
      setConfirmPin("");
      setStep('enter');
      setLoading(false);
    }
  });
  
  const validatePinMutation = api.users.validatePin.useMutation({
    onSuccess: () => {
      clickFeedback("success");
      onSuccess();
    },
    onError: () => {
      setShake(true);
      clickFeedback("error");
      setError("Incorrect PIN. Please try again.");
      setPin("");
      setLoading(false);
    }
  });

  // Reset shake animation
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  // Auto-validate PIN when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && !loading) {
      if (mode === 'create' && step === 'enter') {
        setStep('confirm');
        setLoading(false);
      } else if (mode === 'verify' || step === 'confirm') {
        validatePin();
      }
    }
  }, [pin, loading, mode, step]);

  const validatePin = async () => {
    if (loading) return; // Prevent multiple validation attempts
    
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'create') {
        if (step === 'confirm') {
          // In creation mode, confirm step - check if PINs match
          if (pin !== confirmPin) {
            setShake(true);
            clickFeedback("error");
            setError("PINs don't match. Please try again.");
            setPin("");
            setConfirmPin("");
            setStep('enter');
            setLoading(false);
            return;
          }
          
          // PINs match, save to database
          if (user && user.id) {
            await setPinMutation.mutateAsync({
              userId: user.id, 
              pin: pin
            });
          } else {
            setError("No user found. Please log in again.");
            setLoading(false);
          }
        } else {
          // First pin entry complete, now confirm
          setConfirmPin(pin);
          setPin("");
          setStep('confirm');
          setLoading(false);
        }
      } else {
        // Verify mode - validate PIN against database
        if (user && user.id) {
          await validatePinMutation.mutateAsync({
            userId: user.id,
            pin: pin
          });
        } else {
          setError("No user found. Please log in again.");
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("PIN validation error:", err);
      setShake(true);
      clickFeedback("error");
      setError("An error occurred. Please try again.");
      setPin("");
      setLoading(false);
    }
  };

  const handleNumberClick = (number: number) => {
    if (pin.length < 6) {
      clickFeedback("medium");
      setPin((prev) => prev + number);
    } else {
      setShake(true);
      clickFeedback("medium");
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) {
      clickFeedback("medium");
      return;
    }
    clickFeedback("medium");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometric = async () => {
    clickFeedback("medium");
    setLoading(true);
    
    try {
      // Here you would implement actual biometric authentication
      // For now, just simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
    } catch (err) {
      setError("Biometric authentication failed. Please use your PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          {mode === 'create' 
            ? (step === 'enter' ? 'Create PIN' : 'Confirm PIN')
            : 'Enter PIN'}
        </CardTitle>
        <p className="text-center text-gray-600">
          {loading ? "Verifying..." : 
            mode === 'create'
              ? (step === 'enter' ? "Create a 6-digit PIN" : "Confirm your PIN")
              : "Enter your 6-digit PIN"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}
        
        <div className="mt-6 flex justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${
                shake ? "animate-shake" : ""
              } ${
                pin.length > index
                  ? "border-blue-500 bg-blue-500"
                  : "border-blue-300"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              variant="outline"
              onClick={() => handleNumberClick(number)}
              className="h-14 text-xl font-semibold"
              disabled={loading}
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={handleBiometric}
            className="flex h-14 items-center justify-center"
            disabled={loading || !biometricSupported || mode === 'create'}
          >
            <Fingerprint className="h-6 w-6 text-blue-500" />
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNumberClick(0)}
            className="h-14 text-xl font-semibold"
            disabled={loading}
          >
            0
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex h-14 items-center justify-center"
            disabled={loading}
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center">
          <Button 
            variant="link" 
            className="text-sm text-blue-500"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default PinEntry;
