import { Spinner } from "@/components/ui/spinner";

export default function AppLoadingScreen() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-[#f7f8f6]">
      <div className="flex flex-col items-center gap-4 text-[#0b2f4e]">
        <Spinner />
        <p className="text-sm font-medium text-slate-600">Cargando...</p>
      </div>
    </div>
  );
}
