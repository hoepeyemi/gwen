"use client";
import { ArrowUpRight, Copy, DollarSign, MapPin } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";
import toast from "react-hot-toast";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
interface TransferData {
  id: string;
  amount: any;
  recipientName?: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
  createdAt?: string;
}

export default function Component() {
  const searchParams = useSearchParams();
  const { transferId } = useParams();
  const router = useRouter();
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Try to get transfer data from localStorage
  useEffect(() => {
    try {
      // Check if we have data in localStorage
      const storedTransferData = localStorage.getItem('currentTransfer');
      if (storedTransferData) {
        const parsedData = JSON.parse(storedTransferData);
        if (parsedData.id === transferId) {
          setTransferData(parsedData);
        }
      }
    } catch (error) {
      console.error("Error retrieving transfer from localStorage:", error);
    }
  }, [transferId]);

  const transfer = api.stellar.getTransferData.useQuery(
    {
      transferId: String(transferId),
    },
    {
      enabled: !!transferId,
    },
  );

  // Update transferData with API data if available
  useEffect(() => {
    if (transfer.data) {
      console.log("Transfer data from API:", transfer.data);
      // Convert to the expected format
      setTransferData({
        id: transfer.data.id,
        amount: transfer.data.amount,
        recipientName: transfer.data.recipientName,
        phoneNumber: transfer.data.recipientPhone,
        // Handle case where currency might be a string or an object with code property
        currency: typeof transfer.data.currency === 'object' && transfer.data.currency !== null
          ? (transfer.data.currency as { code: string }).code
          : transfer.data.currency,
      });
    }
  }, [transfer.data]);

  const handlePaymentConfirmation = () => {
    setIsSubmitting(true);
    // Simulate API call for payment confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/payment-link/${String(transferId)}/confirm`);
    }, 1000);
  };

  // Use data from either the API or localStorage
  const amount = transfer.data?.amount || transferData?.amount || 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            MoneyGram Cash Payment
          </CardTitle>
          <CardDescription>
            Complete your payment at a MoneyGram location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Pay</Label>
            <div className="flex items-center text-2xl font-bold">
              <DollarSign className="mr-1 h-6 w-6" />
              {Number(amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="receive-code">Receive Code</Label>
            <div className="flex items-center space-x-2">
              <Input id="receive-code" value="45890e6wq" readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard
                          .writeText("45890e6wq")
                          .then(() => toast.success("Code Copied to Clipboard"))
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Receive Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Recipient Information</Label>
            <p className="text-sm">Name:  ACME Financial Services</p>
            <p className="text-sm">City: New York</p>
            <p className="text-sm">Country: United States</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4" />
              How to Pay
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Find a MoneyGram location near you</li>
              <li>Bring the Receive Code and the exact amount in cash</li>
              <li>Tell the agent you&#39;re sending money to a company</li>
              <li>Provide the recipient information (Name, City, Country)</li>
              <li>Pay the amount plus any MoneyGram fees in cash</li>
              <li>Keep your receipt as proof of payment</li>
            </ol>
          </div>
          <div className="rounded-md border border-[#3390EC] bg-[#E7F3FF] p-3 text-sm">
            <p className="font-semibold text-[#3390EC]">Important:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-gray-700">
              <li>MoneyGram locations may have different operating hours</li>
              <li>Bring a valid government-issued photo ID</li>
              <li>Fees may vary by location and payment amount</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link
            href={`/payment-link/${String(transferId)}?${new URLSearchParams(searchParams).toString()}`}
          >
            <Button variant="outline">Back</Button>
          </Link>
          <div className="flex gap-2">
            <Link
              href="https://www.moneygram.com/intl/en/en-locator"
              target="_blank"
            >
              <Button variant="outline">
                Find Location
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button onClick={handlePaymentConfirmation} disabled={isSubmitting}>
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>I've Made the Payment</>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
