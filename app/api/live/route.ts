import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenant = searchParams.get("tenant") ?? "alpha-health";
  const seed = hashCode(tenant);
  const rnd = mulberry32(seed + Date.now());
  const activeAgents = 10 + Math.floor(rnd() * 6);
  const queueDepth = Math.max(0, 6 + Math.floor((rnd() - 0.5) * 6));
  const successRate = 94 + Math.floor(rnd() * 6);
  return NextResponse.json({ activeAgents, queueDepth, successRate });
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


