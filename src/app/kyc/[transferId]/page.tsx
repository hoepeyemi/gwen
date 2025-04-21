"use client";

import { useState, FC, useEffect } from "react";
import { ArrowRight, ChevronLeft, Upload, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { useParams, useSearchParams } from "next/navigation";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import toast from "react-hot-toast";
import axios from "axios";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

const KYCForm: FC = () => {
  const { clickFeedback } = useHapticFeedback();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { transferId } = useParams();
  const [steps, setSteps] = useState([
    "Personal Information",
    "Photo ID",
    "Bank Details",
  ]);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    bank_account_number: "",
    bank_number: "",
    photo_id_front: null as File | null,
    photo_id_back: null as File | null,
  });
  const [error, setError] = useState("");

  const isReceiver = searchParams.get("receiver") === "true";

  useEffect(() => {
    if (!isReceiver) {
      setSteps(["Personal Information", "Photo ID"]);
    }
  }, [searchParams, isReceiver]);

  // tRPC handlers
  const putKyc = api.stellar.kyc.useMutation({
    // onError: ClientTRPCErrorHandler,
  });
  const kycFileConfig = api.stellar.kycFileConfig.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const handleChange = (name: string, value: string | File | null) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = event.target.files?.[0] ?? null;
    handleChange(fieldName, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clickFeedback();
    setError("");

    if (step === 0) {
      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email_address
      ) {
        setError("Please fill in all personal information fields.");
        return;
      }
    } else if (step === 1) {
      if (!formData.photo_id_front) {
        setError("Please upload the front of your photo ID.");
        return;
      }
    } else if (step === 2) {
      if (!formData.bank_account_number || !formData.bank_number) {
        setError("Please fill in all bank details fields.");
        return;
      }
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const { photo_id_front, photo_id_back, ...stringFields } = formData;
        
        // First submit text data
        const sep12Id = await putKyc.mutateAsync({
          type: isReceiver ? "receiver" : "sender",
          transferId: String(transferId),
          fields: stringFields,
        });
        
        // Then handle file uploads directly to database
        if (photo_id_front || photo_id_back) {
          // Convert files to base64
          const photoIdFrontBase64 = photo_id_front ? await fileToBase64(photo_id_front) : undefined;
          const photoIdBackBase64 = photo_id_back ? await fileToBase64(photo_id_back) : undefined;
          
          // Upload files to our database
          try {
            // Use direct fetch to avoid tRPC API issues
            const kycResult = await fetch('/api/trpc/stellar.kycUploadFiles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                json: {
                  type: isReceiver ? "receiver" : "sender",
                  transferId: String(transferId),
                  photoIdFront: photoIdFrontBase64,
                  photoIdFrontType: photo_id_front?.type,
                  photoIdBack: photoIdBackBase64,
                  photoIdBackType: photo_id_back?.type,
                  sep12Id: sep12Id
                }
              }),
            });
            
            if (!kycResult.ok) {
              throw new Error(`Failed to upload KYC files: ${kycResult.statusText}`);
            }
          } catch (uploadError) {
            console.error('Error uploading KYC files:', uploadError);
            // Continue anyway since we've already saved the text data
          }
        }
        
        // Display success message and redirect
        clickFeedback("success");
        toast.success("Account Details Submitted!");
        
        // Redirect to next page
        window.location.href = `/payment-link/${String(transferId)}?${new URLSearchParams(searchParams).toString()}`;
      } catch (error) {
        console.error('Error submitting KYC data:', error);
        setError("Failed to submit your information. Please try again.");
        setLoading(false);
      }
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            Account Verification
          </CardTitle>
          <CardDescription>
            We need to validate your personal information to complete the
            transfer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress
              value={((step + 1) / steps.length) * 100}
              className="w-full"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    value={formData.first_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    value={formData.last_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address</Label>
                  <Input
                    id="email_address"
                    name="email_address"
                    type="email"
                    placeholder="john.doe@example.com"
                    onChange={(e) =>
                      handleChange("email_address", e.target.value)
                    }
                    value={formData.email_address}
                    required
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">
                    Bank Account Number
                  </Label>
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    placeholder="1234567890"
                    onChange={(e) =>
                      handleChange("bank_account_number", e.target.value)
                    }
                    value={formData.bank_account_number}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_number">Routing Number</Label>
                  <Input
                    id="bank_number"
                    name="bank_number"
                    placeholder="123456789"
                    onChange={(e) =>
                      handleChange("bank_number", e.target.value)
                    }
                    value={formData.bank_number}
                    required
                  />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="photo_id_front">Photo ID Front</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="photo_id_front"
                      name="photo_id_front"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo_id_front")}
                      className="hidden"
                    />
                    <Label
                      htmlFor="photo_id_front"
                      className="flex h-32 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-4 transition hover:border-gray-400 focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="h-6 w-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {formData.photo_id_front
                            ? formData.photo_id_front.name
                            : "Click to upload front of ID"}
                        </span>
                      </span>
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo_id_back">
                    Photo ID Back (Optional)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="photo_id_back"
                      name="photo_id_back"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo_id_back")}
                      className="hidden"
                    />
                    <Label
                      htmlFor="photo_id_back"
                      className="flex h-32 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-4 transition hover:border-gray-400 focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="h-6 w-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {formData.photo_id_back
                            ? formData.photo_id_back.name
                            : "Click to upload back of ID (Optional)"}
                        </span>
                      </span>
                    </Label>
                  </div>
                </div>
              </>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex w-full items-center justify-between">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              disabled={loading}
              className={step === 0 ? "w-full" : "ml-4 flex-1"}
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Safely validating...
                </>
              ) : (
                <>
                  {step === steps.length - 1 ? "Complete verification" : "Next"}
                </>
              )}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <span className="mt-4 w-full text-center text-xs text-muted-foreground">
            © Gwen, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default KYCForm;
