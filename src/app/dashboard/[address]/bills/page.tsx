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
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
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

const billTypes: BillType[] = [
  {
    id: "electricity",
    name: "Electricity",
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    description: "Pay your electricity bills",
  },
  {
    id: "water",
    name: "Water",
    icon: <Droplet className="h-6 w-6 text-blue-500" />,
    description: "Pay your water utility bills",
  },
  {
    id: "internet",
    name: "Internet",
    icon: <Wifi className="h-6 w-6 text-purple-500" />,
    description: "Pay your internet service bills",
  },
  {
    id: "phone",
    name: "Phone",
    icon: <Phone className="h-6 w-6 text-green-500" />,
    description: "Pay your phone bills",
  },
  {
    id: "rent",
    name: "Rent",
    icon: <Home className="h-6 w-6 text-orange-500" />,
    description: "Pay your rent",
  },
  {
    id: "credit",
    name: "Credit Card",
    icon: <CreditCard className="h-6 w-6 text-red-500" />,
    description: "Pay your credit card bills",
  },
];

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
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  // Query to check if user has a PIN set up
  const userDetailsQuery = api.users.getUserDetails.useQuery(
    { userId: user?.id || 0 },
    {
      enabled: !!user?.id, // Only run when user ID is available
      staleTime: 60000, // Cache result for 1 minute
    }
  );

  const handleBack = () => {
    clickFeedback();
    if (selectedBill) {
      setSelectedBill(null);
    } else {
      router.push(`/dashboard/${address}`);
    }
  };

  const handleBillSelect = (bill: BillType) => {
    clickFeedback();
    setSelectedBill(bill);
  };

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    clickFeedback();
    
    if (!user?.id) {
      toast.error("Please sign in to continue");
      router.push("/auth/signin");
      return;
    }
    
    setIsCheckingPin(true);
    
    try {
      // Check if user has a PIN set up
      if (userDetailsQuery.data?.hasPinSetup) {
        // User has a PIN, show verification modal
        setIsPinModalOpen(true);
      } else {
        // User needs to set up a PIN first, redirect to PIN setup
        toast("You need to set up a PIN first", {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#3b82f6',
            color: '#fff',
          },
        });
        
        // Store current bill payment intent in sessionStorage
        try {
          sessionStorage.setItem("pendingBillPayment", JSON.stringify({
            billType: selectedBill?.id,
            accountNumber,
            amount,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error("Failed to store pending payment:", error);
        }
        
        // Redirect to PIN setup
        router.push("/wallet/pin-setup");
      }
    } catch (error) {
      console.error("Error checking PIN status:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsCheckingPin(false);
    }
  };
  
  const handlePinSuccess = async () => {
    // PIN verified successfully, now process the payment
    setIsPinModalOpen(false);
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Clear any pending bill payment from session storage
    try {
      sessionStorage.removeItem("pendingBillPayment");
    } catch (error) {
      console.error("Error clearing pending payment:", error);
    }
    
    // Navigate to success page
    router.push(`/dashboard/${address}/bills/success`);
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
  };

  // Check for pending bill payment on mount
  useEffect(() => {
    if (!selectedBill) {
      try {
        const pendingPaymentStr = sessionStorage.getItem("pendingBillPayment");
        if (pendingPaymentStr) {
          const pendingPayment = JSON.parse(pendingPaymentStr);
          // Find the bill type that matches the pending payment
          const matchingBill = billTypes.find(bill => bill.id === pendingPayment.billType);
          if (matchingBill) {
            setSelectedBill(matchingBill);
            setAccountNumber(pendingPayment.accountNumber || "");
            setAmount(pendingPayment.amount || "");
            toast("Continuing with your pending bill payment", {
              icon: '🔔',
              style: {
                borderRadius: '10px',
                background: '#3b82f6',
                color: '#fff',
              },
            });
          }
        }
      } catch (error) {
        console.error("Error retrieving pending payment:", error);
      }
    }
  }, [selectedBill]);

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
                  disabled={isLoading || isCheckingPin}
                >
                  {isLoading ? "Processing..." : 
                   isCheckingPin ? "Checking PIN status..." : 
                   "Pay Bill"}
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