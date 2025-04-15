"use client";
import { Banknote } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
interface TransferData {
  id: string;
  amount: any; // Changed from number | any to just any
  recipientName?: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
  createdAt?: string;
}

export default function Component() {
  const { transferId } = useParams();
  const searchParams = useSearchParams();
  const [transferData, setTransferData] = useState<TransferData | null>(null);

  const transfer = api.stellar.getTransferData.useQuery(
    {
      transferId: String(transferId),
    },
    {
      enabled: !!transferId,
    },
  );

  // Try to get transfer data from localStorage if it's not in searchParams
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

  const isReceiver = searchParams.get("receiver") === "true";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-[#3390EC]">
            Choose Payment Method
          </CardTitle>
          <CardDescription className="text-center">
            Select how you&#39;d like to{" "}
            {isReceiver ? "receive your transfer" : "complete your transfer"}
            {transferData && (
              <div className="mt-2 font-medium">
                Amount: ${Number(transferData.amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 space-y-6">
          <Link
            href={`/payment-link/${String(transferId)}/bank-transfer?${new URLSearchParams(searchParams).toString()}`}
          >
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-10"
              onClick={() => console.log("Bank Transfer selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold text-base sm:text-lg">Bank Transfer</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isReceiver
                    ? "Receive funds directly to your bank account"
                    : "Pay using online banking or wire transfer"}
                </p>
              </div>
            </Button>
          </Link>
          <Link
            href={`/payment-link/${String(transferId)}/${isReceiver ? "moneygram-collection" : "cash"}?${new URLSearchParams(searchParams).toString()}`}
          >
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-10"
              onClick={() => console.log("Cash Payment selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold text-base sm:text-lg">
                  Cash {isReceiver ? "Collection" : "Payment"}
                  <Badge
                    className="ml-2 border-none bg-gradient-to-br from-[#3390EC] to-blue-300"
                    color="blue"
                  >
                    Coming Soon
                  </Badge>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isReceiver
                    ? "Pick up cash at a local collection point"
                    : "Pay with cash at a local payment point"}
                </p>
              </div>
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms">
              <span className="text-blue-500">Terms of Service</span>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <span className="text-blue-500">Privacy Policy</span>
            </Link>
          </p>
          <span className="mt-4 text-xs text-muted-foreground">
            © 2025 Druid, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
