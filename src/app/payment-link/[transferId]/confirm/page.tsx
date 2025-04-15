"use client";
import { Button } from "~/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

const ConfirmComponent: React.FC = () => {
  const { transferId } = useParams();
  const router = useRouter();
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  
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

  const handleReturnToDashboard = () => {
    // First try to navigate to the dashboard, if we have a local wallet address
    try {
      const userData = localStorage.getItem("auth_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.walletAddress) {
          router.push(`/wallet/${user.walletAddress}`);
          return;
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    
    // Fallback to main wallet page or home page
    const fallbackRoutes = ['/wallet', '/dashboard', '/'];
    
    // Try each fallback route in order
    for (const route of fallbackRoutes) {
      try {
        router.push(route);
        return;
      } catch (error) {
        console.error(`Failed to navigate to ${route}:`, error);
        // Continue to next fallback
      }
    }
    
    // If all fallbacks fail, go to home page
    router.push('/');
  };

  if (!transferData && transfer.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Loading payment details...
            </CardTitle>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use data from either the API or localStorage
  const paymentData = transfer.data || transferData;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Transfer Confirmed!
          </CardTitle>
          <CardDescription>
            Your payment of $
            {paymentData?.amount ? Number(paymentData.amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) : '0.00'}{" "}
            USD to {paymentData?.recipientName || 'the recipient'} has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono font-medium">{transferId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-mono font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-mono font-medium text-green-500">
                Completed
              </span>
            </div>
          </div>
          <Button 
            onClick={handleReturnToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <span className="mt-4 w-full text-center text-xs text-muted-foreground">
            © Druid, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmComponent;
