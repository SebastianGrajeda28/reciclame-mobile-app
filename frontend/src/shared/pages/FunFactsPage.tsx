import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppPage, AppSurface } from "../components/AppPage";

const facts = [
  {
    id: 1,
    text: "Reciclar una botella de plastico puede ahorrar suficiente energia para encender un foco de 60 watts por 6 horas.",
    residue: "Plastico",
  },
  {
    id: 2,
    text: "Reciclar papel ahorra arboles, energia y agua. Por cada tonelada reciclada se salvan hasta 17 arboles.",
    residue: "Papel",
  },
];

export default function FunFactsPage() {
  return (
    <AppPage>
      <h1 className="text-[3rem] font-extrabold leading-none text-[#0b2f4e]">
        Gestionar fun facts
      </h1>

      <AppSurface className="mt-8 rounded-2xl bg-[#eef3f8] px-6 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08),0_12px_24px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-bold text-[#0b2f4e]">Agregar nuevo fun fact</h2>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Texto del fun fact</span>
              <Textarea
                placeholder="Escribe aqui el contenido"
                className="min-h-32 resize-none border-[#d9dee2] bg-white shadow-none focus-visible:ring-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#0b2f4e]">Tipo de residuo</span>
              <div className="flex h-12 items-center rounded-lg border border-[#d9dee2] bg-white px-4 text-sm text-slate-500">
                Todos
              </div>
            </label>

            <Button className="h-11 rounded-md bg-[#18b566] px-6 text-sm font-semibold text-white hover:bg-[#129a56]">
              <Plus className="mr-2 h-4 w-4" />
              Agregar fun fact
            </Button>
          </div>
      </AppSurface>

      <AppSurface className="mt-8">
          <h2 className="text-2xl font-bold text-[#0b2f4e]">Fun facts existentes</h2>

          <div className="mt-4 space-y-6">
            {facts.map((fact) => (
              <article
                key={fact.id}
                className="rounded-2xl bg-[#eef3f8] px-5 py-5 shadow-[0_3px_0_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-lg leading-6 text-slate-900">{fact.text}</p>
                    <span className="mt-3 inline-flex rounded-full bg-[#d7f5e7] px-3 py-1 text-xs font-medium text-[#0b7a4b]">
                      Tipo de residuo: {fact.residue}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-[#9bb7cf] text-[#0b2f4e]">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
      </AppSurface>
    </AppPage>
  );
}
