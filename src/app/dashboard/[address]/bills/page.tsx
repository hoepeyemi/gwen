"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, CreditCard, Home, Zap, Wifi, Droplet, Phone, X } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";

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
  const [selectedBill, setSelectedBill] = useState<BillType | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

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
    
    // Instead of immediately processing payment, open PIN verification modal
    setIsPinModalOpen(true);
  };
  
  const handlePinSuccess = async () => {
    // PIN verified successfully, now process the payment
    setIsPinModalOpen(false);
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    router.push(`/dashboard/${address}/bills/success`);
  };
  
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
  };

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