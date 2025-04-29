"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, CreditCard, Home, Zap, Wifi, Droplet, Phone, X, Loader2 } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";
import { api } from "~/trpc/react";
import { toast } from "react-hot-toast";

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

// Map icon strings to Lucide components
const getIconComponent = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case "zap":
      return <Zap className="h-6 w-6 text-yellow-500" />;
    case "droplet":
      return <Droplet className="h-6 w-6 text-blue-500" />;
    case "wifi":
      return <Wifi className="h-6 w-6 text-purple-500" />;
    case "phone":
      return <Phone className="h-6 w-6 text-green-500" />;
    case "home":
      return <Home className="h-6 w-6 text-orange-500" />;
    case "credit-card":
      return <CreditCard className="h-6 w-6 text-red-500" />;
    default:
      return <CreditCard className="h-6 w-6 text-gray-500" />;
  }
};

export default function BillsPage() {
  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const [selectedBill, setSelectedBill] = useState<BillType | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(true);

  // Fetch bill types using tRPC
  const { data: billTypesData, isLoading: isBillTypesLoading, error: billTypesError } = api.bills.getBillTypes.useQuery(undefined, {
    enabled: true, // Always fetch bills on page load
  });

  // Update state when bill types data is loaded
  useEffect(() => {
    if (billTypesData) {
      // Convert API data to component's BillType format with icons
      const formattedBillTypes = billTypesData.map(bill => ({
        id: bill.id,
        name: bill.name,
        description: bill.description,
        icon: getIconComponent(bill.icon)
      }));
      setBillTypes(formattedBillTypes);
      setIsLoadingBills(false);
    }

    if (billTypesError) {
      console.error("Failed to fetch bill types:", billTypesError);
      toast.error("Failed to load bill types");
      setIsLoadingBills(false);
    }
  }, [billTypesData, billTypesError]);

  // Payment mutation
  const payBillMutation = api.bills.payBill.useMutation({
    onSuccess: (data) => {
      // Store transaction data in localStorage for success page
      localStorage.setItem('lastBillPayment', JSON.stringify({
        billType: data.billType,
        accountNumber: data.accountNumber,
        amount: data.amount,
        date: data.date,
        transactionId: data.transactionId
      }));

      // Navigate to success page
      router.push(`/dashboard/${address}/bills/success`);
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(`Payment failed: ${error.message}`);
    }
  });

  const handleBack = () => {
    clickFeedback();
    router.push(`/dashboard`);
  };

  const handleBillSelect = (bill: BillType) => {
    clickFeedback();
    setSelectedBill(bill);
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    clickFeedback();
    
    if (!selectedBill) {
      toast.error("Please select a bill type");
      return;
    }

    if (!accountNumber) {
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
      // Call the payment mutation
      payBillMutation.mutate({
        billTypeId: selectedBill.id,
        accountNumber: accountNumber,
        amount: parseFloat(amount),
        walletAddress: address as string
      });
    }
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
  };

  if (isLoadingBills || isBillTypesLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p>Loading bill payment options...</p>
      </div>
    );
  }

  if (selectedBill) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 p-4">
        <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center">
          <Button
            onClick={() => setSelectedBill(null)}
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