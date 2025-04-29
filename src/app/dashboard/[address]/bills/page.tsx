"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, CreditCard, Home, Zap, Wifi, Droplet, Phone, X } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";
import { useAuth } from "~/providers/auth-provider";

// Add Dialog components for the PIN verification modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface BillType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

// Map icon strings to React components
const iconMap = {
  "Zap": <Zap className="h-6 w-6 text-yellow-500" />,
  "Droplet": <Droplet className="h-6 w-6 text-blue-500" />,
  "Wifi": <Wifi className="h-6 w-6 text-purple-500" />,
  "Phone": <Phone className="h-6 w-6 text-green-500" />,
  "Home": <Home className="h-6 w-6 text-orange-500" />,
  "CreditCard": <CreditCard className="h-6 w-6 text-red-500" />
};

export default function BillsPage() {
  const { address } = useParams();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<BillType | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);

  // Get bill types from the API
  const { data: apiBillTypes, isLoading: isLoadingBillTypes } = api.bills.getBillTypes.useQuery();

  // Payment mutation
  const payBillMutation = api.bills.payBill.useMutation({
    onSuccess: (data) => {
      // Save payment details to localStorage for the success page
      try {
        localStorage.setItem("lastBillPayment", JSON.stringify({
          billTypeId: selectedBill?.id || "",
          billTypeName: selectedBill?.name || "",
          accountNumber: accountNumber,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
          paymentId: data.paymentId || `TRX${Date.now().toString().slice(-9)}`
        }));
      } catch (error) {
        console.error("Error saving payment details to localStorage:", error);
      }
      
      toast.success(data.message || "Bill payment successful!");
      router.push(`/dashboard/${address}/bills/success`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process payment");
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (apiBillTypes) {
      // Convert API bill types to our BillType format with proper icons
      const formattedBillTypes = apiBillTypes.map(bill => ({
        ...bill,
        icon: iconMap[bill.icon as keyof typeof iconMap] || <CreditCard className="h-6 w-6 text-gray-500" />
      }));
      setBillTypes(formattedBillTypes);
    }
  }, [apiBillTypes]);

  const handleBack = () => {
    clickFeedback();
    router.push(`/dashboard/${address}`);
  };

  const handleBillSelect = (bill: BillType) => {
    clickFeedback();
    setSelectedBill(bill);
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    clickFeedback();
    
    // Validate inputs
    if (!accountNumber.trim()) {
      toast.error("Please enter an account number");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // Open PIN verification modal
    setIsPinModalOpen(true);
  };
  
  const handlePinSuccess = async () => {
    // PIN verified successfully, now process the payment
    setIsPinModalOpen(false);
    setIsLoading(true);

    if (selectedBill) {
      try {
        await payBillMutation.mutateAsync({
          billTypeId: selectedBill.id,
          accountNumber: accountNumber,
          amount: parseFloat(amount),
          userId: user?.id
        });
      } catch (error) {
        // Error is handled in the mutation callbacks
        console.error("Payment error:", error);
      }
    }
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
  };

  if (isLoadingBillTypes) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading bill types...</p>
        </div>
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
                {selectedBill.icon}
                {selectedBill.name} Bill
              </CardTitle>
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
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Pay Bill"}
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
          {billTypes.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-pointer transition-colors hover:bg-gray-50"
              onClick={() => handleBillSelect(bill)}
            >
              <CardContent className="flex items-center space-x-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  {bill.icon}
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