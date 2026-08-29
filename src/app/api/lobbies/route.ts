import { NextRequest, NextResponse } from 'next/server';
import { filterToxicText } from '@/lib/moderation';

export interface LobbyMember {
  id: string;
  gameName: string;
  tagLine: string;
  rank: string;
  rankUrl?: string;
  rankTier?: number;
  isPrivateRank?: boolean;
  roles: string[];
  isLeader?: boolean;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderTag: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  isToxic?: boolean;
}

export interface VoiceMember {
  memberId: string;
  gameName: string;
  tagLine: string;
  avatarUrl?: string;
  rank?: string;
  isPrivateRank?: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  joinedAt: number;
}

export interface VoiceTranscriptLog {
  id: string;
  senderName: string;
  senderTag: string;
  content: string;
  timestamp: number;
  isToxic?: boolean;
}

export interface LobbyItem {
  id: string;
  leaderName: string;
  leaderTag: string;
  leaderRank: string;
  leaderRankUrl?: string;
  leaderRankTier: number;
  isLeaderPrivate: boolean;
  leaderAvatar?: string;
  members: LobbyMember[];
  voiceMembers: VoiceMember[];
  voiceTranscripts: VoiceTranscriptLog[];
  mode: string;
  roleNeeded: string[];
  micRequired: 'yes' | 'no' | 'optional';
  maxSlots: number;
  currentSlots: number;
  note: string;
  createdAt: number;
  expiresAt: number; // 7 days audit retention
  region: string;
  lobbyLevel: string;
  lobbyLevelTier: number;
  chat: ChatMessage[];
}

export function getTierName(avgTier: number): string {
  if (avgTier <= 5) return 'Fer';
  if (avgTier <= 8) return 'Bronze';
  if (avgTier <= 11) return 'Argent';
  if (avgTier <= 14) return 'Or';
  if (avgTier <= 17) return 'Platine';
  if (avgTier <= 20) return 'Diamant';
  if (avgTier <= 23) return 'Ascendant';
  if (avgTier <= 26) return 'Immortel';
  return 'Radiant';
}

declare global {
  // eslint-disable-next-line no-var
  var _spycam_lobbies: LobbyItem[] | undefined;
}

if (!global._spycam_lobbies) {
  global._spycam_lobbies = [
    {
      id: 'lobby_demo_1',
      leaderName: 'Shadow',
      leaderTag: 'BETA',
      leaderRank: 'Ascendant 2',
      leaderRankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png',
      leaderRankTier: 22,
      isLeaderPrivate: false,
      leaderAvatar: 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png',
      members: [
        {
          id: 'mem_1',
          gameName: 'Shadow',
          tagLine: 'BETA',
          rank: 'Ascendant 2',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png',
          rankTier: 22,
          isPrivateRank: false,
          roles: ['Duelliste', 'Initiateur'],
          isLeader: true,
          avatarUrl: 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png',
        },
        {
          id: 'mem_2',
          gameName: 'ViperMain',
          tagLine: 'FR1',
          rank: 'Diamant 3',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/largeicon.png',
          rankTier: 20,
          isPrivateRank: false,
          roles: ['Contrôleur'],
          isLeader: false,
        },
      ],
      voiceMembers: [
        {
          memberId: 'mem_1',
          gameName: 'Shadow',
          tagLine: 'BETA',
          avatarUrl: 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/smallart.png',
          rank: 'Ascendant 2',
          isPrivateRank: false,
          isSpeaking: false,
          isMuted: false,
          joinedAt: Date.now() - 1000 * 60 * 10,
        },
      ],
      voiceTranscripts: [],
      mode: 'Compétitif',
      roleNeeded: ['Initiateur', 'Sentinelle'],
      micRequired: 'yes',
      maxSlots: 5,
      currentSlots: 2,
      note: 'Duo cherche bon Initiateur et Sentinelle pour push Ascendant / Immortel ce soir ! Vocal Spycam sécurisé.',
      createdAt: Date.now() - 1000 * 60 * 15,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      region: 'EU / Paris',
      lobbyLevel: 'Ascendant 1',
      lobbyLevelTier: 21,
      chat: [
        {
          id: 'msg_1',
          senderName: 'Shadow',
          senderTag: 'BETA',
          content: 'Bienvenue dans le salon ! On part dès qu’on est au moins 4.',
          timestamp: Date.now() - 1000 * 60 * 14,
        },
      ],
    },
    {
      id: 'lobby_demo_2',
      leaderName: 'Kyojin',
      leaderTag: '0001',
      leaderRank: 'Platine 2',
      leaderRankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png',
      leaderRankTier: 16,
      isLeaderPrivate: false,
      members: [
        {
          id: 'mem_3',
          gameName: 'Kyojin',
          tagLine: '0001',
          rank: 'Platine 2',
          rankUrl: 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png',
          rankTier: 16,
          isPrivateRank: false,
          roles: ['Duelliste'],
          isLeader: true,
        },
        {
          id: 'mem_4',
          gameName: 'Ghosty',
          tagLine: 'EUW',
          rank: 'Privé',
          isPrivateRank: true,
          roles: ['Contrôleur', 'Sentinelle'],
          isLeader: false,
        },
      ],
      voiceMembers: [],
      voiceTranscripts: [],
      mode: 'Compétitif',
      roleNeeded: ['Duelliste', 'Initiateur'],
      micRequired: 'yes',
      maxSlots: 5,
      currentSlots: 2,
      note: 'Recherche joueurs réguliers Platine / Diamant.',
      createdAt: Date.now() - 1000 * 60 * 35,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
      region: 'EU / Frankfurt',
      lobbyLevel: 'Platine 2',
      lobbyLevelTier: 16,
      chat: [],
    },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const role = searchParams.get('role');
  const minTier = searchParams.get('minTier') ? parseInt(searchParams.get('minTier')!) : null;
  const maxTier = searchParams.get('maxTier') ? parseInt(searchParams.get('maxTier')!) : null;

  // Clean lobbies older than 24 hours from public listing (logs retained in memory/database)
  const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;
  global._spycam_lobbies = (global._spycam_lobbies || []).filter((l) => l.createdAt > oneDayAgo);

  let filtered = [...global._spycam_lobbies];

  if (mode && mode !== 'all') {
    filtered = filtered.filter((l) => l.mode === mode);
  }

  if (role && role !== 'all') {
    filtered = filtered.filter((l) => l.roleNeeded.includes(role) || l.roleNeeded.includes('Tous Rôles'));
  }

  if (minTier !== null && maxTier !== null) {
    filtered = filtered.filter((l) => l.lobbyLevelTier >= minTier - 4 && l.lobbyLevelTier <= maxTier + 4);
  }

  return NextResponse.json({
    success: true,
    lobbies: filtered.sort((a, b) => b.createdAt - a.createdAt),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leaderName,
      leaderTag,
      leaderRank,
      leaderRankUrl,
      leaderRankTier = 12,
      isLeaderPrivate = false,
      leaderAvatar,
      members = [],
      mode = 'Compétitif',
      roleNeeded = ['Tous Rôles'],
      micRequired = 'yes',
      maxSlots = 5,
      note = '',
      region = 'EU / Paris',
    } = body;

    if (!leaderName || !leaderTag) {
      return NextResponse.json({ success: false, error: 'Pseudo et Tag requis' }, { status: 400 });
    }

    if (isLeaderPrivate) {
      return NextResponse.json(
        { success: false, error: 'Votre profil doit être public pour créer un salon.' },
        { status: 403 }
      );
    }

    const cleanNote = filterToxicText(note).cleanText;

    const fullMembers: LobbyMember[] = [
      {
        id: `mem_${Date.now()}_0`,
        gameName: leaderName,
        tagLine: leaderTag,
        rank: leaderRank || 'Non-classé',
        rankUrl: leaderRankUrl || '',
        rankTier: leaderRankTier,
        isPrivateRank: false,
        roles: body.leaderRoles || ['Tous Rôles'],
        isLeader: true,
        avatarUrl: leaderAvatar,
      },
      ...members.map((m: any, idx: number) => ({
        id: `mem_${Date.now()}_${idx + 1}`,
        gameName: m.gameName,
        tagLine: m.tagLine,
        rank: m.isPrivateRank ? 'Privé' : m.rank || 'Non-classé',
        rankUrl: m.isPrivateRank ? '' : m.rankUrl || '',
        rankTier: m.rankTier ?? 12,
        isPrivateRank: !!m.isPrivateRank,
        roles: m.roles || ['Tous Rôles'],
        isLeader: false,
        avatarUrl: m.avatarUrl,
      })),
    ];

    const knownTiers = fullMembers.filter((m) => !m.isPrivateRank && m.rankTier && m.rankTier > 0).map((m) => m.rankTier!);
    const avgTier = knownTiers.length > 0 ? Math.round(knownTiers.reduce((a, b) => a + b, 0) / knownTiers.length) : leaderRankTier || 12;
    const lobbyLevel = getTierName(avgTier);

    const now = Date.now();
    const newLobby: LobbyItem = {
      id: `lobby_${now}_${Math.random().toString(36).substring(2, 7)}`,
      leaderName,
      leaderTag,
      leaderRank: leaderRank || 'Non-classé',
      leaderRankUrl: leaderRankUrl || '',
      leaderRankTier: leaderRankTier || 12,
      isLeaderPrivate: false,
      leaderAvatar: leaderAvatar || '',
      members: fullMembers,
      voiceMembers: [],
      voiceTranscripts: [],
      mode,
      roleNeeded: Array.isArray(roleNeeded) && roleNeeded.length > 0 ? roleNeeded : ['Tous Rôles'],
      micRequired,
      maxSlots: Number(maxSlots) || 5,
      currentSlots: fullMembers.length,
      note: cleanNote || 'Recherche coéquipiers pour session ranked !',
      createdAt: now,
      expiresAt: now + 1000 * 60 * 60 * 24 * 7, // 7 days log retention
      region,
      lobbyLevel,
      lobbyLevelTier: avgTier,
      chat: [
        {
          id: `msg_${now}`,
          senderName: 'Système',
          senderTag: 'SPYCAM',
          content: `Salon créé par ${leaderName}#${leaderTag} • Niveau estimé : ${lobbyLevel} • 🛡️ Chat modéré automatiquement`,
          timestamp: now,
        },
      ],
    };

    if (!global._spycam_lobbies) global._spycam_lobbies = [];
    global._spycam_lobbies.unshift(newLobby);

    return NextResponse.json({
      success: true,
      lobby: newLobby,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
