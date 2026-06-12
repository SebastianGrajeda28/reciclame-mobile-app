export async function getDocumentById<T>(_collection: string, _id: string): Promise<T | null> {
  throw new Error('Not implemented: getDocumentById');
}

export async function setDocument<T>(_collection: string, _id: string, _data: T): Promise<void> {
  throw new Error('Not implemented: setDocument');
}
