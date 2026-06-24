import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

export type ResidueOption = {
  residue: string;
};

type ResidueFilterChipsProps = {
  options: ResidueOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ResidueFilterChips({ options, selected, onChange }: ResidueFilterChipsProps) {
  const [open, setOpen] = useState(false);
  const allSelected = options.length > 0 && selected.length === options.length;

  const toggleResidue = (residue: string) => {
    if (selected.includes(residue)) {
      if (selected.length === 1) {
        return;
      }
      onChange(selected.filter((item) => item !== residue));
      return;
    }

    onChange([...selected, residue]);
  };

  const toggleAll = () => {
    onChange(options.map((option) => option.residue));
  };

  const removeResidue = (residue: string) => {
    if (selected.length === 1) {
      return;
    }
    onChange(selected.filter((item) => item !== residue));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d7e6f2] bg-white px-4 text-sm font-semibold text-[#0b2f4e] transition hover:border-[#b9d8c8]"
          >
            Residuos
            <ChevronDown className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[260px] p-2">
          <button
            type="button"
            onClick={toggleAll}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-[#0b2f4e] hover:bg-slate-50"
          >
            <span>Todos</span>
            {allSelected ? <Check className="h-4 w-4 text-[#18b566]" /> : null}
          </button>

          <div className="my-1 h-px bg-slate-200" />

          <div className="max-h-[260px] overflow-y-auto">
            {options.map((option) => {
              const isChecked = selected.includes(option.residue);

              return (
                <button
                  key={option.residue}
                  type="button"
                  onClick={() => toggleResidue(option.residue)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#0b2f4e] hover:bg-slate-50"
                >
                  <span>{option.residue}</span>
                  {isChecked ? <Check className="h-4 w-4 text-[#18b566]" /> : null}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {selected.map((residue) => (
        <span
          key={residue}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full bg-[#eef3f8] px-3 text-sm font-medium text-[#0b2f4e]"
          )}
        >
          {residue}
          <button
            type="button"
            onClick={() => removeResidue(residue)}
            disabled={selected.length === 1}
            className={cn(
              "rounded-full p-0.5 transition hover:bg-[#d7e6f2]",
              selected.length === 1 && "cursor-not-allowed opacity-40 hover:bg-transparent"
            )}
            aria-label={`Quitar ${residue}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}