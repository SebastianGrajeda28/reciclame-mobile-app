import type { InstructionStep } from '@reciclame/shared-domain';

export type { InstructionStep };

export type Instruction = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  wasteTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  steps?: InstructionStep[];
};
