import { cn } from "@/lib/utils/cn";

interface StepProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepProgressBar({ totalSteps, currentStep }: StepProgressBarProps) {
  return (
    <div className="flex items-center justify-center gap-1.25">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <span
          key={step}
          className={cn(
            "text-12 flex size-6 shrink-0 items-center justify-center rounded-full font-semibold",
            step === currentStep
              ? "bg-orange-400 text-white"
              : "bg-background-200 text-gray-gray-300"
          )}
        >
          {step}
        </span>
      ))}
    </div>
  );
}
