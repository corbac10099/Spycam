import { NextRequest, NextResponse } from 'next/server';
import { LobbyMember, ChatMessage, VoiceMember, VoiceTranscriptLog } from '../route';
import { filterToxicText } from '@/lib/moderation';

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

    // ACTION 1 : JOIN LOBBY
    if (body.action === 'join') {
      const { gameName, tagLine, rank, rankUrl, rankTier = 12, isPrivateRank = false, roles = ['Tous Rôles'], avatarUrl } = body;

      if (!gameName || !tagLine) {
        return NextResponse.json({ success: false, error: 'Pseudo et Tag requis' }, { status: 400 });
      }

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

    // ACTION 2 : SEND MODERATED CHAT MESSAGE
    if (body.action === 'chat') {
      const { senderName, senderTag, senderAvatar, content } = body;
      if (!content || !content.trim()) {
        return NextResponse.json({ success: false, error: 'Message vide' }, { status: 400 });
      }

      // Run auto-moderation filter on text
      const modResult = filterToxicText(content.trim());

      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderName: senderName || 'Joueur',
        senderTag: senderTag || 'EUW',
        senderAvatar,
        content: modResult.cleanText,
        timestamp: Date.now(),
        isToxic: modResult.isToxic,
      };

      lobby.chat.push(msg);
      if (lobby.chat.length > 100) {
        lobby.chat = lobby.chat.slice(-100);
      }

      return NextResponse.json({ success: true, message: msg, chat: lobby.chat, isToxic: modResult.isToxic });
    }

    // ACTION 3 : VOICE JOIN (Décrocher 📞)
    if (body.action === 'voice-join') {
      const { memberId, gameName, tagLine, avatarUrl, rank, isPrivateRank } = body;
      if (!lobby.voiceMembers) lobby.voiceMembers = [];

      const existingIndex = lobby.voiceMembers.findIndex(
        (v) => v.gameName.toLowerCase() === gameName?.toLowerCase() && v.tagLine.toLowerCase() === tagLine?.toLowerCase()
      );

      if (existingIndex === -1) {
        const newVoiceMember: VoiceMember = {
          memberId: memberId || `v_${Date.now()}`,
          gameName: gameName || 'Joueur',
          tagLine: tagLine || 'EUW',
          avatarUrl,
          rank,
          isPrivateRank,
          isSpeaking: false,
          isMuted: false,
          joinedAt: Date.now(),
        };
        lobby.voiceMembers.push(newVoiceMember);

        // System notification in chat
        lobby.chat.push({
          id: `msg_${Date.now()}`,
          senderName: 'Système',
          senderTag: 'SPYCAM',
          content: `📞 ${gameName}#${tagLine} a rejoint le canal vocal.`,
          timestamp: Date.now(),
        });
      }

      return NextResponse.json({ success: true, voiceMembers: lobby.voiceMembers });
    }

    // ACTION 4 : VOICE LEAVE (Raccrocher 🔴)
    if (body.action === 'voice-leave') {
      const { gameName, tagLine } = body;
      if (lobby.voiceMembers) {
        lobby.voiceMembers = lobby.voiceMembers.filter(
          (v) => !(v.gameName.toLowerCase() === gameName?.toLowerCase() && v.tagLine.toLowerCase() === tagLine?.toLowerCase())
        );

        lobby.chat.push({
          id: `msg_${Date.now()}`,
          senderName: 'Système',
          senderTag: 'SPYCAM',
          content: `🔴 ${gameName}#${tagLine} a quitté le canal vocal.`,
          timestamp: Date.now(),
        });
      }

      return NextResponse.json({ success: true, voiceMembers: lobby.voiceMembers || [] });
    }

    // ACTION 5 : VOICE STATE (Speaking / Mute sync)
    if (body.action === 'voice-state') {
      const { gameName, tagLine, isSpeaking, isMuted } = body;
      if (lobby.voiceMembers) {
        const member = lobby.voiceMembers.find(
          (v) => v.gameName.toLowerCase() === gameName?.toLowerCase() && v.tagLine.toLowerCase() === tagLine?.toLowerCase()
        );
        if (member) {
          if (typeof isSpeaking === 'boolean') member.isSpeaking = isSpeaking;
          if (typeof isMuted === 'boolean') member.isMuted = isMuted;
        }
      }
      return NextResponse.json({ success: true, voiceMembers: lobby.voiceMembers || [] });
    }

    // ACTION 6 : VOICE TRANSCRIPT AUDIT LOG
    if (body.action === 'voice-transcript') {
      const { senderName, senderTag, content } = body;
      if (content && content.trim()) {
        const mod = filterToxicText(content.trim());
        const logEntry: VoiceTranscriptLog = {
          id: `vt_${Date.now()}`,
          senderName: senderName || 'Joueur',
          senderTag: senderTag || 'EUW',
          content: mod.cleanText,
          timestamp: Date.now(),
          isToxic: mod.isToxic,
        };

        if (!lobby.voiceTranscripts) lobby.voiceTranscripts = [];
        lobby.voiceTranscripts.push(logEntry);

        // Keep last 150 voice logs
        if (lobby.voiceTranscripts.length > 150) {
          lobby.voiceTranscripts = lobby.voiceTranscripts.slice(-150);
        }
      }
      return NextResponse.json({ success: true });
    }

    // ACTION 7 : LEAVE LOBBY
    if (body.action === 'leave') {
      const { gameName, tagLine } = body;
      lobby.members = lobby.members.filter(
        (m) => !(m.gameName.toLowerCase() === gameName?.toLowerCase() && m.tagLine.toLowerCase() === tagLine?.toLowerCase())
      );
      if (lobby.voiceMembers) {
        lobby.voiceMembers = lobby.voiceMembers.filter(
          (v) => !(v.gameName.toLowerCase() === gameName?.toLowerCase() && v.tagLine.toLowerCase() === tagLine?.toLowerCase())
        );
      }
      lobby.currentSlots = lobby.members.length;

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
