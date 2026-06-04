export type Friendship = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
};
