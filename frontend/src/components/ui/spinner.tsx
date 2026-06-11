import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-10 w-10 border-4",
  lg: "h-14 w-14 border-4",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      aria-label="Cargando"
      role="status"
      className={cn(
        "animate-spin rounded-full border-[#d9dee2] border-t-[#43DF8B]",
        sizeClasses[size],
        className,
      )}
    />
  );
}
