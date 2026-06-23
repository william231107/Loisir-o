import { NextResponse } from "next/server";
import { getActivities } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const city = searchParams.get("city") ?? undefined;

  const activities = await getActivities({ q, city });
  return NextResponse.json({ count: activities.length, activities });
}
