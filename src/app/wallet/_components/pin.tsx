"use client";

import { type FC, useEffect, useState } from "react";
import { Fingerprint, ScanFaceIcon, Delete, Shield, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

interface PinEntryProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const PinEntry: FC<PinEntryProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [isPinSetupMode, setIsPinSetupMode] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
      toast("PIN created successfully", {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setPin("");
      setConfirmPin("");
      setIsConfirming(false);
      setIsPinSetupMode(false);
      
      // Immediately continue with success
      onSuccess();
    },
    onError: (error) => {
      setError(`Failed to set PIN: ${error.message}`);
      setShake(true);
      setPin("");
      setConfirmPin("");
      setIsConfirming(false);
      setLoading(false);
    }
  });
  
  const validatePinMutation = api.users.validatePin.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        clickFeedback("success");
        onSuccess();
      } else if (data.needsSetup) {
        // If PIN not set up yet, switch to setup mode
        setIsPinSetupMode(true);
        setPin("");
        setLoading(false);
        toast("Please set up your PIN first", {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#3b82f6',
            color: '#fff',
          },
        });
      } else {
        setError("Incorrect PIN. Please try again.");
        setShake(true);
        setPin("");
        setLoading(false);
      }
    },
    onError: (error) => {
      setError(`Error: ${error.message}`);
      setShake(true);
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
      if (isPinSetupMode) {
        if (!isConfirming) {
          // First entry of PIN setup - move to confirmation
          setIsConfirming(true);
          setConfirmPin(pin);
          setPin("");
        } else {
          // Confirming PIN setup
          if (pin === confirmPin) {
            // PINs match - save to database
            setupPin();
          } else {
            // PINs don't match
            setError("PINs don't match. Please try again.");
            setShake(true);
            setPin("");
            setConfirmPin("");
            setIsConfirming(false);
          }
        }
      } else {
        // Regular PIN validation
        validatePin();
      }
    }
  }, [pin, loading, isPinSetupMode, isConfirming, confirmPin]);

  // Setup a new PIN in the database
  const setupPin = async () => {
    if (!user || !user.id) {
      setError("User not found. Please log in again.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await setPinMutation.mutateAsync({
        userId: user.id,
        pin: confirmPin,
      });
      
      // Success is handled in the mutation callbacks
    } catch (error) {
      // Error is handled in the mutation callbacks
      console.error("Error setting up PIN:", error);
    }
  };

  // Validate an existing PIN against the database
  const validatePin = async () => {
    if (loading) return; // Prevent multiple validation attempts
    
    if (!user || !user.id) {
      setError("User not found. Please log in again.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await validatePinMutation.mutateAsync({
        userId: user.id,
        pin: pin,
      });
      
      // Success/failure is handled in the mutation callbacks
    } catch (error) {
      // Error is handled in the mutation callbacks
      console.error("Error validating PIN:", error);
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
          Gwen
        </CardTitle>
        <p className="text-center text-gray-600">
          {loading ? "Verifying..." : 
            isPinSetupMode ? 
              (isConfirming ? "Confirm your new PIN" : "Create a new PIN") : 
              "Enter your PIN"}
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

        {isPinSetupMode && isConfirming && (
          <div className="text-center text-sm text-blue-600">
            <p>Enter the same PIN again to confirm</p>
          </div>
        )}

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
            disabled={loading || !biometricSupported || isPinSetupMode}
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
