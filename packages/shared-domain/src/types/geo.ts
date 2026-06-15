export type University = {
  id: string;
  name: string;
  isActive: boolean;
};

export type Campus = {
  id: string;
  universityId: string;
  name: string;
  address: string | null;
  isActive: boolean;
};
