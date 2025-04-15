"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import SendPreview from "./preview";
import { parsePhoneNumber } from "~/lib/utils";

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

const DEFAULT_CURRENCY: Currency = { code: "USD", symbol: "$", name: "US Dollar" };

const SUPPORTED_CURRENCIES: Currency[] = [
  DEFAULT_CURRENCY,
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

export default function SendPage() {
  const router = useRouter();
  const { clickFeedback } = useHapticFeedback();
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => {
    clickFeedback("soft");
    router.back();
  };

  const handleContinue = () => {
    // Validate all fields
    if (!amount || !recipientName || !country || !phoneNumber) {
      setError("Please fill in all fields");
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Validate phone number
    const parsedPhone = parsePhoneNumber(phoneNumber);
    if (!parsedPhone) {
      setError("Please enter a valid phone number");
      return;
    }

    clickFeedback("soft");
    setShowPreview(true);
  };

  const handleEdit = () => {
    setShowPreview(false);
    clickFeedback("soft");
  };

  const handleSuccess = () => {
    clickFeedback("success");
    router.push("/dashboard");
  };

  if (showPreview) {
    return (
      <SendPreview
        amount={parseFloat(amount)}
        recipientName={recipientName}
        country={country}
        phoneNumber={phoneNumber}
        currency={selectedCurrency}
        onBack={handleBack}
        onSuccess={handleSuccess}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-light-blue p-4">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-blue-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl font-bold text-blue-600">
              Send Money
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm text-gray-600">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-12 pl-8 text-base"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm text-gray-600">
                Currency
              </Label>
              <select
                id="currency"
                value={selectedCurrency.code}
                onChange={(e) => {
                  const currency = SUPPORTED_CURRENCIES.find(
                    (c) => c.code === e.target.value
                  );
                  if (currency) setSelectedCurrency(currency);
                }}
                className="h-12 w-full rounded-md border border-gray-200 bg-white px-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientName" className="text-sm text-gray-600">
                Recipient Name
              </Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient's name"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm text-gray-600">
                Country
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter recipient's country"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm text-gray-600">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-12 text-base"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 