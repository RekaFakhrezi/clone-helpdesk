/** Buka `params` (Promise di App Router) untuk satu segmen dinamis. */
export async function unwrapParams<T>(params: Promise<T>): Promise<T> {
  return params;
}
