"use client";
import { type FC, useState, useRef } from "react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface AmountInputProps {
  value?: number | string;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

const AmountInput: FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  className,
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const { clickFeedback } = useHapticFeedback();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    clickFeedback();

    // Convert to number and validate
    const numValue = parseFloat(newValue);
    if (onChange) {
      onChange(isNaN(numValue) ? null : numValue);
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        $
      </span>
      <Input
        ref={inputRef}
        type="number"
        step="0.01"
        min="0"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        className={cn("pl-8", className)}
      />
    </div>
  );
};

export default AmountInput; 