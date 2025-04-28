import Link from "next/link";
import { FC } from "react";
import { cn } from "~/lib/utils";

interface Props {
  className?: string;
}

const Disclaimer: FC<Props> = ({ className }) => {
  return (
    <div className={cn("rounded-lg bg-amber-50 p-3 text-amber-800", className)}>
      <p className="text-sm">
        <strong>Note:</strong> This is a demo transaction. No actual funds will be transferred.
        Please read our{" "}
        <Link href="/terms" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>{" "}
        for more information.
      </p>
    </div>
  );
};

export default Disclaimer; 