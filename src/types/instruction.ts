export type Instruction = {
  id: string;
  title: string;
  body?: string;
  imageUrl?: string;
  wasteTypeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  steps?: InstructionStep[];
};

export type InstructionStep = {
  id: string;
  instructionId: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

