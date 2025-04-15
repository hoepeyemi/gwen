"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  ArrowRight,
  Send,
  PhoneCall,
  KeyRound,
  RefreshCw,
  UserCheck,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { usePasskey } from "~/hooks/usePasskey";
import { ClientTRPCErrorHandler, parsePhoneNumber } from "~/lib/utils";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import ExpandingArrow from "~/components/ui/expanding-arrow";
import { type User } from "@prisma/client";
import { useParams, useSearchParams } from "next/navigation";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

const USE_PASSKEY = false;

export default function Component() {
  const { clickFeedback } = useHapticFeedback();
  const searchParams = useSearchParams();

  const isReceiver = searchParams.get("receiver") === "true";

  const { transferId } = useParams();
  const [step, setStep] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [contract, setContract] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sep10token, setSep10token] = useState<string | null>(null);
  const [isHoveredFeature, setIsHoveredFeature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { create } = usePasskey(phoneNumber);

  // tRPC Procedures
  const sep10Challenge = api.stellar.getAuthChallenge.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const sep10Token = api.stellar.signAuthChallenge.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const newOtp = api.post.otp.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const verifyOtp = api.post.verifyOtp.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const startAuth = api.stellar.startAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const saveAuth = api.stellar.saveAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const linkAuthSession = api.stellar.linkAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const transfer = api.transfers.getTransfer.useQuery(
    {
      id: String(transferId),
    },
    {
      enabled: !!transferId && isReceiver,
    },
  );

  const features = [
    { icon: UserCheck, title: "Identity Verification" },
    { icon: Smartphone, title: "Code via SMS" },
  ];

  const startAuthSession = async (receivedId?: number) => {
    try {
      const userId = user?.id ? Number(user?.id) : receivedId;
      if (!userId) {
        throw new Error("Invalid user id");
      }
      const keypair = Keypair.random();
      const { id: sessionId } = await startAuth.mutateAsync({
        userId: Number(userId),
        publicKey: keypair.publicKey(),
      });

      const { transaction, network_passphrase } =
        await sep10Challenge.mutateAsync({
          publicKey: keypair.publicKey(),
        });
      const tx = TransactionBuilder.fromXDR(transaction, network_passphrase);
      tx.sign(keypair);
      const token = await sep10Token.mutateAsync({
        transactionXDR: tx.toXDR(),
        networkPassphrase: network_passphrase,
      });
      console.log("token", token, "sessionId", sessionId);
      await saveAuth.mutateAsync({
        sessionId: sessionId,
        token,
      });
      await linkAuthSession.mutateAsync({
        authSessionId: sessionId,
        transferId: transferId as string,
        type: isReceiver ? "receiver" : "sender",
      });
      // Redirect to next page
      window.location.href = `/kyc/${String(transferId)}?${new URLSearchParams(searchParams).toString()}`;
      return sessionId;
    } catch (e) {
      console.error(e);
      toast.error((e as Error)?.message ?? "Failed to start auth session");
      throw e;
    }
  };

  const createPasskey = async () => {
    setIsLoading(true);
    const contractId = await create().catch((err) => {
      setIsLoading(false);
      throw err;
    });
    if (contractId) {
      setContract(contractId);
      console.log("contractId", contractId);
      return startAuthSession(Number(contractId));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (transfer.data?.recipientPhone) {
      setPhoneNumber(transfer.data?.recipientPhone);
    }
  }, [transfer.data]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (isReceiver) {
        setIsLoading(true);
        if (!transfer.data?.recipientPhone) {
          throw new Error("Recipient phone number is missing");
        }
        await newOtp.mutateAsync({ phone: transfer.data?.recipientPhone });
        
        // Auto-fill with default demo OTP code
        setOtp(["0", "0", "0", "0", "0", "0"]);
        console.log("Auto-filled with default demo OTP: 000000");
        
        setAttempt((prev) => prev + 1);
        clickFeedback("success");
        toast.success("Verification code sent to your phone");
        setIsLoading(false);
        setStep(2);
        setResendTimer(59); // Set initial resend timer
      }

      if (phoneNumber.length >= 10) {
        setIsLoading(true);
        await newOtp.mutateAsync({ phone: phoneNumber });
        
        // Auto-fill with default demo OTP code
        setOtp(["0", "0", "0", "0", "0", "0"]);
        console.log("Auto-filled with default demo OTP: 000000");
        
        setAttempt((prev) => prev + 1);
        clickFeedback("success");
        toast.success("Verification code sent to your phone");
        setIsLoading(false);
        setStep(2);
        setResendTimer(59); // Set initial resend timer
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (otp.join("").length === 6) {
        setIsLoading(true);
        // Simulate API call
        const userRes = await verifyOtp.mutateAsync({
          phone: isReceiver
            ? String(transfer.data?.recipientPhone)
            : phoneNumber,
          otp: otp.join(""),
        });
        setUser(userRes);
        clickFeedback("success");
        toast.success("Phone number verified successfully");
        setIsLoading(false);
        if (USE_PASSKEY || searchParams.get("passkey") === "true") {
          setStep(3);
        } else {
          console.log("userRes", userRes);
          return startAuthSession(userRes.id);
        }
      }
    } catch (e) {
      setIsLoading(false);
      toast((e as Error)?.message ?? "Failed to verify phone number");
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(0);
  };

  const handleResendOtp = async () => {
    try {
      setAttempt((prev) => prev + 1);
      setIsLoading(true);
      await newOtp.mutateAsync({ phone: phoneNumber });
      setIsLoading(false);
      setResendTimer(59); // Reset resend timer
      
      // Auto-fill with default demo OTP code instead of clearing it
      setOtp(["0", "0", "0", "0", "0", "0"]);
      console.log("Auto-filled with default demo OTP on resend: 000000");
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isReceiver) {
      const senderPhone = searchParams.get("senderPhone");
      if (senderPhone) {
        setPhoneNumber(decodeURIComponent(parsePhoneNumber(senderPhone)));
      }
    }
  }, [isReceiver, searchParams]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
              {isReceiver ? (
                <p className="text-sm leading-relaxed text-[#3390EC]">
                  You have received a payment. Here&#39;s what to expect:
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-[#3390EC]">
                  Welcome! You&#39;re about to set up a secure way to send money
                  using just your phone. Here&#39;s what to expect:
                </p>
              )}
              <ol className="mt-2 list-inside list-decimal text-sm text-gray-700">
                {isReceiver && (
                  <li>You&#39;ll receive a code to verify your phone number</li>
                )}
                <li>We&#39;ll verify your identity</li>
                {isReceiver ? (
                  <li>Set up your account to receive the money</li>
                ) : (
                  <li>You can then send money easily and securely</li>
                )}
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex cursor-help flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                        style={{
                          transform:
                            isHoveredFeature === index
                              ? "scale(1.05)"
                              : "scale(1)",
                          backgroundColor:
                            isHoveredFeature === index ? "#E7F3FF" : "white",
                        }}
                        onMouseEnter={() => setIsHoveredFeature(index)}
                        onMouseLeave={() => setIsHoveredFeature(null)}
                      >
                        <feature.icon className="mb-2 h-8 w-8 text-[#3390EC]" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent(feature.title)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button
              onClick={() => {
                clickFeedback();
                setStep(1);
              }}
              className="group w-full"
            >
              <p className="text-light text-xs">Continue</p>
              <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        );
      case 1:
        if (isReceiver) {
          return (
            <form onSubmit={handlePhoneSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2 text-sm text-gray-600">
                    <span className="flex items-center justify-start gap-2">
                      <Phone className="h-4 w-4" />
                      6-digit code {attempt === 0 ? "will be" : ""} sent to:{" "}
                      {transfer.data?.recipientPhone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 text-sm text-gray-600">
                    <span className="flex items-center justify-start gap-2">
                      <UserIcon className="h-6 w-6" />
                      This payment is intended for:{" "}
                      {transfer.data?.recipientName}. We will need to verify
                      your identity to complete the payment.
                    </span>
                  </div>
                </div>
                <Button
                  type="submit"
                  onClick={() => clickFeedback()}
                  className="group w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 animate-spin">⏳</span>
                      Sending Verification Code...
                    </>
                  ) : (
                    <>
                      <p className="text-light text-xs">
                        Send Verification Code
                      </p>
                      <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          );
        }
        return (
          <form onSubmit={handlePhoneSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Enter your phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +63 999 000 0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                <span className="ml-1 text-xs text-muted-foreground">
                  Make sure to include the country code (e.g. +63 for
                  Philippines)
                </span>
              </div>
              <Button
                type="submit"
                onClick={() => clickFeedback()}
                className="group w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <p className="text-light text-xs">Send Verification Code</p>
                    <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-0">
                  Enter the 6-digit OTP sent to your phone
                  {process.env.NODE_ENV === 'development' && (
                    <span className="ml-2 text-blue-600 font-semibold text-sm">
                      (Dev mode: Code is 000000)
                    </span>
                  )}
                </Label>
                <div className="flex justify-between">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="h-12 w-12 text-center text-2xl"
                      required
                    />
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                onClick={() => clickFeedback()}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Phone Number
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="flex items-center justify-between">
                {!isReceiver && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUpdatePhone}
                  >
                    Update Number
                    <PhoneCall className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                >
                  {resendTimer > 0 ? (
                    <>
                      Resend in {resendTimer}s
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Resend OTP
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setOtp(['0', '0', '0', '0', '0', '0'])}
                    className="bg-blue-100 text-blue-600 border-blue-300 hover:bg-blue-200"
                  >
                    Auto-fill Test Code (000000)
                  </Button>
                </div>
              )}
            </div>
          </form>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
              <p className="text-sm leading-relaxed text-[#3390EC]">
                Your phone number {phoneNumber} has been verified. Now,
                let&#39;s set up your passkey for secure and easy money
                transfers.
              </p>
            </div>
            <Button onClick={createPasskey} className="w-full">
              {isLoading ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Creating Passkey
                </>
              ) : (
                "Create Passkey"
              )}
              <KeyRound className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleUpdatePhone}
            >
              Update Number
              <PhoneCall className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-[#3390EC]">
            <Send className="mr-2 h-6 w-6 text-[#3390EC]" />
            {step === 0 &&
              (isReceiver ? "Your money is on the way" : "Just one more step")}
            {step === 1 && "Enter Your Phone Number"}
            {step === 2 && "Verify Your Phone"}
            {step === 3 && "Set Up Your Passkey"}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {step === 0 &&
              (isReceiver
                ? "Just a few clicks to receive your money"
                : "Let's set up your account for easy money transfers")}
            {step === 1 &&
              (isReceiver
                ? "We'll send a verification code to the phone number provided"
                : "We'll send a verification code to verify your number")}
            {step === 2 && "Enter the 6-digit code we sent to your phone"}
            {step === 3 &&
              "Secure your account and enable easy money transfers"}
          </p>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        <CardFooter className="flex flex-col pb-3 text-center text-sm text-gray-500">
          <span className="mt-2 text-xs text-muted-foreground">
            © 2024 Druid. All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

function getTooltipContent(title: string) {
  switch (title) {
    case "Identity Verification":
      return "We'll verify your identity to ensure secure transactions";
    case "Secure Passkey":
      return "Your personal information is protected with advanced security measures";
    case "Code via SMS":
      return "Receive a one-time password on your phone for verification";
    case "Lightning Fast Transfer":
      return "Complete the whole verification process in just a few minutes";
    default:
      return "";
  }
}
