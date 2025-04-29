"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface BillPaymentDetails {
  billTypeId: string;
  billTypeName?: string;
  accountNumber: string;
  amount: number;
  date: string;
  paymentId: string;
}

export default function BillPaymentSuccessPage() {
  const { address } = useParams();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const [paymentDetails, setPaymentDetails] = useState<BillPaymentDetails | null>(null);

  useEffect(() => {
    // Provide haptic feedback on page load
    clickFeedback("success");
    
    // Try to get payment details from localStorage
    try {
      const storedPayment = localStorage.getItem("lastBillPayment");
      if (storedPayment) {
        setPaymentDetails(JSON.parse(storedPayment));
      } else {
        // If no details found, create mock data
        setPaymentDetails({
          billTypeId: "electricity",
          billTypeName: "Electricity",
          accountNumber: "1234567890",
          amount: 50.00,
          date: new Date().toISOString(),
          paymentId: `TRX${Date.now().toString().slice(-9)}`
        });
      }
    } catch (error) {
      console.error("Error retrieving payment details:", error);
      // Fallback to mock data
      setPaymentDetails({
        billTypeId: "electricity",
        billTypeName: "Electricity",
        accountNumber: "1234567890",
        amount: 50.00,
        date: new Date().toISOString(),
        paymentId: `TRX${Date.now().toString().slice(-9)}`
      });
    }
  }, []);

  const handleBack = () => {
    clickFeedback();
    router.push(`/dashboard/${address}`);
  };

  const getBillName = (billTypeId: string): string => {
    const billTypes: Record<string, string> = {
      "electricity": "Electricity",
      "water": "Water",
      "internet": "Internet",
      "phone": "Phone",
      "rent": "Rent",
      "credit": "Credit Card"
    };
    
    return billTypes[billTypeId] || billTypeId;
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
            <div className="flex justify-between">
              <span className="text-gray-500">Bill Type</span>
              <span className="font-medium">
                {paymentDetails?.billTypeName || 
                 (paymentDetails?.billTypeId ? getBillName(paymentDetails.billTypeId) : "Unknown")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Number</span>
              <span className="font-medium">{paymentDetails?.accountNumber || "1234567890"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">${paymentDetails?.amount.toFixed(2) || "50.00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">
                {paymentDetails?.date 
                  ? new Date(paymentDetails.date).toLocaleDateString() 
                  : new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-medium">{paymentDetails?.paymentId || "TRX123456789"}</span>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleBack}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
} 