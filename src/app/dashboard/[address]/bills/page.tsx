"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, CreditCard, Home, Zap, Wifi, Droplet, Phone, X, ShieldCheck } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";
import { useAuth } from "~/providers/auth-provider";
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
  const [pinMode, setPinMode] = useState<'create' | 'verify'>('verify');
  
  // Fetch user data to check if PIN is set
  const { data: userData, isLoading: isUserLoading } = api.users.getUserById.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id, staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Handle case when backing from a bill selection
  const handleBack = () => {
    if (selectedBill) {
      setSelectedBill(null);
    } else {
      clickFeedback();
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
    
    // Check if user has a PIN set
    if (userData && !userData.hashedPin) {
      // User needs to create a PIN first
      setPinMode('create');
      setIsPinModalOpen(true);
    } else {
      // User has PIN, verify it
      setPinMode('verify');
      setIsPinModalOpen(true);
    }
  };
  
  const handlePinSuccess = async () => {
    // PIN verified or created successfully, now process the payment
    setIsPinModalOpen(false);
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success(`${selectedBill?.name} bill payment successful!`);
    router.push(`/dashboard/${address}/bills/success`);
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
    toast.error("Payment cancelled");
  };

  // Show loading state while checking user data
  if (isUserLoading && user?.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-blue-200"></div>
          <div className="h-4 w-48 rounded bg-blue-200"></div>
          <div className="h-4 w-32 rounded bg-blue-200"></div>
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
        
        {/* PIN Verification/Creation Modal */}
        <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                {pinMode === 'create' ? 'Create Security PIN' : 'Verify Payment'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {pinMode === 'create' 
                  ? 'Create a 6-digit PIN to secure your transactions' 
                  : `Enter your PIN to authorize the ${selectedBill.name} bill payment of $${amount}`}
              </DialogDescription>
            </DialogHeader>
            <PinEntry 
              onSuccess={handlePinSuccess} 
              onCancel={handlePinCancel}
              mode={pinMode}
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

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Pay Bills</h1>
          <p className="text-gray-500 mt-2">
            {userData && !userData.hashedPin ? 
              "You'll need to set up a security PIN before making payments" : 
              "Select a bill to pay"}
          </p>
        </div>

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