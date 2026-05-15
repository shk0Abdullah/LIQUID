import { json } from "@sveltejs/kit";

const DEFAULT_NODE_API_URL = "http://localhost:3000";

function getBaseUrl(): string {
  // Intentionally not PUBLIC_: this runs server-side only.
  return process.env.NODE_API_URL ?? DEFAULT_NODE_API_URL;
}

async function proxy(request: Request, path: string): Promise<Response> {
  const url = new URL(request.url);
  const target = new URL(getBaseUrl().replace(/\/+$/, "") + "/" + path);
  target.search = url.search;

  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  // Keep the proxy simple: pass-through response body and status.
  const res = await fetch(target, init);
  const contentType = res.headers.get("content-type") ?? "application/json";
  const text = await res.text();

  return new Response(text, {
    status: res.status,
    headers: {
      "content-type": contentType,
      // Allow browser caching of expensive endpoints if you want later; default off.
      "cache-control": "no-store",
    },
  });
}

export async function GET({ request, params }) {
  return proxy(request, params.path);
}

export async function POST({ request, params }) {
  return proxy(request, params.path);
}

export async function PUT({ request, params }) {
  return proxy(request, params.path);
}

export async function DELETE({ request, params }) {
  return proxy(request, params.path);
}

export async function OPTIONS() {
  return json({ ok: true });
}

