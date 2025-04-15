"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  // This is a web-based QR scanner implementation
  const scan = () => {
    // In a real implementation, you would integrate with a library like html5-qrcode
    // For now, we'll just simulate a QR code scan with a prompt
    const qrData = prompt("Enter or paste a payment URL (normally this would open a QR scanner)");
    
    if (qrData) {
      // Handle the scanned data - normally would validate and parse the URL
      if (qrData.startsWith("http")) {
        router.push(qrData);
      } else {
        alert("Invalid QR code data. Expected a URL.");
      }
    }
  };

  return { scan, isScanning };
};
