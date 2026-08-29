import { NextRequest, NextResponse } from 'next/server';
import { LobbyItem, LobbyMember, ChatMessage } from '../route';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lobby = (global._spycam_lobbies || []).find((l) => l.id === id);

  if (!lobby) {
    return NextResponse.json({ success: false, error: 'Salon introuvable ou expiré' }, { status: 404 });
  }

  return NextResponse.json({ success: true, lobby });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const lobbyIndex = (global._spycam_lobbies || []).findIndex((l) => l.id === id);

    if (lobbyIndex === -1) {
      return NextResponse.json({ success: false, error: 'Salon introuvable' }, { status: 404 });
    }

    const lobby = global._spycam_lobbies![lobbyIndex];

    // Action 1: Join Lobby
    if (body.action === 'join') {
      const { gameName, tagLine, rank, rankUrl, rankTier = 12, isPrivateRank = false, roles = ['Tous Rôles'], avatarUrl } = body;

      if (!gameName || !tagLine) {
        return NextResponse.json({ success: false, error: 'Pseudo et Tag requis' }, { status: 400 });
      }

      // Check if already in lobby
      const existing = lobby.members.find(
        (m) => m.gameName.toLowerCase() === gameName.toLowerCase() && m.tagLine.toLowerCase() === tagLine.toLowerCase()
      );

      if (existing) {
        return NextResponse.json({ success: true, lobby, message: 'Déjà membre du salon' });
      }

      if (lobby.members.length >= lobby.maxSlots) {
        return NextResponse.json({ success: false, error: 'Le salon est complet' }, { status: 400 });
      }

      const newMember: LobbyMember = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        gameName,
        tagLine,
        rank: isPrivateRank ? 'Privé' : rank || 'Non-classé',
        rankUrl: isPrivateRank ? '' : rankUrl || '',
        rankTier: rankTier ?? 12,
        isPrivateRank: !!isPrivateRank,
        roles: Array.isArray(roles) && roles.length > 0 ? roles : ['Tous Rôles'],
        isLeader: false,
        avatarUrl,
      };

      lobby.members.push(newMember);
      lobby.currentSlots = lobby.members.length;

      // Add system announcement in chat
      const joinMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderName: 'Système',
        senderTag: 'SPYCAM',
        content: `${gameName}#${tagLine} a rejoint le salon !`,
        timestamp: Date.now(),
      };
      lobby.chat.push(joinMsg);

      return NextResponse.json({ success: true, lobby, member: newMember });
    }

    // Action 2: Send Chat Message
    if (body.action === 'chat') {
      const { senderName, senderTag, senderAvatar, content } = body;
      if (!content || !content.trim()) {
        return NextResponse.json({ success: false, error: 'Message vide' }, { status: 400 });
      }

      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderName: senderName || 'Joueur',
        senderTag: senderTag || 'EUW',
        senderAvatar,
        content: content.trim(),
        timestamp: Date.now(),
      };

      lobby.chat.push(msg);
      // Keep last 100 messages
      if (lobby.chat.length > 100) {
        lobby.chat = lobby.chat.slice(-100);
      }

      return NextResponse.json({ success: true, message: msg, chat: lobby.chat });
    }

    // Action 3: Leave Lobby
    if (body.action === 'leave') {
      const { gameName, tagLine } = body;
      lobby.members = lobby.members.filter(
        (m) => !(m.gameName.toLowerCase() === gameName?.toLowerCase() && m.tagLine.toLowerCase() === tagLine?.toLowerCase())
      );
      lobby.currentSlots = lobby.members.length;

      // If leader leaves or empty, remove lobby
      if (lobby.members.length === 0 || (lobby.leaderName.toLowerCase() === gameName?.toLowerCase() && lobby.leaderTag.toLowerCase() === tagLine?.toLowerCase())) {
        global._spycam_lobbies = global._spycam_lobbies!.filter((l) => l.id !== id);
        return NextResponse.json({ success: true, removed: true });
      }

      const leaveMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderName: 'Système',
        senderTag: 'SPYCAM',
        content: `${gameName}#${tagLine} a quitté le salon.`,
        timestamp: Date.now(),
      };
      lobby.chat.push(leaveMsg);

      return NextResponse.json({ success: true, lobby });
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (global._spycam_lobbies) {
    global._spycam_lobbies = global._spycam_lobbies.filter((l) => l.id !== id);
  }
  return NextResponse.json({ success: true });
}
