import { AppPage, AppSurface } from "../components/AppPage";

export default function InstructionsPage() {
  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Instrucciones
      </h1>

      <AppSurface className="mt-10 rounded-2xl border border-dashed border-[#b7c7d6] bg-[#eef3f8] px-8 py-12">
        <p className="text-xl font-semibold text-[#0b2f4e]">TBA</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Esta vista quedara reservada para el contenido de instrucciones. Por ahora se mantiene
          como placeholder dentro del flujo final de navegacion.
        </p>
      </AppSurface>
    </AppPage>
  );
}
