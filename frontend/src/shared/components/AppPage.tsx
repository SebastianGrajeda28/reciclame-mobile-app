import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceWidth = "full" | "form";

interface AppPageProps {
  children: ReactNode;
  className?: string;
}

interface AppSurfaceProps {
  children: ReactNode;
  width?: SurfaceWidth;
  className?: string;
}

const SURFACE_WIDTH_CLASS: Record<SurfaceWidth, string> = {
  full: "w-full",
  form: "max-w-[760px]",
};

export function AppPage({ children, className }: AppPageProps) {
  return (
    <div className={cn("min-h-[calc(100dvh-5rem)] bg-[#fbfcfb]", className)}>
      <div className="w-full px-6 pb-12 pt-4 md:px-8">{children}</div>
    </div>
  );
}

export function AppSurface({ children, width = "full", className }: AppSurfaceProps) {
  return (
    <section className={cn(SURFACE_WIDTH_CLASS[width], className)}>
      {children}
    </section>
  );
}
