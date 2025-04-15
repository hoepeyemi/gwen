"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { 
  ArrowLeft, 
  Copy, 
  Share, 
  QrCode, 
  Check,
  X
} from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { shortStellarAddress } from "~/lib/utils";
import { useAuth } from "~/providers/auth-provider";

export default function ReceiveTransfers() {
  const { address } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [qrVisible, setQrVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrValue] = useState(`https://druid-kohl.vercel.app/payment/${address}`);
  const { clickFeedback } = useHapticFeedback();

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleShare = () => {
    clickFeedback();
    if (navigator.share) {
      navigator.share({
        title: "Send me money with Druid",
        text: "Send money instantly",
        url: qrValue,
      }).catch(err => {
        console.error("Error sharing:", err);
      });
    } else {
      alert("Sharing not supported on this browser. Copy the link instead.");
    }
  };

  const handleCopy = () => {
    clickFeedback();
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
  };

  const handleCreateQR = () => {
    clickFeedback();
    setQrVisible(true);
  };

  const handleClosePreview = () => {
    clickFeedback();
    setQrVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            clickFeedback();
            router.push(`/wallet/${address}`);
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Receive Money</h1>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {qrVisible ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClosePreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-lg bg-white p-3 shadow-md">
                  {/* Here you would use a QR code library. For now using a placeholder */}
                  <div className="h-60 w-60 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-gray-600" />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-500">
                  Scan this QR code to send money to {user?.firstName || "me"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-3 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <QrCode className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-center text-lg font-medium">
                  Receive money to your account
                </h2>
                <p className="text-center text-sm text-gray-500">
                  Share your payment link or QR code
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                  <div className="truncate">
                    {shortStellarAddress(String(address))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="ml-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCreateQR}
                    className="flex items-center justify-center space-x-2"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Show QR</span>
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
