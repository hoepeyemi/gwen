"use client";
import { Button } from "~/components/ui/button";
import { type FC, type ReactNode } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useQRScanner } from "~/hooks/useQRScanner";
import { CardContent, CardHeader } from "~/components/ui/card";
import { Camera, LogOut } from "lucide-react";
// import WalletLayoutWrapper from "~/app/wallet/[address]/send/_components/wallet-layout";
import { useAuth } from "~/providers/auth-provider";
import { useRouter } from "next/navigation";

const WalletLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { clickFeedback } = useHapticFeedback();
  const { scan } = useQRScanner();
  const { logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    clickFeedback();
    router.push("/auth/signin");
  };

  return (
    <CardContent className="space-y-6">
      {/*<NetworkSelector />*/}

      {children}
    </CardContent>
  );
};

export default WalletLayout;
