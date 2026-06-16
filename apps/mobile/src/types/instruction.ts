import type { InstructionStep as BaseInstructionStep } from "@reciclame/shared-domain";

export type { BaseInstructionStep as InstructionStep };

export type Instruction = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  wasteTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  steps?: BaseInstructionStep[];
};
