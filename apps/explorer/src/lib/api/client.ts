const BACKEND = (process.env.NODE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${BACKEND}/${path.replace(/^\/+/, '')}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = (data as { error?: string }).error ?? `API error ${res.status}: ${path}`
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}
