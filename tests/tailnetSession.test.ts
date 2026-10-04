import { afterEach, expect, spyOn, test } from 'bun:test';
import { probeTailnetSession } from '@/services/api/tailnetSession';

let fetchSpy: ReturnType<typeof spyOn> | undefined;
afterEach(() => fetchSpy?.mockRestore());

test('discovers identity only from the HTTPS origin without sending credentials', async () => {
  fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ authenticated: true }))
  );
  expect(await probeTailnetSession('https://mini.example.ts.net:8443')).toBe(true);
  expect(fetchSpy).toHaveBeenCalledWith(
    new URL('https://mini.example.ts.net:8443/management-session'),
    expect.objectContaining({ credentials: 'omit', cache: 'no-store', redirect: 'error' })
  );
});

test.each([false, 'true', null])('rejects unverified discovery %s', async (authenticated) => {
  fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ authenticated }))
  );
  expect(await probeTailnetSession('https://mini.example.ts.net:8443')).toBe(false);
});

test('leaves ordinary localhost login alone', async () => {
  fetchSpy = spyOn(globalThis, 'fetch');
  expect(await probeTailnetSession('http://127.0.0.1:8317')).toBe(false);
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('fails closed on an unavailable or older server', async () => {
  fetchSpy = spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 404 }));
  expect(await probeTailnetSession('https://mini.example.ts.net:8443')).toBe(false);
});
