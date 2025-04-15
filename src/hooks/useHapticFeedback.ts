// This is a placeholder hook for haptic feedback functionality

type FeedbackType = "soft" | "medium" | "heavy" | "success" | "error" | "warning" | "selectionChanged";

export function useHapticFeedback() {
  // These functions are no-ops in the web app
  const impactOccurred = () => {};
  const notificationOccurred = () => {};
  const selectionChanged = () => {};
  const clickFeedback = (intensity?: FeedbackType) => {};

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
    clickFeedback,
  };
} 