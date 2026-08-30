import Pusher from "pusher";

let pusherServerInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (pusherServerInstance) return pusherServerInstance;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || "eu";

  if (!appId || !key || !secret) {
    return null;
  }

  pusherServerInstance = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherServerInstance;
}

export async function triggerPusherEvent(channel: string, event: string, data: any): Promise<boolean> {
  try {
    const pusher = getPusherServer();
    if (!pusher) {
      return false;
    }
    await pusher.trigger(channel, event, data);
    return true;
  } catch (error) {
    console.warn(`[Pusher Server] Trigger error on channel ${channel}:`, error);
    return false;
  }
}
