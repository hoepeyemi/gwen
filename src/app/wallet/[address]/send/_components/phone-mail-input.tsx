"use client";
import { type FC, useState, useRef } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface VerificationFormProps {
  setRecipient: (recipient: string) => void;
}

const VerificationForm: FC<VerificationFormProps> = ({ setRecipient }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const { clickFeedback } = useHapticFeedback();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      setPhoneNumber(formattedValue);
      setRecipient(value);
      clickFeedback();
    }
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && phoneNumber.length === 0) {
      e.preventDefault();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setRecipient(value);
    clickFeedback();
  };

  return (
    <Tabs defaultValue="phone" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="phone">Phone</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>
      <TabsContent value="phone" className="space-y-4">
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              +1
            </span>
            <Input
              type="tel"
              placeholder="XXX XXX XXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              ref={phoneInputRef}
              maxLength={12}
            />
          </div>
          <p className="-translate-y-1 translate-x-1 text-start text-xs text-zinc-500">
            Enter your phone number with country code
          </p>
        </div>
      </TabsContent>
      <TabsContent value="email" className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={handleEmailChange}
          />
          <p className="text-sm text-muted-foreground">
            Enter your email address for verification
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default VerificationForm; 