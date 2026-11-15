export type AsyncResult<T> = { ok: true; data: T } | { ok: false; error: unknown };

export async function captureAsync<T>(operation: Promise<T>): Promise<AsyncResult<T>> {
  try { return { ok: true, data: await operation }; }
  catch (error) { return { ok: false, error }; }
}
