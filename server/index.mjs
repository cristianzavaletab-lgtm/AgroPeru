import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const port = Number(process.env.PORT || process.env.API_PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const apiToken = (process.env.DNIRUC_API_TOKEN || process.env.VITE_DNIRUC_API_TOKEN || '').trim();
const upstreamBase = 'https://dniruc.apisperu.com/api/v1';
const requestsByIp = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
};

const isRateLimited = (ip) => {
  const now = Date.now();
  if (requestsByIp.size > 500) {
    for (const [address, timestamps] of requestsByIp) {
      if (!timestamps.some(timestamp => now - timestamp < 60_000)) requestsByIp.delete(address);
    }
  }
  const previous = requestsByIp.get(ip) || [];
  const recent = previous.filter(timestamp => now - timestamp < 60_000);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > 20;
};

const lookupIdentity = async (request, response, kind, number) => {
  const expectedLength = kind === 'dni' ? 8 : 11;
  if (!new RegExp(`^\\d{${expectedLength}}$`).test(number)) {
    sendJson(response, 400, { message: `El ${kind.toUpperCase()} debe tener ${expectedLength} dígitos.` });
    return;
  }
  if (!apiToken) {
    sendJson(response, 503, { message: 'La consulta DNI/RUC aún no está configurada en el servidor.' });
    return;
  }
  if (isRateLimited(request.socket.remoteAddress || 'local')) {
    sendJson(response, 429, { message: 'Demasiadas consultas. Espera un minuto e inténtalo nuevamente.' });
    return;
  }

  try {
    const upstream = await fetch(`${upstreamBase}/${kind}/${number}`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data) {
      const message = data?.message || data?.error || `No se encontró información para el ${kind.toUpperCase()}.`;
      sendJson(response, upstream.status >= 400 && upstream.status < 500 ? upstream.status : 502, { message });
      return;
    }
    const normalizedData = data && typeof data === 'object' && data.data && typeof data.data === 'object'
      ? data.data
      : data;
    sendJson(response, 200, { data: normalizedData });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    sendJson(response, 502, { message: timedOut ? 'La consulta demoró demasiado. Inténtalo otra vez.' : 'No se pudo conectar con el servicio DNI/RUC.' });
  }
};

const serveStatic = (request, response) => {
  if (!existsSync(dist)) {
    sendJson(response, 404, { message: 'Compila la aplicación con npm run build antes de iniciar producción.' });
    return;
  }
  let requested;
  try {
    requested = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
  } catch {
    sendJson(response, 400, { message: 'La URL solicitada no es válida.' });
    return;
  }
  const normalized = normalize(requested).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(dist, normalized);
  const outsideDist = relative(dist, filePath).startsWith('..');
  if (outsideDist || !existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(dist, 'index.html');
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  createReadStream(filePath).pipe(response);
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const match = url.pathname.match(/^\/api\/identity\/(dni|ruc)\/(\d+)$/);
  if (match) {
    if (request.method !== 'GET') return sendJson(response, 405, { message: 'Método no permitido.' });
    return lookupIdentity(request, response, match[1], match[2]);
  }
  if (url.pathname === '/api/health') return sendJson(response, 200, { ok: true, identityLookupConfigured: Boolean(apiToken) });
  if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { message: 'Ruta no encontrada.' });
  serveStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`AgroPerú disponible en http://${host}:${port}`);
  console.log(`Consulta DNI/RUC: ${apiToken ? 'configurada' : 'pendiente de token'}`);
});
