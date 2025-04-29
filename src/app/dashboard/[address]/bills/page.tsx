"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Zap, Wifi, Droplet, Phone, Tv, Flame, Loader2 } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

// Add Dialog components for the PIN verification modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

// Map bill icon strings to Lucide icons
const getBillIcon = (iconName: string) => {
  switch (iconName) {
    case "zap":
      return <Zap className="h-6 w-6 text-yellow-500" />;
    case "droplet":
      return <Droplet className="h-6 w-6 text-blue-500" />;
    case "wifi":
      return <Wifi className="h-6 w-6 text-purple-500" />;
    case "phone":
      return <Phone className="h-6 w-6 text-green-500" />;
    case "tv":
      return <Tv className="h-6 w-6 text-red-500" />;
    case "flame":
      return <Flame className="h-6 w-6 text-orange-500" />;
    default:
      return <Zap className="h-6 w-6 text-yellow-500" />;
  }
};

export default function BillsPage() {
  const { address } = useParams();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Get bill types from the API
  const { data: billTypes, isLoading: isLoadingBillTypes } = api.bills.getBillTypes.useQuery();
  
  // Payment mutation
  const payBillMutation = api.bills.payBill.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      toast.success(`${selectedBill.name} bill paid successfully!`);
      
      // Store payment details in localStorage for the success page
      try {
        localStorage.setItem("lastBillPayment", JSON.stringify({
          billTypeId: selectedBill?.id || "",
          billTypeName: selectedBill?.name || "",
          accountNumber: accountNumber,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          paymentId: data.transactionId || `TRX${Date.now().toString().slice(-9)}`
        }));
      } catch (error) {
        console.error("Error saving payment details to localStorage:", error);
      }
      
      router.push(`/dashboard/${address}/bills/success`);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(`Payment failed: ${error.message}`);
    }
  });

  const handleBack = () => {
    clickFeedback();
    if (selectedBill) {
      setSelectedBill(null);
    } else {
      router.push(`/dashboard/${address}`);
    }
  };

  const handleBillSelect = (bill: any) => {
    clickFeedback();
    setSelectedBill(bill);
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    clickFeedback();
    
    if (!accountNumber || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Instead of immediately processing payment, open PIN verification modal
    setIsPinModalOpen(true);
  };
  
  const handlePinSuccess = async () => {
    // PIN verified successfully, now process the payment
    setIsPinModalOpen(false);
    setIsLoading(true);

    try {
      await payBillMutation.mutateAsync({
        billId: selectedBill.id,
        amount: Number(amount),
        accountNumber,
        address: ""
      });
    } catch (error) {
      // Error is handled in the mutation callbacks
    }
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
  };

  if (isLoadingBillTypes) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (selectedBill) {
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

          <Card className="mb-8 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getBillIcon(selectedBill.icon)}
                {selectedBill.name} Bill
              </CardTitle>
              <CardDescription>{selectedBill.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayBill} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your account number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to pay"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Bill"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* PIN Verification Modal */}
        <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Verify Payment</DialogTitle>
              <DialogDescription className="text-center">
                Enter your PIN to authorize the {selectedBill.name} bill payment of ${amount}
              </DialogDescription>
            </DialogHeader>
            <PinEntry 
              onSuccess={handlePinSuccess} 
              onCancel={handlePinCancel}
            />
          </DialogContent>
        </Dialog>
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

        <h1 className="mb-8 text-2xl font-bold">Pay Bills</h1>

        <div className="grid w-full gap-4">
          {billTypes?.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => handleBillSelect(bill)}
            >
              <CardContent className="flex items-center space-x-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  {getBillIcon(bill.icon)}
                </div>
                <div>
                  <h3 className="font-semibold">{bill.name}</h3>
                  <p className="text-sm text-gray-500">{bill.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 