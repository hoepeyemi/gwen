"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { CheckCircle2, ArrowLeft, Home } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

export default function BillPaymentSuccessPage() {
  const { address } = useParams();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Provide haptic feedback on page load
    clickFeedback("success");
    
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
    router.push(`/dashboard/${address}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Bill Payment Successful!</h1>
          <p className="text-center text-gray-500">
            Your bill has been paid successfully. You can view the transaction details below.
          </p>
        </div>

        <Card className="mb-8 w-full">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentDetails ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill Type</span>
                  <span className="font-medium">{paymentDetails.billTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-medium">{paymentDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">${paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">
                    {new Date(paymentDetails.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium">{paymentDetails.paymentId}</span>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Your bill payment has been completed.</p>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
} 