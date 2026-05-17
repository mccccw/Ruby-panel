import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { assertSameOrigin, toErrorMessage } from "@/lib/utils";

export function ok<T>(data: T, init?: ResponseInit): NextResponse<{ ok: true; data: T }> {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: unknown, status = 400): NextResponse<{ ok: false; error: string }> {
  return NextResponse.json({ ok: false, error: toErrorMessage(error) }, { status });
}

export function guarded(request: Request): void {
  assertSameOrigin(request);
}

export function jsonObject(value: unknown): Prisma.InputJsonValue {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Prisma.InputJsonObject;
}
