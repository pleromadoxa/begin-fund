import { NextRequest, NextResponse } from "next/server";
import { publicOrigin } from "@/lib/server/public-origin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin", publicOrigin(request)), 303);
  res.cookies.delete("begin_admin");
  return res;
}
