"use client";

import { type FC, useEffect, useState } from "react";
import { Fingerprint, ScanFaceIcon, Delete, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useAuth } from "~/providers/auth-provider";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

interface PinEntryProps {
  onSuccess: () => void;
  onCancel?: () => void;
  isCreating?: boolean;
}

const PinEntry: FC<PinEntryProps> = ({ onSuccess, onCancel, isCreating = false }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [confirmationMode, setConfirmationMode] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { clickFeedback } = useHapticFeedback();
  const { user, refreshUserData } = useAuth();
  const [biometricSupported] = useState<boolean>(
    typeof window !== "undefined" &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
  );
  
  // Check if the user has a PIN set
  const [hasPinSet, setHasPinSet] = useState<boolean>(false);
  const [isSettingPin, setIsSettingPin] = useState<boolean>(isCreating);

  // tRPC mutations
  const setPinMutation = api.users.setPin.useMutation();
  const validatePinMutation = api.users.validatePin.useMutation();
  
  // Handle set PIN mutation result
  useEffect(() => {
    if (setPinMutation.isSuccess) {
      const data = setPinMutation.data;
      console.log("Set PIN result:", data);
      if (data.success) {
        clickFeedback("success");
        toast.success("PIN set successfully");
        setHasPinSet(true);
        setIsSettingPin(false);
        onSuccess();
      } else {
        setError(data.message || "Failed to set PIN. Please try again.");
        setShake(true);
        clickFeedback("error");
        setPin("");
        setConfirmPin("");
        setConfirmationMode(false);
      }
    } else if (setPinMutation.isError) {
      console.error("Error setting PIN:", setPinMutation.error);
      setError("Failed to set PIN. Please try again.");
      setShake(true);
      clickFeedback("error");
      setPin("");
      setConfirmPin("");
      setConfirmationMode(false);
    }
  }, [
    setPinMutation.isSuccess, 
    setPinMutation.isError, 
    setPinMutation.data, 
    clickFeedback, 
    onSuccess, 
    setHasPinSet, 
    setIsSettingPin, 
    setError, 
    setShake,
    setPin,
    setConfirmPin,
    setConfirmationMode
  ]);
  
  // Handle validate PIN mutation result
  useEffect(() => {
    if (validatePinMutation.isSuccess) {
      clickFeedback("success");
      toast.success("PIN verified");
      onSuccess();
    } else if (validatePinMutation.isError) {
      setError("Incorrect PIN. Please try again.");
      setShake(true);
      clickFeedback("error");
      setPin("");
      setLoading(false);
    }
  }, [
    validatePinMutation.isSuccess, 
    validatePinMutation.isError, 
    clickFeedback, 
    onSuccess, 
    setError, 
    setShake, 
    setPin, 
    setLoading
  ]);

  // Check if user has PIN on initial load
  useEffect(() => {
    if (user?.hashedPin) {
      setHasPinSet(true);
      setIsSettingPin(false);
    } else {
      setHasPinSet(false);
      setIsSettingPin(isCreating);
    }
  }, [user, isCreating]);

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
      if (isSettingPin) {
        if (!confirmationMode) {
          // Move to confirmation mode
          setConfirmationMode(true);
          setConfirmPin("");
          clickFeedback("medium");
        } else if (confirmPin.length === 6) {
          // Both PINs are complete, verify they match
          validateNewPin();
        }
      } else {
        // Validate existing PIN
        validatePin();
      }
    }
  }, [pin, confirmPin, loading, isSettingPin, confirmationMode]);

  const validateNewPin = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      if (pin !== confirmPin) {
        setError("PINs don't match. Please try again.");
        setShake(true);
        clickFeedback("error");
        setPin("");
        setConfirmPin("");
        setConfirmationMode(false);
        setLoading(false);
        return;
      }
      
      // PINs match, set it in the database
      if (user?.id) {
        await setPinMutation.mutateAsync({
          userId: user.id,
          pin: pin
        });
        // The success handler will call onSuccess
      } else {
        throw new Error("User ID not found");
      }
    } catch (error) {
      console.error("Error setting new PIN:", error);
      setError("Failed to set PIN. Please try again.");
      setShake(true);
      clickFeedback("error");
      setPin("");
      setConfirmPin("");
      setConfirmationMode(false);
    } finally {
      setLoading(false);
    }
  };

  const validatePin = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      
      // Validate PIN against database
      await validatePinMutation.mutateAsync({
        userId: user.id,
        pin: pin
      });
      // Success handler will call onSuccess
    } catch (error) {
      // Error handler will display message
      setLoading(false);
    }
  };

  const handleNumberClick = (number: number) => {
    if (isSettingPin && confirmationMode) {
      // In confirmation mode, update confirmPin
      if (confirmPin.length < 6) {
        clickFeedback("medium");
        setConfirmPin((prev) => prev + number);
      } else {
        setShake(true);
        clickFeedback("medium");
      }
    } else {
      // Standard PIN entry
      if (pin.length < 6) {
        clickFeedback("medium");
        setPin((prev) => prev + number);
      } else {
        setShake(true);
        clickFeedback("medium");
      }
    }
  };

  const handleDelete = () => {
    if (isSettingPin && confirmationMode) {
      // In confirmation mode, delete from confirmPin
      if (confirmPin.length === 0) {
        clickFeedback("medium");
        return;
      }
      clickFeedback("medium");
      setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      // Standard PIN deletion
      if (pin.length === 0) {
        clickFeedback("medium");
        return;
      }
      clickFeedback("medium");
      setPin((prev) => prev.slice(0, -1));
    }
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

  const resetPinEntry = () => {
    if (confirmationMode) {
      setConfirmationMode(false);
      setConfirmPin("");
      setPin("");
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
           isSettingPin 
             ? (confirmationMode ? "Confirm your PIN" : "Create your PIN") 
             : "Enter your PIN"}
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
                (isSettingPin && confirmationMode 
                  ? confirmPin.length > index 
                  : pin.length > index)
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
            disabled={loading || !biometricSupported || isSettingPin}
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

        <div className="text-center space-y-2">
          {isSettingPin && confirmationMode && (
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={resetPinEntry}
              disabled={loading}
            >
              Start Over
            </Button>
          )}
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
