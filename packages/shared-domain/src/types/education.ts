export type FunFact = {
  id: string;
  text: string;
  wasteTypeId?: string | null;
  isActive: boolean;
};

export type FunFactPayload = Pick<FunFact, "text" | "wasteTypeId">;

export type InstructionStep = {
  id: string;
  text: string;
  imageUrl: string | null;
};

export type InstructionBody = {
  steps: InstructionStep[];
};

export type Instruction = {
  id: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  wasteTypeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type InstructionPayload = {
  title?: string;
  wasteTypeId?: string | null;
  body?: string | null;
};

/** @deprecated Use InstructionBody instead */
export type StepOrderBody = { stepOrder: string[] };
