import { User } from '@/src/types/user';

export async function getUserProfile(_userId: string): Promise<User | null> {
  throw new Error('Not implemented: getUserProfile');
}
