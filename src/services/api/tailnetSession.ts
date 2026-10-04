// This optional same-origin endpoint is provided by the DIodide deployment.
// It confirms Tailscale identity without exposing the backend management key.
export async function probeTailnetSession(origin: string): Promise<boolean> {
  try {
    const url = new URL('/management-session', origin);
    if (url.protocol !== 'https:') return false;
    const response = await fetch(url, {
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;
    const data: unknown = await response.json();
    return (
      typeof data === 'object' &&
      data !== null &&
      'authenticated' in data &&
      data.authenticated === true
    );
  } catch {
    return false;
  }
}
