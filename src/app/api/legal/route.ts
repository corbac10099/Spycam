import { NextRequest, NextResponse } from "next/server";
import { getSgsLegalSettings, updateSgsLegalSettings } from "@/lib/sgsLegal";

export async function GET() {
  try {
    const legal = await getSgsLegalSettings();
    return NextResponse.json({ success: true, legal });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateSgsLegalSettings(body);
    return NextResponse.json({ success: true, legal: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
