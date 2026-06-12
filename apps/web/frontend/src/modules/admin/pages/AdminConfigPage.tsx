import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const items = Array.from({ length: 9 }, (_, i) => i + 1);

export default function AdminConfigPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel
      </Link>

      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-gray-500 mb-8">Opciones de configuración del sistema.</p>

      <div className="grid grid-cols-3 gap-6">
        {items.map((n) => (
          <div
            key={n}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border hover:border-emerald-500 hover:shadow-md transition cursor-pointer"
          >
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={`https://placehold.co/64x64/d1fae5/065f46?text=${n}`}
                alt={`Opción ${n}`}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Opción {n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
