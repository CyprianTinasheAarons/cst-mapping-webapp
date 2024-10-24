import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`);
}
