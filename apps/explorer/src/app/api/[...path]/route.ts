import { type NextRequest, NextResponse } from 'next/server'

const BASE = (process.env.NODE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

async function proxy(
  request: NextRequest,
  path: string[],
): Promise<Response> {
  const incoming = new URL(request.url)
  const target = new URL(`${BASE}/${path.join('/')}`)
  target.search = incoming.search

  const init: RequestInit = { method: request.method }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text()
    if (body) {
      init.body = body
      init.headers = {
        'content-type': request.headers.get('content-type') ?? 'application/json',
      }
    }
  }

  const upstream = await fetch(target.toString(), { ...init, cache: 'no-store' })
  const text = await upstream.text()

  return new Response(text, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-store',
    },
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path)
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path)
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path)
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path)
}
export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path)
}
