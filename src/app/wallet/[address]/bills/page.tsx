"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Loader2, ArrowLeft, Zap, Droplet, Wifi, Phone, Tv, Flame } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
import PinEntry from "~/app/wallet/_components/pin";

// Map bill icon strings to Lucide icons
const getBillIcon = (iconName: string) => {
  switch (iconName) {
    case "zap":
      return <Zap className="h-6 w-6" />;
    case "droplet":
      return <Droplet className="h-6 w-6" />;
    case "wifi":
      return <Wifi className="h-6 w-6" />;
    case "phone":
      return <Phone className="h-6 w-6" />;
    case "tv":
      return <Tv className="h-6 w-6" />;
    case "flame":
      return <Flame className="h-6 w-6" />;
    default:
      return <Zap className="h-6 w-6" />;
  }
};

export default function BillsPage() {
  const [billStep, setBillStep] = useState<"select" | "details" | "verification">("select");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  
  const { clickFeedback } = useHapticFeedback();
  const router = useRouter();
  const params = useParams();
  
  // Get bill types from the API
  const { data: apiBillTypes, isLoading: isLoadingBillTypes } = api.bills.getBillTypes.useQuery();
  
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
      
      // Redirect to success page
      router.push(`/wallet/${params.address}/bills/success`);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(`Payment failed: ${error.message}`);
    }
  });
  
  const handleBack = () => {
    if (billStep === "select") {
      router.push(`/wallet/${params.address}`);
    } else if (billStep === "details") {
      setBillStep("select");
    } else if (billStep === "verification") {
      setBillStep("details");
    }
    clickFeedback("soft");
  };
  
  const handleBillSelect = (bill: any) => {
    setSelectedBill(bill);
    setBillStep("details");
    clickFeedback();
  };
  
  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountNumber || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Show PIN verification
    setShowPinEntry(true);
  };
  
  const handlePinSuccess = async () => {
    setShowPinEntry(false);
    setIsLoading(true);
    clickFeedback("medium");
    
    try {
      await payBillMutation.mutateAsync({
        billId: selectedBill.id,
        amount: Number(amount),
        accountNumber,
        address
      });
    } catch (error) {
      // Error is handled in the mutation callbacks
    }
  };
  
  const handlePinCancel = () => {
    setShowPinEntry(false);
    clickFeedback("soft");
  };
  
  if (isLoadingBillTypes) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const billTypes = apiBillTypes || [];
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-blue-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-blue-600">
          {billStep === "select"
            ? "Pay Bills"
            : billStep === "details"
            ? `Pay ${selectedBill?.name} Bill`
            : "Verify Payment"}
        </h1>
      </div>
      
      {billStep === "select" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {billTypes.map((bill) => (
            <Card 
              key={bill.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleBillSelect(bill)}
            >
              <CardContent className="flex items-center p-4">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  {getBillIcon(bill.icon)}
                </div>
                <div>
                  <h3 className="font-semibold">{bill.name}</h3>
                  <p className="text-sm text-gray-600">{bill.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {billStep === "details" && selectedBill && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedBill.name} Bill</CardTitle>
            <CardDescription>Enter your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayBill} className="space-y-4">
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Service Address (Optional)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter service address"
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
                  "Continue to Payment"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Pin Entry modal */}
      {showPinEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-full max-w-md">
            <PinEntry onSuccess={handlePinSuccess} onCancel={handlePinCancel} />
          </Card>
        </div>
      )}
    </div>
  );
} 