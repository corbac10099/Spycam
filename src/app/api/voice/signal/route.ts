import { NextRequest, NextResponse } from "next/server";
import { triggerPusherEvent } from "@/lib/pusherServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lobbyId, fromId, toId, type, data } = body;

    if (!lobbyId || !fromId || !toId || !type || !data) {
      return NextResponse.json({ success: false, error: "Paramètres de signalisation manquants" }, { status: 400 });
    }

    const payload = {
      fromId,
      toId,
      type,
      data,
      timestamp: Date.now(),
    };

    // Trigger on both private and public channel names for compatibility
    const successPrivate = await triggerPusherEvent(`private-lobby-${lobbyId}`, "voice-signal", payload);
    const successPublic = await triggerPusherEvent(`lobby-${lobbyId}`, "voice-signal", payload);

    return NextResponse.json({
      success: successPrivate || successPublic,
      dispatched: true,
      timestamp: payload.timestamp,
    });
  } catch (error: any) {
    console.error("[Voice Signal Route Error]", error);
    return NextResponse.json({ success: false, error: error.message || "Erreur de transmission du signal" }, { status: 500 });
  }
}
