// app/lib/para/cleanup.ts
export function clearParaLocal() {
  try { localStorage.removeItem('para:session'); } catch {}
  try { localStorage.removeItem('para:user'); } catch {}
  try { sessionStorage.removeItem('para:session'); } catch {}
}

export async function clearParaServer() {
  // fire-and-forget; ignore failures (CORS/cookies)
  const req = (url: string) =>
    fetch(url, { method: 'POST', credentials: 'include', mode: 'cors' }).catch(() => {});
  await Promise.race([
    Promise.all([
      req('https://api.getpara.com/logout'),
      req('https://api.usecapsule.com/logout'),
      // capsule session regen off (seen in your logs)
      req('https://api.getpara.com/touch?regenerate=false'),
    ]),
    // don’t block UI if network is slow
    new Promise((r) => setTimeout(r, 600)),
  ]);
}

export async function clearParaAll() {
  clearParaLocal();
  await clearParaServer();
}
