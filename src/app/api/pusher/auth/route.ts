import { NextRequest, NextResponse } from "next/server";
import { getPusherServer } from "@/lib/pusherServer";

export async function POST(req: NextRequest) {
  try {
    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ error: "Pusher non configuré" }, { status: 503 });
    }

    let socketId = "";
    let channelName = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      socketId = (formData.get("socket_id") as string) || "";
      channelName = (formData.get("channel_name") as string) || "";
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      socketId = body.socket_id || "";
      channelName = body.channel_name || "";
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      socketId = params.get("socket_id") || "";
      channelName = params.get("channel_name") || "";
    }

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "socket_id et channel_name requis" }, { status: 400 });
    }

    const authResponse = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error: any) {
    console.error("[Pusher Auth Error]", error);
    return NextResponse.json({ error: error.message || "Erreur d'authentification Pusher" }, { status: 500 });
  }
}
