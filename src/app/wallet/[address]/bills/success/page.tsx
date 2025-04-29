"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { CheckCircle2, Home } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useEffect, useState } from "react";

export default function BillPaymentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { clickFeedback } = useHapticFeedback();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  useEffect(() => {
    // Try to get payment details from localStorage
    try {
      const details = localStorage.getItem("lastBillPayment");
      if (details) {
        setPaymentDetails(JSON.parse(details));
      }
    } catch (error) {
      console.error("Error retrieving payment details:", error);
    }
  }, []);
  
  const handleBack = () => {
    clickFeedback();
    router.push(`/wallet/${params.address}`);
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-light-blue">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful
          </CardTitle>
          <CardDescription className="text-lg">
            Your bill payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {paymentDetails ? (
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-semibold">{paymentDetails.billTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-semibold">{paymentDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">${paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {new Date(paymentDetails.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-semibold">{paymentDetails.paymentId}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 p-4 text-center">
              <p>Your bill payment has been completed.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            onClick={handleBack}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Wallet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 